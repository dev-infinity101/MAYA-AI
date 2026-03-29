import asyncio

from sqlalchemy import select

from database import AsyncSessionLocal
from models import ChatHistory
from services.gemini_service import gemini_service
from services.chat_history_service import chat_history_service


async def main():
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(ChatHistory)
            .where(ChatHistory.embedding.is_(None))
            .where(ChatHistory.content.is_not(None))
            .order_by(ChatHistory.timestamp.asc())
        )
        messages = result.scalars().all()

        processed = 0
        for message in messages:
            normalized = chat_history_service._normalize_embedding_text(message.content)
            if not normalized:
                continue

            embedding = await gemini_service.get_embeddings(normalized, mode="document")
            if not embedding:
                continue

            message.embedding = embedding
            processed += 1

            if processed % 25 == 0:
                await db.commit()
                print(f"Embedded {processed} chat messages...")

        await db.commit()
        print(f"Done. Embedded {processed} chat messages.")


if __name__ == "__main__":
    asyncio.run(main())
