import asyncio
import json
import os
from sqlalchemy.ext.asyncio import AsyncSession
from database import engine, Base, AsyncSessionLocal
from models import Scheme
from services.jina_service import jina_service
from sqlalchemy import select, text

async def seed_schemes():
    print("Starting database seeding with Jina AI...")
    
    # Ensure pgvector extension exists and tables exist
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # Check if schemes already exist
        result = await session.execute(select(Scheme))
        existing_schemes = result.scalars().all()
        
        if existing_schemes:
            print(f"Database already has {len(existing_schemes)} schemes. Skipping seed.")
            # Optional: Uncomment to force clear database
            # await session.execute(text("TRUNCATE TABLE schemes RESTART IDENTITY"))
            # await session.commit()
            return

        # Load schemes from JSON
        try:
            with open("data/schemes.json", "r") as f:
                schemes_data = json.load(f)
        except FileNotFoundError:
            print("Error: data/schemes.json not found.")
            return

        print(f"Found {len(schemes_data)} schemes to insert.")

        for scheme_data in schemes_data:
            print(f"Processing: {scheme_data['name']}")
            
            # Generate embedding with retry logic
            max_retries = 3
            embedding = None
            
            # Construct rich text for embedding
            text_to_embed = f"{scheme_data['name']}. {scheme_data['description']}. {scheme_data['benefits']}. Category: {scheme_data['category']}."

            for attempt in range(max_retries):
                try:
                    # Use Jina service with 'retrieval.passage' task
                    embedding = await jina_service.embed_text(
                        text=text_to_embed,
                        task="retrieval.passage"
                    )
                    if embedding:
                        break
                except Exception as e:
                    print(f"  Attempt {attempt + 1} failed: {e}. Retrying in 2s...")
                    await asyncio.sleep(2)
            
            if not embedding:
                print(f"  Failed to generate embedding for {scheme_data['name']} after {max_retries} attempts. Skipping.")
                continue

            # Create Scheme object
            new_scheme = Scheme(
                name=scheme_data['name'],
                description=scheme_data['description'],
                benefits=scheme_data['benefits'],
                eligibility_criteria=scheme_data['eligibility_criteria'],
                category=scheme_data['category'],
                link=scheme_data['link'],
                embedding=embedding
            )
            
            session.add(new_scheme)
            print(f"  ✅ Embedding generated (dim: {len(embedding)})")

        await session.commit()
        print("Seeding completed successfully!")

if __name__ == "__main__":
    asyncio.run(seed_schemes())
