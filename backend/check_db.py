import asyncio
import os
from sqlalchemy import select, func
from database import engine, AsyncSessionLocal
from models import Scheme
from dotenv import load_dotenv

async def check_stats():
    load_dotenv()
    print("Checking Database Stats...")
    async with AsyncSessionLocal() as session:
        # Total count
        count_stmt = select(func.count()).select_from(Scheme)
        result = await session.execute(count_stmt)
        total_count = result.scalar()
        
        # Count with embeddings
        embedding_stmt = select(func.count()).select_from(Scheme).where(Scheme.embedding.isnot(None))
        result = await session.execute(embedding_stmt)
        embedded_count = result.scalar()
        
        # Get names
        names_stmt = select(Scheme.name)
        result = await session.execute(names_stmt)
        names = result.scalars().all()

        print(f"\nResults:")
        print(f"- Total schemes in DB: {total_count}")
        print(f"- Schemes with vector embeddings: {embedded_count}")
        if names:
            print(f"- Schemes present: {', '.join(names)}")
        else:
            print("- No schemes found in database.")

if __name__ == "__main__":
    asyncio.run(check_stats())
