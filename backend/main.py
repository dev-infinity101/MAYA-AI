from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to DB, Initialize AI
    print("MAYA AI Backend Starting...")
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

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
