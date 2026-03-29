from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine


async def ensure_database_features(engine: AsyncEngine) -> None:
    """
    Keep local and fresh environments performant without requiring a manual
    migration step before first startup.
    """
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS pg_trgm"))
        await conn.execute(
            text(
                "CREATE INDEX IF NOT EXISTS ix_chat_history_session_timestamp "
                "ON chat_history (session_id, timestamp DESC)"
            )
        )
        await conn.execute(
            text(
                "CREATE INDEX IF NOT EXISTS ix_chat_sessions_user_pinned_updated "
                "ON chat_sessions (user_auth_id, pinned DESC, updated_at DESC)"
            )
        )
        await conn.execute(
            text(
                "CREATE INDEX IF NOT EXISTS ix_chat_sessions_title_trgm "
                "ON chat_sessions USING gin (title gin_trgm_ops)"
            )
        )
        await conn.execute(
            text(
                "CREATE INDEX IF NOT EXISTS ix_chat_history_content_trgm "
                "ON chat_history USING gin (content gin_trgm_ops)"
            )
        )
        try:
            await conn.execute(
                text(
                    "CREATE INDEX IF NOT EXISTS ix_chat_history_embedding_hnsw "
                    "ON chat_history USING hnsw (embedding vector_cosine_ops)"
                )
            )
        except Exception as exc:
            print(f"Skipping semantic vector index creation: {exc}")
