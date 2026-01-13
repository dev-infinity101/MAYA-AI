from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from models import Scheme
from services.jina_service import jina_service

class SchemeService:
    async def search_schemes(self, db: AsyncSession, query: str, limit: int = 3):
        # 1. Generate embedding for user query
        # Use Jina service for query embedding (task='retrieval.query')
        query_embedding = await jina_service.embed_text(query, task="retrieval.query")
        if not query_embedding:
            return []

        # 2. Perform vector search using pgvector (cosine distance)
        # Note: pgvector's cosine distance operator is <=>
        # We order by distance ascending (closest match first)
        stmt = select(Scheme).order_by(
            Scheme.embedding.cosine_distance(query_embedding)
        ).limit(limit)
        
        result = await db.execute(stmt)
        schemes = result.scalars().all()
        
        return schemes

scheme_service = SchemeService()
