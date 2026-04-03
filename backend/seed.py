import asyncio
import json
import os
from sqlalchemy.ext.asyncio import AsyncSession
from database import engine, Base, AsyncSessionLocal
from models import Scheme
from services.jina_service import jina_service
from sqlalchemy import text, delete
from dotenv import load_dotenv

load_dotenv()

async def generate_scheme_embedding(scheme: dict) -> list:
    """
    Build a rich text representation of the scheme for embedding.
    More context = better retrieval accuracy.
    
    CRITICAL: use task="retrieval.passage" for documents being indexed.
    Queries use task="retrieval.query" — this asymmetry is intentional
    and is what makes Jina V3 accurate.
    """
    # Combine all meaningful fields into one rich text
    # The more descriptive, the better the semantic search
    parts = [
        f"Scheme: {scheme.get('name', '')}",
        f"Category: {scheme.get('category', '')}",
        f"Description: {scheme.get('description', '')}",
        f"Benefits: {', '.join(scheme.get('benefits', []))}",
        f"Tags: {', '.join(scheme.get('tags', []))}",
        f"Eligibility: {str(scheme.get('eligibility_criteria', ''))}",
    ]
    text = " | ".join(filter(None, parts))

    return await jina_service.embed_text(
        text,
        task="retrieval.passage"
    )

async def seed_schemes():
    print("🚀 Starting Gemini-Only Seeding with Pro Fields...")
    
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        print("🧹 Cleaning database...")
        await session.execute(delete(Scheme))
        await session.commit()

        # Ensure your data/schemes.json has the new fields
        with open("data/schemes.json", "r", encoding="utf-8") as f:
            schemes_data = json.load(f)

        for i, data in enumerate(schemes_data):
            name = data['name']
            print(f"\n[{i+1}/{len(schemes_data)}] Processing: {name}")
            
            # Safe embedding retrieval with Jina
            embedding = await generate_scheme_embedding(data)
            
            if embedding:
                new_scheme = Scheme(
                    name=name,
                    description=data['description'],
                    benefits=data['benefits'],             # NEW: JSON List
                    eligibility_criteria=data['eligibility_criteria'],
                    required_documents=data.get('required_documents', []), # NEW: JSON List
                    application_mode=data.get('application_mode', "Online/Offline"), # NEW: String
                    tags=data.get('tags', []),             # NEW: JSON List
                    category=data['category'],
                    link=data['link'],
                    embedding=embedding
                )
                session.add(new_scheme)
                await session.commit()
                print(f"   ✅ Saved with Pro Fields. (Jina embedding generated)")
                # Minimal cooldown since Jina has different rate limits
                await asyncio.sleep(0.5)
            else:
                print(f"   ⏭️ Skipping {name} due to repeated API failures.")

    print("\n🔥 PRO SEEDING PROCESS COMPLETED!")

if __name__ == "__main__":
    asyncio.run(seed_schemes())