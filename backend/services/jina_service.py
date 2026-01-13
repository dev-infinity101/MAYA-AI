import os
import requests
import asyncio
from dotenv import load_dotenv

load_dotenv()

class JinaService:
    def __init__(self):
        self.api_key = os.getenv("JINA_API_KEY")
        self.base_url = "https://api.jina.ai/v1/embeddings"
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }

    async def embed_text(self, text: str, task: str = "retrieval.passage") -> list[float]:
        """
        Generates embeddings using Jina AI API.
        task: 'retrieval.passage' for documents, 'retrieval.query' for search queries.
        """
        if not self.api_key:
            raise ValueError("JINA_API_KEY not found in environment variables")

        payload = {
            "input": [text],
            "model": "jina-embeddings-v3",
            "task": task,
            "dimensions": 768  # Match DB schema
        }

        # Run synchronous requests in a separate thread to avoid blocking the event loop
        loop = asyncio.get_running_loop()
        response = await loop.run_in_executor(
            None, 
            lambda: requests.post(self.base_url, headers=self.headers, json=payload)
        )

        if response.status_code == 200:
            data = response.json()
            return data["data"][0]["embedding"]
        else:
            raise Exception(f"Jina API Error: {response.status_code} - {response.text}")

# Singleton instance
jina_service = JinaService()
