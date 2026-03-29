import json
import uuid
from contextlib import asynccontextmanager
from typing import Any, Dict, List, Optional

import models
import uvicorn
from agents.graph import app_graph
from agents.orchestrator import run_query, stream_query
from core.auth import get_current_user
from core.db_maintenance import ensure_database_features
from database import Base, engine, get_db
from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from langchain_core.messages import HumanMessage
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from services.chat_history_service import chat_history_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("MAYA AI Backend Starting...")
    try:
        async with engine.begin() as conn:
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS pg_trgm"))
            await conn.run_sync(Base.metadata.create_all)
        await ensure_database_features(engine)
        print("Database initialized successfully.")
    except Exception as e:
        print(f"Initialization Error: {e}")
    yield
    print("MAYA AI Backend Shutting Down...")


app = FastAPI(title="MAYA AI - Multi-Agent System", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    user_profile: Optional[Dict[str, Any]] = None
    attachments: Optional[List[str]] = []


class ChatResponse(BaseModel):
    response: str
    agent: str
    session_id: str
    schemes: List[Dict[str, Any]] = []


class SessionMetaUpdateRequest(BaseModel):
    title: Optional[str] = None
    pinned: Optional[bool] = None


async def _run_graph_fallback(request: ChatRequest, session_id: str) -> Dict[str, Any]:
    """
    Keep the legacy graph path for attachment-based prompts until multimodal
    streaming is implemented.
    """
    content_blocks = [{"type": "text", "text": request.message}]
    if request.attachments:
        for b64_img in request.attachments:
            content_blocks.append({"type": "image_url", "image_url": {"url": b64_img}})

    initial_state = {
        "messages": [HumanMessage(content=content_blocks)],
        "user_profile": request.user_profile or {"location": "Uttar Pradesh"},
        "schemes": [],
    }
    config = {"configurable": {"thread_id": session_id}}
    result = await app_graph.ainvoke(initial_state, config)
    return {
        "response": result["messages"][-1].content,
        "agent": result.get("current_agent", "MAYA"),
        "schemes": result.get("schemes", []),
    }


async def _stream_chat_events(
    request: ChatRequest,
    session_id: str,
    db: AsyncSession,
    user_auth_id: str,
):
    try:
        yield json.dumps({"type": "session", "session_id": session_id}) + "\n"

        async for event in stream_query(request.message):
            if event["type"] == "done":
                await chat_history_service.save_message(
                    db,
                    session_id,
                    "assistant",
                    event["response"],
                    user_auth_id=user_auth_id,
                )
                event = {**event, "session_id": session_id}

            yield json.dumps(event) + "\n"
    except Exception as e:
        print(f"Streaming error: {e}")
        yield json.dumps(
            {
                "type": "error",
                "message": "MAYA ran into a problem while streaming this response. Please try again.",
            }
        ) + "\n"


@app.get("/")
async def root():
    return {"status": "online", "system": "MAYA Multi-Agent AI"}


@app.get("/me")
async def me(user=Depends(get_current_user)):
    return {
        "id": user.get("id"),
        "email": user.get("email"),
        "role": user.get("role"),
        "metadata": user.get("user_metadata"),
    }


@app.post("/api/chat/agent", response_model=ChatResponse)
async def chat_agent(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    user: Dict[str, Any] = Depends(get_current_user),
):
    try:
        session_id = request.session_id or str(uuid.uuid4())
        user_auth_id = user.get("id")

        await chat_history_service.save_message(
            db,
            session_id,
            "user",
            request.message,
            user_auth_id=user_auth_id,
        )

        if request.attachments:
            result = await _run_graph_fallback(request, session_id)
        else:
            result = await run_query(request.message)

        await chat_history_service.save_message(
            db,
            session_id,
            "assistant",
            result["response"],
            user_auth_id=user_auth_id,
        )

        return ChatResponse(
            response=result["response"],
            agent=result["agent"],
            session_id=session_id,
            schemes=result.get("schemes", []),
        )
    except Exception as e:
        print(f"Critical chat error: {e}")
        raise HTTPException(status_code=500, detail="MAYA agents are out of sync. Please try again.")


@app.post("/api/chat/agent/stream")
async def chat_agent_stream(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    user: Dict[str, Any] = Depends(get_current_user),
):
    if request.attachments:
        raise HTTPException(
            status_code=400,
            detail="Streaming is currently supported for text prompts only.",
        )

    session_id = request.session_id or str(uuid.uuid4())
    user_auth_id = user.get("id")

    await chat_history_service.save_message(
        db,
        session_id,
        "user",
        request.message,
        user_auth_id=user_auth_id,
    )

    return StreamingResponse(
        _stream_chat_events(request, session_id, db, user_auth_id),
        media_type="application/x-ndjson",
    )


@app.get("/api/history/sessions")
async def get_sessions(
    db: AsyncSession = Depends(get_db),
    user: Dict[str, Any] = Depends(get_current_user),
):
    try:
        sessions = await chat_history_service.get_user_sessions(db, user.get("id"))
        return {"sessions": sessions}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/history/search")
async def search_sessions(
    q: str = Query(..., min_length=1),
    db: AsyncSession = Depends(get_db),
    user: Dict[str, Any] = Depends(get_current_user),
):
    try:
        sessions = await chat_history_service.search_user_sessions(db, user.get("id"), q)
        return {"sessions": sessions}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/history/{session_id}")
async def get_session_history(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    user: Dict[str, Any] = Depends(get_current_user),
):
    try:
        messages = await chat_history_service.get_session_history(db, session_id, user.get("id"))
        return {"session_id": session_id, "history": messages}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.patch("/api/history/{session_id}/meta")
async def update_session_meta(
    session_id: str,
    payload: SessionMetaUpdateRequest,
    db: AsyncSession = Depends(get_db),
    user: Dict[str, Any] = Depends(get_current_user),
):
    try:
        return await chat_history_service.update_session_meta(
            db,
            session_id,
            user.get("id"),
            title=payload.title,
            pinned=payload.pinned,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/history/{session_id}")
async def delete_session(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    user: Dict[str, Any] = Depends(get_current_user),
):
    try:
        await chat_history_service.delete_session(db, session_id, user.get("id"))
        return {"status": "success", "session_id": session_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
