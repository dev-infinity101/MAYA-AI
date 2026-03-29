from datetime import datetime
from typing import Any

from fastapi import HTTPException
from sqlalchemy import case, delete, exists, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import func

from models import ChatHistory, ChatSession
from services.gemini_service import gemini_service


class ChatHistoryService:
    _EMBEDDING_CHAR_LIMIT = 4000

    @staticmethod
    def _session_summary_statement(user_auth_id: str):
        latest_message_preview = (
            select(ChatHistory.content)
            .where(ChatHistory.session_id == ChatSession.session_id)
            .order_by(ChatHistory.timestamp.desc(), ChatHistory.id.desc())
            .limit(1)
            .scalar_subquery()
        )

        return (
            select(
                ChatSession,
                latest_message_preview.label("preview"),
            )
            .where(ChatSession.user_auth_id == user_auth_id)
        )

    @staticmethod
    def _format_session_summary(session: ChatSession, preview: str | None):
        return {
            "id": session.session_id,
            "title": session.title or f"Chat {session.session_id[:8]}",
            "pinned": bool(session.pinned),
            "preview": (preview or "").strip()[:140],
            "updated_at": session.updated_at.isoformat() if session.updated_at else None,
        }

    @staticmethod
    def _format_history_message(message: ChatHistory):
        timestamp = message.timestamp.isoformat() if message.timestamp else None
        return {
            "id": message.id,
            "role": message.role,
            "content": message.content,
            "session_id": message.session_id,
            "timestamp": timestamp,
        }

    @classmethod
    def _normalize_embedding_text(cls, content: str) -> str:
        normalized = " ".join((content or "").split())
        return normalized[: cls._EMBEDDING_CHAR_LIMIT]

    async def save_message(
        self,
        db: AsyncSession,
        session_id: str,
        role: str,
        content: str,
        user_auth_id: str,
        title: str | None = None,
        user_id: int = None,
    ):
        stmt = select(ChatSession).where(ChatSession.session_id == session_id)
        result = await db.execute(stmt)
        session = result.scalar_one_or_none()

        if session is None:
            session = ChatSession(
                session_id=session_id,
                user_auth_id=user_auth_id,
                title=(title or content[:80]).strip() if role == "user" else title,
            )
            db.add(session)
        elif session.user_auth_id != user_auth_id:
            raise HTTPException(status_code=403, detail="This conversation does not belong to the current user")
        elif role == "user" and not session.title:
            session.title = (title or content[:80]).strip()

        session.updated_at = datetime.utcnow()

        embedding_text = self._normalize_embedding_text(content)
        embedding = None
        if embedding_text:
            embedding = await gemini_service.get_embeddings(embedding_text, mode="document")

        message = ChatHistory(
            session_id=session_id,
            role=role,
            content=content,
            user_id=user_id,
            embedding=embedding,
        )
        db.add(message)
        await db.commit()
        await db.refresh(message)
        return message

    async def get_session_history(self, db: AsyncSession, session_id: str, user_auth_id: str):
        await self._get_owned_session(db, session_id, user_auth_id)
        stmt = select(ChatHistory).where(ChatHistory.session_id == session_id).order_by(ChatHistory.timestamp.asc())
        result = await db.execute(stmt)
        messages = result.scalars().all()
        return [self._format_history_message(message) for message in messages]

    async def get_user_sessions(self, db: AsyncSession, user_auth_id: str):
        stmt = (
            self._session_summary_statement(user_auth_id)
            .order_by(ChatSession.pinned.desc(), ChatSession.updated_at.desc())
        )

        result = await db.execute(stmt)
        sessions = result.all()
        return [
            self._format_session_summary(session, preview)
            for session, preview in sessions
        ]

    async def update_session_meta(
        self,
        db: AsyncSession,
        session_id: str,
        user_auth_id: str,
        title: str | None = None,
        pinned: bool | None = None,
    ):
        session = await self._get_owned_session(db, session_id, user_auth_id)

        if title is not None:
            session.title = title.strip()[:120] or session.title
        if pinned is not None:
            session.pinned = pinned
        session.updated_at = datetime.utcnow()

        await db.commit()
        await db.refresh(session)
        latest_preview_stmt = (
            select(ChatHistory.content)
            .where(ChatHistory.session_id == session.session_id)
            .order_by(ChatHistory.timestamp.desc(), ChatHistory.id.desc())
            .limit(1)
        )
        preview_result = await db.execute(latest_preview_stmt)
        return self._format_session_summary(session, preview_result.scalar_one_or_none())

    async def search_user_sessions(
        self,
        db: AsyncSession,
        user_auth_id: str,
        query: str,
    ):
        normalized_query = query.strip()
        if not normalized_query:
            return await self.get_user_sessions(db, user_auth_id)

        search_term = f"%{normalized_query}%"
        title_prefix_term = f"{normalized_query}%"
        title_hit = ChatSession.title.ilike(search_term)
        message_hit = exists(
            select(ChatHistory.id).where(
                ChatHistory.session_id == ChatSession.session_id,
                ChatHistory.content.ilike(search_term),
            )
        )
        relevance_rank = case(
            (ChatSession.title.ilike(title_prefix_term), 3),
            (title_hit, 2),
            (message_hit, 1),
            else_=0,
        )

        lexical_stmt = (
            self._session_summary_statement(user_auth_id)
            .where(or_(title_hit, message_hit))
            .order_by(ChatSession.pinned.desc(), relevance_rank.desc(), ChatSession.updated_at.desc())
            .limit(20)
        )

        lexical_result = await db.execute(lexical_stmt)
        lexical_sessions = lexical_result.all()
        merged_results = [
            self._format_session_summary(session, preview)
            for session, preview in lexical_sessions
        ]
        seen_session_ids = {item["id"] for item in merged_results}

        if len(merged_results) >= 10:
            return merged_results

        query_embedding = await gemini_service.get_embeddings(normalized_query, mode="query")
        if not query_embedding:
            return merged_results

        semantic_distances = (
            select(
                ChatHistory.session_id.label("session_id"),
                func.min(ChatHistory.embedding.cosine_distance(query_embedding)).label("semantic_distance"),
            )
            .where(ChatHistory.embedding.is_not(None))
            .group_by(ChatHistory.session_id)
            .subquery()
        )

        semantic_stmt = (
            self._session_summary_statement(user_auth_id)
            .join(
                semantic_distances,
                semantic_distances.c.session_id == ChatSession.session_id,
            )
            .order_by(
                ChatSession.pinned.desc(),
                semantic_distances.c.semantic_distance.asc(),
                ChatSession.updated_at.desc(),
            )
            .limit(10)
        )

        semantic_result = await db.execute(semantic_stmt)
        semantic_sessions = semantic_result.all()
        for session, preview in semantic_sessions:
            if session.session_id in seen_session_ids:
                continue
            merged_results.append(self._format_session_summary(session, preview))
            seen_session_ids.add(session.session_id)

        return merged_results[:20]

    async def delete_session(self, db: AsyncSession, session_id: str, user_auth_id: str):
        await self._get_owned_session(db, session_id, user_auth_id)
        await db.execute(delete(ChatHistory).where(ChatHistory.session_id == session_id))
        await db.execute(delete(ChatSession).where(ChatSession.session_id == session_id))
        await db.commit()

    async def _get_owned_session(self, db: AsyncSession, session_id: str, user_auth_id: str) -> ChatSession:
        stmt = select(ChatSession).where(
            ChatSession.session_id == session_id,
            ChatSession.user_auth_id == user_auth_id,
        )
        result = await db.execute(stmt)
        session = result.scalar_one_or_none()
        if session is None:
            raise HTTPException(status_code=404, detail="Conversation not found")
        return session


chat_history_service = ChatHistoryService()
