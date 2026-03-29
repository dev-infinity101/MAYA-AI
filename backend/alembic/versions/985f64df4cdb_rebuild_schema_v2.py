"""rebuild_schema_v2

Revision ID: 985f64df4cdb
Revises: 
Create Date: 2026-03-27 16:20:28.938816

MANUAL REVIEW NOTES:
- Old users table (INTEGER pk, hashed_password) is dropped and recreated.
- Old chat_history table is dropped.
- Schemes table is NOT touched.
- All clerk_user_id FK constraints relaxed to nullable for no-Clerk testing.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '985f64df4cdb'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema — safe version for existing DB."""

    # ── 1. Drop old tables that are completely replaced ──────────────────────
    # Drop chat_history first (it FK references users.id)
    op.execute("DROP TABLE IF EXISTS chat_history CASCADE")
    # Drop old users table (different PK type — easiest to recreate)
    op.execute("DROP TABLE IF EXISTS users CASCADE")

    # ── 2. Create new users table (UUID pk, Clerk-based) ─────────────────────
    op.create_table(
        'users',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('clerk_user_id', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('clerk_user_id'),
        sa.UniqueConstraint('email'),
    )
    op.create_index('ix_users_clerk_user_id', 'users', ['clerk_user_id'], unique=True)

    # ── 3. Create conversations ───────────────────────────────────────────────
    op.create_table(
        'conversations',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('clerk_user_id', sa.String(), nullable=True),  # nullable = works without Clerk
        sa.Column('title', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        # No FK to users — makes testing without Clerk effortless
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_conversations_clerk_user_id', 'conversations', ['clerk_user_id'], unique=False)

    # ── 4. Create messages (JSONB core) ───────────────────────────────────────
    op.create_table(
        'messages',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('conversation_id', sa.UUID(), nullable=False),
        sa.Column('role', sa.String(length=20), nullable=False),
        sa.Column('content_type', sa.String(length=50), nullable=False),
        sa.Column('content', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('agent_used', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['conversation_id'], ['conversations.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_messages_conversation_id', 'messages', ['conversation_id'], unique=False)

    # ── 5. Create user_profiles ───────────────────────────────────────────────
    op.create_table(
        'user_profiles',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('clerk_user_id', sa.String(), nullable=True),  # nullable for testing
        sa.Column('category', sa.String(), nullable=True),
        sa.Column('state', sa.String(), nullable=True),
        sa.Column('city', sa.String(), nullable=True),
        sa.Column('business_name', sa.String(), nullable=True),
        sa.Column('business_type', sa.String(), nullable=True),
        sa.Column('sector', sa.String(), nullable=True),
        sa.Column('business_age', sa.String(), nullable=True),
        sa.Column('turnover_range', sa.String(), nullable=True),
        sa.Column('udyam_registered', sa.Boolean(), nullable=True),
        sa.Column('existing_loan', sa.Boolean(), nullable=True),
        sa.Column('primary_goal', sa.String(), nullable=True),
        sa.Column('onboarding_complete', sa.Boolean(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )

    # ── 6. Create user_scheme_interactions ────────────────────────────────────
    op.create_table(
        'user_scheme_interactions',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('clerk_user_id', sa.String(), nullable=True),
        sa.Column('scheme_id', sa.Integer(), nullable=True),
        sa.Column('bookmarked', sa.Boolean(), nullable=True),
        sa.Column('application_status', sa.String(length=30), nullable=True),
        sa.Column('draft_letter', sa.Text(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['scheme_id'], ['schemes.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    # ── 7. Create media_assets ────────────────────────────────────────────────
    op.create_table(
        'media_assets',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('clerk_user_id', sa.String(), nullable=True),
        sa.Column('conversation_id', sa.UUID(), nullable=True),
        sa.Column('message_id', sa.UUID(), nullable=True),
        sa.Column('asset_type', sa.String(length=50), nullable=True),
        sa.Column('storage_url', sa.Text(), nullable=True),
        sa.Column('storage_key', sa.Text(), nullable=True),
        sa.Column('file_size_bytes', sa.Integer(), nullable=True),
        sa.Column('asset_metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['conversation_id'], ['conversations.id']),
        sa.ForeignKeyConstraint(['message_id'], ['messages.id']),
        sa.PrimaryKeyConstraint('id'),
    )


def downgrade() -> None:
    """Downgrade — drops all V2 tables, restores old schema."""
    op.drop_table('media_assets')
    op.drop_index('ix_messages_conversation_id', table_name='messages')
    op.drop_table('messages')
    op.drop_table('user_scheme_interactions')
    op.drop_table('user_profiles')
    op.drop_index('ix_conversations_clerk_user_id', table_name='conversations')
    op.drop_table('conversations')
    op.drop_index('ix_users_clerk_user_id', table_name='users')
    op.drop_table('users')

    # Restore old users table
    op.create_table(
        'users',
        sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
        sa.Column('email', sa.VARCHAR(), nullable=True),
        sa.Column('hashed_password', sa.VARCHAR(), nullable=True),
        sa.Column('full_name', sa.VARCHAR(), nullable=True),
        sa.Column('is_active', sa.BOOLEAN(), nullable=True),
        sa.Column('created_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
