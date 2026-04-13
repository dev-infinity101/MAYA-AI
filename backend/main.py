import asyncio
import json
import logging
import uuid
from contextlib import asynccontextmanager
from typing import List, Optional, Dict, Any, AsyncGenerator

import uvicorn
from fastapi import FastAPI, Depends, HTTPException, status, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from langchain_core.messages import HumanMessage

from database import engine, Base, get_db, AsyncSessionLocal
import models
from models import Conversation, Message, OutcomeTracking
from services.scheme_service import scheme_service
from services.gemini_service import gemini_service
from services.message_service import save_message
from services.user_service import get_or_create_user
from middleware.auth import get_optional_user_id
from agents.graph import app_graph
from routers.draft import router as draft_router
from routers.user import router as user_router
from routers.whatsapp import router as whatsapp_router
import schemas

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────────────────────────────────────
# LIFESPAN
# ──────────────────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 MAYA AI Backend Starting...")
    try:
        # Create tables — Alembic is now the canonical migration tool,
        # but create_all is kept as a safe fallback for local dev.
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("✅ Database initialized successfully.")
    except Exception as e:
        logger.error(f"❌ Initialization Error: {e}")

    # Pre-warm Gemini — eliminates the ~1.5s cold-start on first real call.
    # create_task runs this in the background so the server starts accepting
    # requests immediately — do NOT use await here.
    async def _prewarm():
        try:
            await gemini_service.generate_response("hello")
            logger.info("✅ Gemini pre-warmed successfully.")
        except Exception as e:
            logger.warning(f"⚠️  Gemini pre-warm failed (non-critical): {e}")
    asyncio.create_task(_prewarm())

    async def _keep_db_alive():
        """
        Neon suspends after 5 min inactivity.
        We ping every 4 min to prevent suspension entirely.
        This is the single most impactful fix for your latency.
        """
        while True:
            try:
                async with AsyncSessionLocal() as db:
                    await db.execute(text("SELECT 1"))
            except Exception as e:
                logger.warning(f"DB keepalive failed: {e}")
            await asyncio.sleep(240)  # 4 minutes

    # Keep Neon awake — ping every 4 minutes (creates a background worker task)
    keepalive_task = asyncio.create_task(_keep_db_alive())

    yield
    
    logger.info("🛑 MAYA AI Backend Shutting Down...")
    keepalive_task.cancel()
    
    from services.jina_service import jina_service
    await jina_service.close()


# ──────────────────────────────────────────────────────────────────────────────
# APP & CORS
# ──────────────────────────────────────────────────────────────────────────────

app = FastAPI(title="MAYA AI - Multi-Agent System", lifespan=lifespan)

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(draft_router)
app.include_router(user_router)
app.include_router(whatsapp_router)


# ──────────────────────────────────────────────────────────────────────────────
# HEALTH
# ──────────────────────────────────────────────────────────────────────────────

@app.get("/api/health", tags=["Health"])
async def health():
    return {"status": "ok", "service": "MAYA API"}


@app.get("/", tags=["Health"])
async def root():
    return {"status": "online", "system": "MAYA Multi-Agent AI", "version": "2.0.0"}


# ──────────────────────────────────────────────────────────────────────────────
# HELPER: Build prompt per agent
# ──────────────────────────────────────────────────────────────────────────────

def _build_agent_prompt(message: str, agent: str) -> tuple[str, str]:
    """Returns (agent_name, prompt) — keeps prompt logic out of the endpoint."""
    base = """CRITICAL: Do NOT start with a greeting.
When presenting comparative data, loan amounts, scheme lists, 
pricing options, or any structured information — always use 
markdown tables for clarity. Use **bold** for important numbers 
and terms."""
    prompts = {
        "market":    ("market",    f"You are an expert Market Research Analyst for MSMEs in India.\nQuery: {message}\n{base}"),
        "brand":     ("brand",     f"You are a creative Brand Consultant for Indian MSMEs.\nQuery: {message}\nProvide 3-5 distinct options.\n{base}"),
        "finance":   ("finance",   f"You are a Financial Advisor for MSMEs.\nQuery: {message}\nNo specific legal/tax advice.\n{base}"),
        "marketing": ("marketing", f"You are a Marketing Strategist for small businesses.\nQuery: {message}\nFocus on low-cost, immediate steps.\n{base}"),
    }
    return prompts.get(agent, ("general", f"Answer this helpfully: {message}\n{base}"))


# ──────────────────────────────────────────────────────────────────────────────
# ENDPOINT: Main Agent Chat (scheme queries + legacy text queries)
# ──────────────────────────────────────────────────────────────────────────────

@app.post("/api/chat/agent", response_model=schemas.ChatResponse, tags=["Chat"])
async def chat_agent(
    request: schemas.ChatRequest,
    db: AsyncSession = Depends(get_db),
    clerk_user_id: str | None = Depends(get_optional_user_id),
):
    """
    Main Entry Point: Routes query via LangGraph and returns
    structured response (scheme cards or text).

    V2: Creates/reuses a Conversation row, saves user message,
    passes conversation_id through the graph, returns conversation_id.
    """
    # ── Upsert user on every authenticated request ───────────────────────────
    effective_user_id = clerk_user_id or request.clerk_user_id
    if effective_user_id:
        try:
            await get_or_create_user(db, effective_user_id)
        except Exception as e:
            logger.warning(f"User upsert failed (non-fatal): {e}")

    # ── Create or reuse conversation ─────────────────────────────────────────
    conversation_id = request.conversation_id or request.session_id
    if not conversation_id:
        try:
            conversation = Conversation(
                clerk_user_id=effective_user_id,
                title=request.message[:50]
            )
            db.add(conversation)
            await db.commit()
            await db.refresh(conversation)
            conversation_id = str(conversation.id)
        except Exception as e:
            logger.warning(f"Could not create Conversation row: {e}. Using ephemeral ID.")
            conversation_id = str(uuid.uuid4())

    logger.info(f"Processing chat request for conversation {conversation_id}")

    try:
        # ── Save user message ─────────────────────────────────────────────────
        try:
            await save_message(
                db=db,
                conversation_id=uuid.UUID(conversation_id),
                role="user",
                content_type="text",
                content={"text": request.message},
                agent_used=None
            )
        except Exception as e:
            logger.warning(f"Failed to save user message: {e}")

        # ── Prepare LangGraph input ───────────────────────────────────────────
        initial_state = {
            "messages": [HumanMessage(content=request.message)],
            "user_profile": request.user_profile or {"location": "Uttar Pradesh"},
            "schemes": [],
            "conversation_id": conversation_id,         # V2: flows through all nodes
            "clerk_user_id": request.clerk_user_id or ""
        }

        # ── Invoke LangGraph ──────────────────────────────────────────────────
        config = {"configurable": {"thread_id": conversation_id}}
        result = await app_graph.ainvoke(initial_state, config)

        # ── Extract output ────────────────────────────────────────────────────
        last_message_content = result["messages"][-1].content

        # FIX: Ensure content is always a string
        if isinstance(last_message_content, list):
            text_parts = []
            for block in last_message_content:
                if isinstance(block, dict):
                    if 'text' in block:
                        text_parts.append(block['text'])
                elif isinstance(block, str):
                    text_parts.append(block)
            last_message_content = "\n".join(text_parts)

        agent_name = result.get("current_agent", "MAYA")
        found_schemes = result.get("schemes", [])

        # NOTE: Agent nodes now save their own responses to DB.
        # main.py no longer saves the assistant message — that would double-save.

        return schemas.ChatResponse(
            response=last_message_content,
            agent=agent_name,
            session_id=conversation_id,          # legacy compat
            conversation_id=conversation_id,      # V2
            schemes=found_schemes
        )

    except Exception as e:
        logger.error(f"🔥 Critical Graph Error: {e}", exc_info=True)
        error_str = str(e).lower()

        if "validation error" in error_str:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Response validation failed: {str(e)}"
            )
        if "connection" in error_str or "refused" in error_str or "getaddrinfo" in error_str:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="I'm having trouble connecting to my database. Please check the backend connection."
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="MAYA agents are currently unavailable. Please try again later."
        )


# ──────────────────────────────────────────────────────────────────────────────
# ENDPOINT: Streaming Chat (SSE — text agents only)
# ──────────────────────────────────────────────────────────────────────────────

@app.post("/api/chat/stream", tags=["Chat"])
async def chat_stream(
    request: schemas.ChatRequest,
    db: AsyncSession = Depends(get_db),
    clerk_user_id: str | None = Depends(get_optional_user_id),
):
    """
    Server-Sent Events (SSE) endpoint for text-agent streaming.

    SSE format: each message is  data: {json}\\n\\n
    Frontend reads these chunks as they arrive and appends to UI.

    Three event types:
      init  → carries conversation_id, sent first
      chunk → carries text piece, sent many times
      done  → signals stream complete, sent once at end
      error → stream was interrupted

    NOTE: Scheme queries should still go to /api/chat/agent (JSON flow).
    This endpoint is for market, brand, finance, marketing, general.
    """
    # ── Upsert user ──────────────────────────────────────────────────────────
    effective_user_id = clerk_user_id or request.clerk_user_id
    if effective_user_id:
        try:
            await get_or_create_user(db, effective_user_id)
        except Exception as e:
            logger.warning(f"User upsert failed (non-fatal): {e}")

    # ── Create conversation if needed ─────────────────────────────────────────
    conversation_id = request.conversation_id or request.session_id
    if not conversation_id:
        try:
            conversation = Conversation(
                clerk_user_id=effective_user_id,
                title=request.message[:50]
            )
            db.add(conversation)
            await db.commit()
            await db.refresh(conversation)
            conversation_id = str(conversation.id)
        except Exception as e:
            logger.warning(f"Could not create Conversation for stream: {e}")
            conversation_id = str(uuid.uuid4())

    # ── Save user message immediately ─────────────────────────────────────────
    try:
        await save_message(
            db=db,
            conversation_id=uuid.UUID(conversation_id),
            role="user",
            content_type="text",
            content={"text": request.message},
            agent_used=None
        )
    except Exception as e:
        logger.warning(f"Could not save user stream message: {e}")

    # ── Build prompt for the requested agent ──────────────────────────────────
    agent_name, prompt = _build_agent_prompt(request.message, request.agent or "general")

    # ── SSE generator with 15s keepalive ping ─────────────────────────────────
    async def event_stream() -> AsyncGenerator[str, None]:
        import time
        full_response = ""
        PING_INTERVAL = 15  # seconds between keepalive pings
        first_chunk = True
        t0 = time.time()

        try:
            # Send conversation_id first so frontend can store it immediately
            yield f"data: {json.dumps({'type': 'init', 'conversation_id': conversation_id})}\n\n"

            # Use a Queue so we can interleave generator chunks and ping logic
            queue: asyncio.Queue[str | Exception | None] = asyncio.Queue()

            async def _feed_queue():
                """Reads chunks from Gemini and puts them into the queue. Sends None when done."""
                try:
                    async for chunk in gemini_service.generate_stream(prompt):
                        await queue.put(chunk)
                except Exception as e:
                    logger.error(f"Gemini stream feed error: {e}")
                    await queue.put(e)
                finally:
                    await queue.put(None)  # sentinel

            feed_task = asyncio.create_task(_feed_queue())

            while True:
                try:
                    # Wait for next chunk, but only up to PING_INTERVAL seconds
                    chunk = await asyncio.wait_for(queue.get(), timeout=PING_INTERVAL)
                except asyncio.TimeoutError:
                    # No chunk arrived — send a keepalive ping to hold the connection
                    yield f"data: {json.dumps({'type': 'ping'})}\n\n"
                    continue

                if chunk is None:
                    break  # sentinel received — stream is complete

                if isinstance(chunk, Exception):
                    # API key exhausted or other LLM failure
                    error_msg = "agent not available"
                    full_response = error_msg
                    yield f"data: {json.dumps({'type': 'error', 'message': error_msg})}\n\n"
                    break

                if first_chunk:
                    logger.info(f"⏱️  Time to first chunk: {time.time() - t0:.2f}s")
                    first_chunk = False

                full_response += chunk
                yield f"data: {json.dumps({'type': 'chunk', 'text': chunk})}\n\n"

            yield f"data: {json.dumps({'type': 'done'})}\n\n"

            # Save AFTER stream ends — full response is now assembled
            async with AsyncSessionLocal() as save_db:
                await save_message(
                    db=save_db,
                    conversation_id=uuid.UUID(conversation_id),
                    role="assistant",
                    content_type="agent_response",
                    content={
                        "agent": agent_name,
                        "summary": full_response,
                        "sections": [],
                        "sources": []
                    },
                    agent_used=agent_name
                )

        except Exception as e:
            logger.error(f"Stream error: {e}")
            yield f"data: {json.dumps({'type': 'error', 'message': 'Stream interrupted'})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # prevents Nginx from buffering chunks
        }
    )


# ──────────────────────────────────────────────────────────────────────────────
# HISTORY & MANAGEMENT ENDPOINTS
# (These now query the new conversations + messages tables)
# ──────────────────────────────────────────────────────────────────────────────

@app.get("/api/history/sessions", tags=["History"])
async def get_sessions(db: AsyncSession = Depends(get_db)):
    """Returns a list of conversation IDs (most recent first)."""
    try:
        from sqlalchemy import select, desc
        stmt = select(Conversation.id, Conversation.title, Conversation.updated_at)\
            .order_by(desc(Conversation.updated_at))\
            .limit(50)
        result = await db.execute(stmt)
        rows = result.all()
        sessions = [{"id": str(r.id), "title": r.title or f"Chat {str(r.id)[:8]}"} for r in rows]
        return {"sessions": sessions}
    except Exception as e:
        logger.error(f"Error fetching sessions: {e}")
        return {"sessions": []}


@app.get("/api/history/{conversation_id}", tags=["History"])
async def get_conversation_history(conversation_id: str, db: AsyncSession = Depends(get_db)):
    """Returns all messages for a conversation, ordered oldest first."""
    try:
        from sqlalchemy import select
        from models import Message
        stmt = select(Message)\
            .where(Message.conversation_id == uuid.UUID(conversation_id))\
            .order_by(Message.created_at.asc())
        result = await db.execute(stmt)
        messages = result.scalars().all()
        history = []
        for msg in messages:
            history.append({
                "id": str(msg.id),
                "role": msg.role,
                "content_type": msg.content_type,
                "content": msg.content,
                "agent_used": msg.agent_used,
                "timestamp": msg.created_at.isoformat() if msg.created_at else None,
            })
        return {"conversation_id": conversation_id, "history": history}
    except Exception as e:
        logger.error(f"Error fetching history for {conversation_id}: {e}")
        return {"conversation_id": conversation_id, "history": []}


@app.put("/api/history/{conversation_id}", tags=["History"])
async def rename_conversation(conversation_id: str, payload: dict = Body(...), db: AsyncSession = Depends(get_db)):
    """Renames a conversation title."""
    try:
        from sqlalchemy import update
        new_title = payload.get("title")
        if not new_title:
            raise HTTPException(status_code=400, detail="Title is required")
        
        stmt = update(Conversation).where(Conversation.id == uuid.UUID(conversation_id)).values(title=new_title)
        await db.execute(stmt)
        await db.commit()
        return {"status": "success", "title": new_title}
    except Exception as e:
        logger.error(f"Error renaming conversation {conversation_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.delete("/api/history/{conversation_id}", tags=["History"])
async def delete_conversation(conversation_id: str, db: AsyncSession = Depends(get_db)):
    """Deletes a conversation and cascaded messages."""
    try:
        from sqlalchemy import delete
        stmt = delete(Conversation).where(Conversation.id == uuid.UUID(conversation_id))
        result = await db.execute(stmt)
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Conversation not found")
        await db.commit()
        return {"status": "success"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting conversation {conversation_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.get("/api/admin/migrate")
async def admin_migrate():
    from sqlalchemy import text
    async with engine.begin() as conn:
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS outcome_tracking (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                clerk_user_id VARCHAR REFERENCES users(clerk_user_id) ON DELETE SET NULL,
                scheme_id INTEGER REFERENCES schemes(id) ON DELETE SET NULL,
                draft_generated BOOLEAN DEFAULT FALSE,
                draft_date TIMESTAMP,
                submitted BOOLEAN DEFAULT FALSE,
                submit_date TIMESTAMP,
                approved BOOLEAN,
                amount_approved INTEGER,
                reported_at TIMESTAMP DEFAULT NOW()
            );
        """))
        await conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_outcome_tracking_user 
            ON outcome_tracking(clerk_user_id);
        """))
    return {"status": "table created successfully"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
