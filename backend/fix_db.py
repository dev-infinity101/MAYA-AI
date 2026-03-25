import asyncio
import json
from sqlalchemy.ext.asyncio import AsyncSession
from database import AsyncSessionLocal
from models import Scheme

async def fix_schemes():
    print("Fixing garbled text in database...")
    with open("data/schemes.json", "r", encoding="utf-8") as f:
        schemes_data = json.load(f)
    
    async with AsyncSessionLocal() as session:
        count = 0
        for data in schemes_data:
            name = data['name']
            
            from sqlalchemy.future import select
            stmt = select(Scheme).where(Scheme.name == name)
            result = await session.execute(stmt)
            scheme_obj = result.scalars().first()
            
            if scheme_obj:
                scheme_obj.description = data['description']
                scheme_obj.benefits = data['benefits']
                scheme_obj.eligibility_criteria = data['eligibility_criteria']
                scheme_obj.required_documents = data.get('required_documents', [])
                scheme_obj.application_mode = data.get('application_mode', "Online/Offline")
                scheme_obj.tags = data.get('tags', [])
                scheme_obj.category = data['category']
                scheme_obj.link = data['link']
                count += 1
                
        await session.commit()
        print(f"Successfully fixed {count} schemes in the DB!")

if __name__ == "__main__":
    asyncio.run(fix_schemes())
