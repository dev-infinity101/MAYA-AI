"""Add chat embeddings for semantic search

Revision ID: 20260329_0002
Revises: 20260329_0001
Create Date: 2026-03-29 03:30:00
"""

from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector


revision = "20260329_0002"
down_revision = "20260329_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    op.add_column("chat_history", sa.Column("embedding", Vector(768), nullable=True))
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS ix_chat_history_embedding_hnsw
        ON chat_history USING hnsw (embedding vector_cosine_ops)
        """
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_chat_history_embedding_hnsw")
    op.drop_column("chat_history", "embedding")
