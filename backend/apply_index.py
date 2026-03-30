import asyncio
import os
import sys

# Add backend directory to path to import database module
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from database import engine
from sqlalchemy import text

async def main():
    try:
        async with engine.begin() as conn:
            print("Checking pgvector indexes...")
            # We must use raw string for index creation because asyncpg transaction blocks sometimes restrict utility commands but CREATE INDEX is usually fine
            # Actually, CREATE INDEX CONCURRENTLY cannot run in a transaction block, but standard CREATE INDEX can.
            
            await conn.execute(text("""
                CREATE INDEX IF NOT EXISTS schemes_embedding_idx ON schemes 
                USING ivfflat (embedding vector_cosine_ops)
                WITH (lists = 100);
            """))
            print("✅ Vector index 'schemes_embedding_idx' created or successfully verified.")
            
            # ANALYZE cannot run in a transaction block in postgres. We will just commit and run it on a raw connection.
    except Exception as e:
        print(f"Index creation failed: {e}")
        
    try:
        # Get raw connection to run ANALYZE outside transaction
        async with engine.connect() as conn:
            await conn.execution_options(isolation_level="AUTOCOMMIT").execute(text("ANALYZE schemes;"))
            print("✅ Database analyzed.")
    except Exception as e:
        print(f"Analyze failed: {e}")

if __name__ == "__main__":
    asyncio.run(main())
