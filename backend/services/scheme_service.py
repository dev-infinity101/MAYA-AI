import time
import logging
import types
from typing import List

from sqlalchemy import select, cast
from sqlalchemy.ext.asyncio import AsyncSession
from pgvector.sqlalchemy import Vector
from models import Scheme
from services.jina_service import jina_service

logger = logging.getLogger(__name__)

# In-memory fallback populated at startup; served when DB / vector search fails.
_scheme_cache: List[types.SimpleNamespace] = []


def _orm_to_ns(s: Scheme) -> types.SimpleNamespace:
    """Convert an ORM Scheme row to a SimpleNamespace with the same attribute set."""
    return types.SimpleNamespace(
        id=s.id,
        name=s.name,
        category=s.category,
        description=s.description,
        benefits=s.benefits,
        eligibility_criteria=s.eligibility_criteria,
        required_documents=s.required_documents,
        application_mode=s.application_mode,
        link=s.link,
        tags=s.tags,
        embedding=None,  # omit vector; not needed for display
    )


class SchemeService:

    async def warm_cache(self, db: AsyncSession) -> None:
        """Pre-load up to 50 scheme rows into memory for DB-down fallback."""
        global _scheme_cache
        try:
            result = await db.execute(select(Scheme).limit(50))
            rows = result.scalars().all()
            _scheme_cache = [_orm_to_ns(s) for s in rows]
            logger.info(f"✅ Scheme cache warmed: {len(_scheme_cache)} scheme(s).")
        except Exception as exc:
            logger.warning(f"⚠️  Could not warm scheme cache: {exc}")

    async def search_schemes(self, db: AsyncSession, query: str, limit: int = 3):
        t0 = time.time()
        try:
            query_embedding = await jina_service.embed_text(query, task="retrieval.query")
            t1 = time.time()
            logger.info(f"  → Jina call: {t1-t0:.2f}s")

            if not query_embedding:
                logger.warning("⚠️  Jina returned no embedding — serving scheme cache.")
                return _scheme_cache[:limit] if _scheme_cache else []

            vector = cast(query_embedding, Vector(768))
            t2 = time.time()
            stmt = (
                select(Scheme)
                .order_by(Scheme.embedding.cosine_distance(vector))
                .limit(limit)
            )
            result = await db.execute(stmt)
            t3 = time.time()
            logger.info(f"  → pgvector query: {t3-t2:.2f}s")

            schemes = result.scalars().all()
            logger.info(f"  → result fetch: {time.time()-t3:.2f}s")
            return schemes

        except Exception as exc:
            logger.warning(f"⚠️  DB scheme search failed, serving in-memory cache: {exc}")
            return _scheme_cache[:limit] if _scheme_cache else []


scheme_service = SchemeService()
