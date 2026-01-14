from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from models import Scheme
from services.gemini_service import gemini_service

class SchemeService:
    async def search_schemes(self, db: AsyncSession, query: str, limit: int = 5):
        try:
            # 1. Get Gemini embedding for query
            query_embedding = await gemini_service.get_embeddings(query)
            
            if not query_embedding:
                print("⚠️ Could not generate embedding for query")
                return []

            # 2. Vector Similarity Search
            stmt = select(Scheme).order_by(
                Scheme.embedding.cosine_distance(query_embedding)
            ).limit(limit)
            
            result = await db.execute(stmt)
            schemes = result.scalars().all()
            
            # 3. Clean Dictionary Formatting
            formatted_results = []
            for s in schemes:
                formatted_results.append({
                    "id": s.id,
                    "name": s.name,
                    "description": s.description,
                    "category": s.category,
                    "benefits": s.benefits,
                    "eligibility_criteria": s.eligibility_criteria,
                    "required_documents": s.required_documents,
                    "application_mode": s.application_mode,
                    "link": s.link,
                    "tags": s.tags
                })
            return formatted_results
            
        except Exception as e:
            print(f"❌ Search Error in MAYA Knowledge Base: {e}")
            return []

scheme_service = SchemeService()