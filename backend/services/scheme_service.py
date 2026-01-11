from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from models import Scheme
from services.gemini_service import gemini_service

class SchemeService:
    async def search_schemes(self, db: AsyncSession, query: str, limit: int = 3):
        try:
            # 1. Get Gemini embedding for query
            query_embedding = await gemini_service.get_embeddings(query)
            
            if not query_embedding:
                return []

            # 2. Vector Similarity Search
            stmt = select(Scheme).order_by(
                Scheme.embedding.cosine_distance(query_embedding)
            ).limit(limit)
            
            result = await db.execute(stmt)
            return result.scalars().all()
            
        except Exception as e:
            print(f"Search Error: {e}")
            return []

scheme_service = SchemeService()