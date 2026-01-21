from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from contextlib import asynccontextmanager
from database import engine, Base, get_db
import models
from services.scheme_service import scheme_service
from services.chat_history_service import chat_history_service
from agents.graph import app_graph
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from langchain_core.messages import HumanMessage
import uuid
import json
from fastapi.responses import StreamingResponse

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 MAYA AI Backend Starting...")
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("✅ Database initialized successfully.")
    except Exception as e:
        print(f"❌ Initialization Error: {e}")
    yield
    print("🛑 MAYA AI Backend Shutting Down...")

app = FastAPI(title="MAYA AI - Multi-Agent System", lifespan=lifespan)

# CORS: Frontend (Vite) connect karne ke liye
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Request/Response Models ---

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    user_profile: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    response: str
    agent: str
    session_id: str
    schemes: List[Dict[str, Any]] = [] # For your SchemeCard UI

# --- Endpoints ---

@app.get("/")
async def root():
    return {"status": "online", "system": "MAYA Multi-Agent AI"}

@app.post("/api/chat/agent", response_model=ChatResponse)
async def chat_agent(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    """
    Main Entry Point: Routes query via LangGraph and returns 
    structured response for UI Cards.
    """
    try:
        session_id = request.session_id or str(uuid.uuid4())
        
        # 1. Save User Message to DB
        await chat_history_service.save_message(db, session_id, "user", request.message)

        # 2. Prepare LangGraph Input
        # 'schemes' key is essential for holding the AI-analyzed cards
        initial_state = {
            "messages": [HumanMessage(content=request.message)],
            "user_profile": request.user_profile or {"location": "Uttar Pradesh"},
            "schemes": [] 
        }

        # 3. Invoke LangGraph (Brain of MAYA)
        # Thread_id allows LangGraph to maintain context across turns
        config = {"configurable": {"thread_id": session_id}}
        result = await app_graph.ainvoke(initial_state, config)
        
        # 4. Extract Output
        # Messages hold the text bubble, 'schemes' holds the analyzed cards
        last_message = result["messages"][-1].content
        agent_name = result.get("current_agent", "MAYA")
        found_schemes = result.get("schemes", [])
        
        # 5. Save Assistant Message to DB
        await chat_history_service.save_message(db, session_id, "assistant", last_message)
        
        return ChatResponse(
            response=result["messages"][-1].content,
            agent=result.get("current_agent", "MAYA"),
            session_id=session_id,
            schemes=result.get("schemes", []) # <--- Ye data pass hona chahiye
        )
    except Exception as e:
        print(f"🔥 Critical Graph Error: {e}")
        raise HTTPException(status_code=500, detail="MAYA agents are out of sync. Please try again.")

# --- History & Management Endpoints ---

@app.get("/api/history/sessions")
async def get_sessions(db: AsyncSession = Depends(get_db)):
    try:
        sessions = await chat_history_service.get_user_sessions(db)
        return {"sessions": sessions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/history/{session_id}")
async def get_session_history(session_id: str, db: AsyncSession = Depends(get_db)):
    try:
        messages = await chat_history_service.get_session_history(db, session_id)
        return {"session_id": session_id, "history": messages}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)