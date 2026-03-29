"""Add chat performance and search indexes

Revision ID: 20260329_0001
Revises: 
Create Date: 2026-03-29 03:05:00
"""

from alembic import op


revision = "20260329_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")
    op.execute(
        """
        DO $$
        BEGIN
            IF to_regclass('public.chat_history') IS NOT NULL THEN
                CREATE INDEX IF NOT EXISTS ix_chat_history_session_timestamp
                ON chat_history (session_id, timestamp DESC);
                CREATE INDEX IF NOT EXISTS ix_chat_history_content_trgm
                ON chat_history USING gin (content gin_trgm_ops);
            END IF;

            IF to_regclass('public.chat_sessions') IS NOT NULL THEN
                CREATE INDEX IF NOT EXISTS ix_chat_sessions_user_pinned_updated
                ON chat_sessions (user_auth_id, pinned DESC, updated_at DESC);
                CREATE INDEX IF NOT EXISTS ix_chat_sessions_title_trgm
                ON chat_sessions USING gin (title gin_trgm_ops);
            END IF;
        END
        $$;
        """
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_chat_history_content_trgm")
    op.execute("DROP INDEX IF EXISTS ix_chat_sessions_title_trgm")
    op.execute("DROP INDEX IF EXISTS ix_chat_history_session_timestamp")
    op.execute("DROP INDEX IF EXISTS ix_chat_sessions_user_pinned_updated")
