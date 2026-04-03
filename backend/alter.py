import asyncio
import os
from sqlalchemy import text
from database import engine

async def alter_schema():
    async with engine.begin() as conn:
        print("Running schema updates for UserProfile...")
        try:
            await conn.execute(text("ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS full_name VARCHAR;"))
            await conn.execute(text("ALTER TABLE user_profiles DROP COLUMN IF EXISTS business_age;"))
            print("Successfully migrated user_profiles table!")
        except Exception as e:
            print(f"Error updating schema: {e}")

if __name__ == "__main__":
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(alter_schema())
