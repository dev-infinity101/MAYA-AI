"""
alembic/env.py
──────────────
Async-compatible Alembic environment for MAYA backend.
Uses asyncpg (same driver as the rest of the app) so migrations
run through the same async engine — no separate sync connection needed.

IMPORTANT: Alembic must be run from the backend/ directory:
    cd backend && alembic revision --autogenerate -m "rebuild_schema_v2"
    cd backend && alembic upgrade head
"""

import asyncio
import os
import sys
from logging.config import fileConfig

from sqlalchemy.ext.asyncio import async_engine_from_config
from sqlalchemy import pool
from alembic import context

# ── Path setup ──────────────────────────────────────────────────────────────
# Ensures the backend/ root is on sys.path so our local modules can be found.
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# ── Import your models so Alembic can discover metadata ─────────────────────
from database import Base       # Base lives in backend/database.py
import models                   # Critical: all models must be imported here
                                # so Base.metadata is fully populated.

# ── Alembic config ──────────────────────────────────────────────────────────
config = context.config
fileConfig(config.config_file_name)

# ── Inject DATABASE_URL from .env ────────────────────────────────────────────
# We load it ourselves rather than reading the (blank) alembic.ini value.
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

db_url = os.getenv("DATABASE_URL", "")

# asyncpg fix: strip unsupported parameters (same as database.py)
import urllib.parse as urlparse
from urllib.parse import urlencode

db_url = db_url.strip("'").strip('"')
url = urlparse.urlparse(db_url)
query = urlparse.parse_qs(url.query)
if "sslmode" in query:
    sslmode = query.pop("sslmode")[0]
    if sslmode in ["require", "verify-ca", "verify-full"]:
        query["ssl"] = ["require"]
if "channel_binding" in query:
    query.pop("channel_binding")
new_query = urlencode(query, doseq=True)
url = url._replace(query=new_query)
db_url = urlparse.urlunparse(url)

config.set_main_option("sqlalchemy.url", db_url)

# ── Target metadata for autogenerate ────────────────────────────────────────
target_metadata = Base.metadata


# ── Migration runners ────────────────────────────────────────────────────────

def do_run_migrations(connection):
    """Sync callback that Alembic calls from inside the async connection."""
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,          # detect column type changes
        compare_server_default=True,
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online():
    """Entry point: create async engine, obtain connection, run migrations."""
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


asyncio.run(run_migrations_online())
