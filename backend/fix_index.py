import asyncio
from sqlalchemy import text
from database import engine

async def rebuild_index():
    async with engine.begin() as conn:
        print("Rebuilding pgvector index...")
        await conn.execute(text("DROP INDEX IF EXISTS schemes_embedding_idx;"))
        await conn.execute(text('''
            CREATE INDEX schemes_embedding_idx ON schemes
            USING ivfflat (embedding vector_cosine_ops)
            WITH (lists = 100);
        '''))
        # NOTE: ANALYZE cannot be run inside a transaction block in asyncpg sometimes, 
        # but let's try or run it with auto-commit.
        # It's safer to use a raw connection for ANALYZE.

async def analyze_table():
    async with engine.connect() as conn:
        # execution_options is an async method in SQLAlchemy's AsyncConnection
        conn = await conn.execution_options(isolation_level="AUTOCOMMIT")
        await conn.execute(text("ANALYZE schemes;"))
        print("Index rebuilt and table analyzed. ✅")

async def main():
    await rebuild_index()
    await analyze_table()

if __name__ == "__main__":
    asyncio.run(main())
