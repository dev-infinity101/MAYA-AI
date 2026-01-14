import asyncio
import json
import os
from sqlalchemy.ext.asyncio import AsyncSession
from database import engine, Base, AsyncSessionLocal
from models import Scheme
from services.gemini_service import gemini_service
from sqlalchemy import text, delete
from dotenv import load_dotenv

load_dotenv()

async def get_embedding_with_retry(text_to_embed, max_attempts=3):
    """Wait and retry logic for Gemini Free Tier with exit condition (UNTOUCHED)"""
    attempt = 0
    while attempt < max_attempts:
        try:
            emb = await gemini_service.get_embeddings(text_to_embed)
            if emb:
                return emb
            
            attempt += 1
            print(f"⚠️ Attempt {attempt} failed (Empty Embedding). Sleeping 70s to reset quota...")
            await asyncio.sleep(70) 
            
        except Exception as e:
            print(f"❌ Error on attempt {attempt+1}: {e}")
            await asyncio.sleep(70)
            attempt += 1
            
    print(f"🛑 Critical: Could not get embedding after {max_attempts} tries. Skipping this item.")
    return None

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
        with open("data/schemes.json", "r") as f:
            schemes_data = json.load(f)

        for i, data in enumerate(schemes_data):
            name = data['name']
            print(f"\n[{i+1}/{len(schemes_data)}] Processing: {name}")
            
            # Rich text updated to include benefits list and tags for better semantic search
            benefits_str = ". ".join(data.get('benefits', []))
            tags_str = ", ".join(data.get('tags', []))
            rich_text = f"{name}. {data['description']}. Benefits: {benefits_str}. Tags: {tags_str}"
            
            # Safe embedding retrieval (Logic preserved)
            embedding = await get_embedding_with_retry(rich_text)
            
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
                print(f"   ✅ Saved with Pro Fields. Waiting 10s for next call...")
                await asyncio.sleep(10) # Cooldown preserved
            else:
                print(f"   ⏭️ Skipping {name} due to repeated API failures.")

    print("\n🔥 PRO SEEDING PROCESS COMPLETED!")

if __name__ == "__main__":
    asyncio.run(seed_schemes())