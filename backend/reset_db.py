import asyncio
from database import engine, Base
import models  # Important: models import hone chahiye

async def reset_database():
    print("Connecting to Neon DB (Async Mode)...")
    try:
        # Async engine ke saath sync commands chalane ka tareeka
        async with engine.begin() as conn:
            print("Dropping all existing tables...")
            await conn.run_sync(Base.metadata.drop_all)
            
            print("Creating new tables with Pro structure...")
            await conn.run_sync(Base.metadata.create_all)
            
        print("✅ Success! Database reset complete.")
    except Exception as e:
        print(f"❌ Error occurred: {e}")
    finally:
        # Engine connection close karein
        await engine.dispose()

if __name__ == "__main__":
    # Async function ko run karne ke liye asyncio ka use
    asyncio.run(reset_database())