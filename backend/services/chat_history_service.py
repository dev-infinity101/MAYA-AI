from sqlalchemy import select, distinct, desc
from sqlalchemy.sql import func
from sqlalchemy.ext.asyncio import AsyncSession
from models import ChatHistory
from datetime import datetime

class ChatHistoryService:
    async def save_message(self, db: AsyncSession, session_id: str, role: str, content: str, user_id: int = None):
        message = ChatHistory(
            session_id=session_id,
            role=role,
            content=content,
            user_id=user_id
        )
        db.add(message)
        await db.commit()
        await db.refresh(message)
        return message

    async def get_session_history(self, db: AsyncSession, session_id: str):
        stmt = select(ChatHistory).where(ChatHistory.session_id == session_id).order_by(ChatHistory.timestamp.asc())
        result = await db.execute(stmt)
        return result.scalars().all()

    async def get_user_sessions(self, db: AsyncSession, user_id: int = None):
        # Simplify: Get unique session IDs ordered by their latest activity
        stmt = (
            select(ChatHistory.session_id)
            .group_by(ChatHistory.session_id)
            .order_by(func.max(ChatHistory.timestamp).desc())
        )
        
        result = await db.execute(stmt)
        return result.scalars().all()

chat_history_service = ChatHistoryService()
