import logging
import uuid
from contextlib import asynccontextmanager
from typing import List, Optional, Dict, Any

import uvicorn
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from langchain_core.messages import HumanMessage

from database import engine, Base, get_db
import models
from services.scheme_service import scheme_service
from services.chat_history_service import chat_history_service
from agents.graph import app_graph
import schemas

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 MAYA AI Backend Starting...")
    try:
        # Create tables (consider using Alembic for production migrations instead)
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("✅ Database initialized successfully.")
    except Exception as e:
        logger.error(f"❌ Initialization Error: {e}")
        # Consider whether to stop startup here
    yield
    logger.info("🛑 MAYA AI Backend Shutting Down...")

app = FastAPI(title="MAYA AI - Multi-Agent System", lifespan=lifespan)

# CORS Configuration
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

# --- Endpoints ---

@app.get("/", tags=["Health"])
async def root():
    return {"status": "online", "system": "MAYA Multi-Agent AI", "version": "1.0.0"}

@app.post("/api/chat/agent", response_model=schemas.ChatResponse, tags=["Chat"])
async def chat_agent(request: schemas.ChatRequest, db: AsyncSession = Depends(get_db)):
    """
    Main Entry Point: Routes query via LangGraph and returns 
    structured response for UI Cards.
    """
    session_id = request.session_id or str(uuid.uuid4())
    logger.info(f"Processing chat request for session {session_id}")

    try:
        # 1. Save User Message to DB
        try:
            await chat_history_service.save_message(db, session_id, "user", request.message)
        except Exception as e:
            logger.warning(f"Failed to save user message to history: {e}")

        # 2. Prepare LangGraph Input
        initial_state = {
            "messages": [HumanMessage(content=request.message)],
            "user_profile": request.user_profile or {"location": "Uttar Pradesh"},
            "schemes": [] 
        }

        # 3. Invoke LangGraph (Brain of MAYA)
        config = {"configurable": {"thread_id": session_id}}
        result = await app_graph.ainvoke(initial_state, config)
        
        # 4. Extract Output
        last_message_content = result["messages"][-1].content
        agent_name = result.get("current_agent", "MAYA")
        found_schemes = result.get("schemes", [])
        
        # 5. Save Assistant Message to DB
        try:
            await chat_history_service.save_message(db, session_id, "assistant", last_message_content)
        except Exception as e:
            logger.warning(f"Failed to save assistant message to history: {e}")
        
        return schemas.ChatResponse(
            response=last_message_content,
            agent=agent_name,
            session_id=session_id,
            schemes=found_schemes
        )

    except Exception as e:
        logger.error(f"🔥 Critical Graph Error: {e}", exc_info=True)
        error_str = str(e).lower()
        if "connection" in error_str or "refused" in error_str or "getaddrinfo" in error_str:
             raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="I'm having trouble connecting to my database. Please check the backend connection."
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="MAYA agents are currently unavailable. Please try again later."
        )

# --- History & Management Endpoints ---

@app.get("/api/history/sessions", tags=["History"])
async def get_sessions(db: AsyncSession = Depends(get_db)):
    try:
        sessions = await chat_history_service.get_user_sessions(db)
        return {"sessions": sessions}
    except Exception as e:
        logger.error(f"Error fetching sessions: {e}")
        # Return empty list gracefully if DB is down to prevent 500 errors in frontend
        return {"sessions": []}

@app.get("/api/history/{session_id}", tags=["History"])
async def get_session_history(session_id: str, db: AsyncSession = Depends(get_db)):
    try:
        messages = await chat_history_service.get_session_history(db, session_id)
        return {"session_id": session_id, "history": messages}
    except Exception as e:
        logger.error(f"Error fetching history for {session_id}: {e}")
        # Return empty history gracefully if DB is down
        return {"session_id": session_id, "history": []}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
