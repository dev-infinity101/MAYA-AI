from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from contextlib import asynccontextmanager
from database import engine, Base, get_db
import models
from services.mimo_service import mimo_service
from services.scheme_service import scheme_service
from agents.graph import app_graph
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import List, Optional
from langchain_core.messages import HumanMessage

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to DB, Initialize AI
    print("MAYA AI Backend Starting...")
    try:
        async with engine.begin() as conn:
            # Create tables if they don't exist
            await conn.run_sync(Base.metadata.create_all)
        print("Database tables created (if not exist).")
    except Exception as e:
        print(f"Error initializing database: {e}")
    
    yield
    # Shutdown: Close connections
    print("MAYA AI Backend Shutting Down...")

app = FastAPI(title="MAYA AI API", lifespan=lifespan)

# CORS Configuration
origins = [
    "http://localhost:5173",  # Vite default
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "MAYA AI Backend is Running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

class ChatRequest(BaseModel):
    message: str

@app.post("/api/test-ai")
async def test_ai(request: ChatRequest):
    # Custom greeting logic to match graph.py
    clean_message = request.message.strip().lower()
    greetings = ["hey", "hi", "hello", "hi there", "hey there"]
    
    if clean_message in greetings:
        return {"response": "Hey there! What's up? I'm MAYA, India's Business AI assistant. What can I help you with today?"}
        
    response = await mimo_service.generate_text(request.message)
    return {"response": response}

@app.post("/api/chat/test")
async def chat_test(request: ChatRequest):
    """
    Direct test for MimoService.
    """
    # Custom greeting logic to match graph.py
    clean_message = request.message.strip().lower()
    greetings = ["hey", "hi", "hello", "hi there", "hey there"]
    
    if clean_message in greetings:
        return {"response": "Hey there! What's up? I'm MAYA, India's Business AI assistant. What can I help you with today?"}

    response = await mimo_service.generate_text(request.message)
    return {"response": response}

# Removed duplicate chat_test endpoint

# Scheme Navigator Endpoints

class SchemeResponse(BaseModel):
    id: int
    name: str
    description: str
    benefits: str
    category: str
    link: str
    # eligibility_criteria is JSON, simplified here for now

@app.post("/api/chat/schemes", response_model=List[SchemeResponse])
async def chat_schemes(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    """
    Search for schemes based on user query.
    1. Embed query
    2. Vector search
    3. Return top matches
    """
    try:
        schemes = await scheme_service.search_schemes(db, request.message)
        return schemes
    except Exception as e:
        print(f"Error in chat_schemes: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# LangGraph Endpoint
@app.post("/api/chat/agent")
async def chat_agent(request: ChatRequest):
    """
    Route user query via LangGraph.
    """
    try:
        initial_state = {"messages": [HumanMessage(content=request.message)]}
        result = await app_graph.ainvoke(initial_state)
        
        last_message = result["messages"][-1].content
        return {"response": last_message, "agent": result.get("current_agent", "unknown")}
    except Exception as e:
        print(f"Error in chat_agent: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
