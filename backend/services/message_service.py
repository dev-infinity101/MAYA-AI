"""
services/message_service.py
────────────────────────────
Centralised DB message save logic.
Both graph.py nodes and main.py import and call save_message() from here.
No duplicated DB logic anywhere else.
"""

import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from models import Message


async def save_message(
    db: AsyncSession,
    conversation_id: uuid.UUID,
    role: str,
    content_type: str,
    content: dict,
    agent_used: str = None
) -> Message:
    """
    Persists a single message with its JSONB content to the database.

    Args:
        db:              Active async DB session.
        conversation_id: UUID of the parent conversation.
        role:            "user" or "assistant".
        content_type:    "text" | "scheme_results" | "agent_response" | …
        content:         dict that will be stored as JSONB.
        agent_used:      Name of the agent (e.g. "scheme", "market"). Optional.

    Returns:
        The refreshed Message ORM object.
    """
    message = Message(
        conversation_id=conversation_id,
        role=role,
        content_type=content_type,
        content=content,        # dict → stored as JSONB automatically by SQLAlchemy
        agent_used=agent_used
    )
    db.add(message)
    await db.commit()
    await db.refresh(message)
    return message
