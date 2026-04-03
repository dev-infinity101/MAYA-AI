import uuid
from datetime import datetime

from sqlalchemy import (
    Column, Integer, String, Text, JSON, DateTime,
    ForeignKey, Boolean, Float
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector

from database import Base


# ──────────────────────────────────────────────
# UNCHANGED — Do NOT modify this model
# ──────────────────────────────────────────────
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


# ──────────────────────────────────────────────
# NEW MODELS — V2 Schema
# ──────────────────────────────────────────────

class User(Base):
    """Clerk-based user — no password stored locally."""
    __tablename__ = "users"

    id            = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clerk_user_id = Column(String, unique=True, nullable=False, index=True)
    email         = Column(String, unique=True, nullable=False)
    name          = Column(String)
    created_at    = Column(DateTime, default=datetime.utcnow)

    # Relationships
    profile              = relationship("UserProfile", back_populates="user", uselist=False)
    conversations        = relationship("Conversation", back_populates="user")
    scheme_interactions  = relationship("UserSchemeInteraction", back_populates="user")
    media_assets         = relationship("MediaAsset", back_populates="user")


class UserProfile(Base):
    """Stores onboarding answers for personalisation & eligibility filtering."""
    __tablename__ = "user_profiles"

    id                  = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clerk_user_id       = Column(String, ForeignKey("users.clerk_user_id"), unique=True, nullable=False)

    # Demographic / business fields
    full_name           = Column(String, nullable=True)
    category            = Column(String, nullable=True)
    state               = Column(String, nullable=True)
    city                = Column(String, nullable=True)
    business_name       = Column(String, nullable=True)
    business_type       = Column(String, nullable=True)
    sector              = Column(String, nullable=True)
    turnover_range      = Column(String, nullable=True)
    udyam_registered    = Column(Boolean, nullable=True, default=False)
    existing_loan       = Column(Boolean, nullable=True, default=False)
    primary_goal        = Column(String, nullable=True)
    
    onboarding_complete = Column(Boolean, default=False)

    user = relationship("User", back_populates="profile")


class Conversation(Base):
    """A named chat session — replaces the old raw session_id strings."""
    __tablename__ = "conversations"

    id            = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clerk_user_id = Column(String, ForeignKey("users.clerk_user_id"), index=True, nullable=True)
    title         = Column(String(255))        # first 50 chars of first message
    created_at    = Column(DateTime, default=datetime.utcnow)
    updated_at    = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")
    user     = relationship("User", back_populates="conversations", foreign_keys=[clerk_user_id])


class Message(Base):
    """
    Core persistence fix.
    Uses JSONB + content_type so the frontend can reconstruct any UI
    widget (scheme cards, agent responses, etc.) from stored data.

    Valid content_type values:
      "text"             → plain message
      "scheme_results"   → scheme cards — full structured payload
      "agent_response"   → market/brand/finance/marketing output
      "brand_kit"        → logos + social posts (future)
      "financial_report" → PDF report data (future)
    """
    __tablename__ = "messages"

    id              = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(
        UUID(as_uuid=True),
        ForeignKey("conversations.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )
    role            = Column(String(20), nullable=False)          # user | assistant
    content_type    = Column(String(50), nullable=False, default="text")
    content         = Column(JSONB, nullable=False)               # dict → JSONB
    agent_used      = Column(String(50))
    created_at      = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")


class MediaAsset(Base):
    """Future: logo / social post / report storage via Cloudflare R2."""
    __tablename__ = "media_assets"

    id              = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clerk_user_id   = Column(String, ForeignKey("users.clerk_user_id"), nullable=True)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id"), nullable=True)
    message_id      = Column(UUID(as_uuid=True), ForeignKey("messages.id"), nullable=True)
    asset_type      = Column(String(50))       # logo | social_post | report_pdf | user_upload
    storage_url     = Column(Text)             # Cloudflare R2 public URL
    storage_key     = Column(Text)             # key for deletion management
    file_size_bytes = Column(Integer)
    asset_metadata  = Column(JSONB, default={})   # renamed: 'metadata' is reserved in SQLAlchemy
    created_at      = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="media_assets")


class UserSchemeInteraction(Base):
    """Bookmarks + application-status tracking per user per scheme."""
    __tablename__ = "user_scheme_interactions"

    id                 = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clerk_user_id      = Column(String, ForeignKey("users.clerk_user_id"), nullable=True)
    scheme_id          = Column(Integer, ForeignKey("schemes.id"), nullable=True)
    bookmarked         = Column(Boolean, default=False)
    application_status = Column(String(30), default="not_started")
    # not_started | draft_generated | submitted | approved
    draft_letter       = Column(Text)           # AI-generated application letter
    notes              = Column(Text)
    updated_at         = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user   = relationship("User", back_populates="scheme_interactions")
    scheme = relationship("Scheme")