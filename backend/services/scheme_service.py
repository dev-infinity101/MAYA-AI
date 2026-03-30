import time
import logging

from sqlalchemy import select, cast
from sqlalchemy.ext.asyncio import AsyncSession
from pgvector.sqlalchemy import Vector
from models import Scheme
from services.jina_service import jina_service

logger = logging.getLogger(__name__)

class SchemeService:
    async def search_schemes(self, db: AsyncSession, query: str, limit: int = 3):
        t0 = time.time()
        query_embedding = await jina_service.embed_text(query, task="retrieval.query")
        t1 = time.time()
        logger.info(f"  → Jina call: {t1-t0:.2f}s")

        if not query_embedding:
            return []

        vector = cast(query_embedding, Vector(768))
        
        t2 = time.time()
        stmt = select(Scheme).order_by(
            Scheme.embedding.cosine_distance(vector)
        ).limit(limit)
        
        result = await db.execute(stmt)
        t3 = time.time()
        logger.info(f"  → pgvector query: {t3-t2:.2f}s")

        schemes = result.scalars().all()
        t4 = time.time()
        logger.info(f"  → result fetch: {t4-t3:.2f}s")
        
        return schemes

scheme_service = SchemeService()
