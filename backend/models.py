from sqlalchemy import Column, Integer, String, Text, JSON, DateTime, ForeignKey, Boolean, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
from database import Base

class Scheme(Base):
    __tablename__ = "schemes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text)
    
    # UPDATED: String se JSON kar diya taaki list store ho sake
    benefits = Column(JSON) 
    eligibility_criteria = Column(JSON)  # Nested JSON (age, sector, category, ownership)
    
    # NEW FIELDS: Pro Version ke liye
    required_documents = Column(JSON)    # List of docs
    application_mode = Column(String)    # Online/Offline
    tags = Column(JSON)                  # AI search keywords
    
    category = Column(String, index=True)
    link = Column(String)
    
    # Vector embedding (dimension 768 for Gemini)
    embedding = Column(Vector(768))

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    chats = relationship("ChatHistory", back_populates="user")

class ChatHistory(Base):
    __tablename__ = "chat_history"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    session_id = Column(String, index=True) 
    role = Column(String) 
    content = Column(Text)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="chats")