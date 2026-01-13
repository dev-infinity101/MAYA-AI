import asyncio
import os
import sys

# Add parent directory to path so we can import backend modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import select, text
from database import AsyncSessionLocal
from models import Scheme
from services.jina_service import jina_service
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def test_search():
    query_text = "loans for small businesses"
    print(f"Testing Search with Query: '{query_text}'")
    
    # 1. Generate Embedding for Query using Jina
    try:
        print("Generating query embedding with Jina...")
        query_embedding = await jina_service.embed_text(query_text, task="retrieval.query")
        print(f"✅ Query embedding generated (dim: {len(query_embedding)})")
    except Exception as e:
        print(f"❌ Failed to generate query embedding: {e}")
        return

    # 2. Search in Database
    print("Searching in database...")
    async with AsyncSessionLocal() as session:
        # Use pgvector's cosine distance operator (<=>)
        # We order by distance (closest first)
        stmt = select(Scheme).order_by(Scheme.embedding.cosine_distance(query_embedding)).limit(3)
        
        result = await session.execute(stmt)
        schemes = result.scalars().all()
        
        print(f"\nFound {len(schemes)} results:")
        for i, scheme in enumerate(schemes, 1):
            print(f"{i}. {scheme.name} (Category: {scheme.category})")
            print(f"   Description: {scheme.description[:100]}...")

if __name__ == "__main__":
    asyncio.run(test_search())
