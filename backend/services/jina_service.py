import os
import hashlib
import asyncio
import httpx
from collections import OrderedDict
from dotenv import load_dotenv

load_dotenv()


class JinaService:
    def __init__(self):
        self.api_key = os.getenv("JINA_API_KEY")
        self.base_url = "https://api.jina.ai/v1/embeddings"
        
        # Persistent httpx client for HTTP/2 connection pooling.
        # Saves time not re-opening TCP/TLS handshakes per call.
        self._client = httpx.AsyncClient(
            timeout=10.0,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            }
        )

        # ── LRU Embedding Cache ───────────────────────────────────────────────
        self._cache: OrderedDict = OrderedDict()
        self._cache_limit = 100

    def _cache_key(self, text: str) -> str:
        normalized = text.lower().strip()[:100]
        return hashlib.md5(normalized.encode()).hexdigest()

    async def embed_text(self, text: str, task: str = "retrieval.query") -> list[float]:
        key = self._cache_key(text)

        # ── Cache hit ─────────────────────────────────────────────────────────
        if key in self._cache:
            self._cache.move_to_end(key)
            return self._cache[key]

        # ── Cache miss → fetch from Jina ──────────────────────────────────────
        embedding = await self._fetch_embedding(text, task)

        if len(self._cache) >= self._cache_limit:
            self._cache.popitem(last=False)

        self._cache[key] = embedding
        return embedding

    async def _fetch_embedding(self, text: str, task: str) -> list[float]:
        if not self.api_key:
            raise ValueError("JINA_API_KEY not found in environment variables")

        payload = {
            "input": [text],
            "model": "jina-embeddings-v3",
            "task": task,
            "dimensions": 768
        }

        # Pure async - doesn't block the Python event loop thread
        response = await self._client.post(self.base_url, json=payload)

        if response.status_code == 200:
            return response.json()["data"][0]["embedding"]
        else:
            raise Exception(f"Jina API Error: {response.status_code} - {response.text}")

    async def close(self):
        await self._client.aclose()


# Singleton instance
jina_service = JinaService()
