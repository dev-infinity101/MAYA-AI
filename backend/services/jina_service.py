import os
import httpx

class JinaService:
    def __init__(self):
        self.api_key = os.getenv("JINA_API_KEY")
        self.url = "https://api.jina.ai/v1/embeddings"

    async def embed_text(self, text: str):
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        data = {
            "model": "jina-embeddings-v2-base-en", # Default 1024 dimensions
            "input": [text]
        }
        async with httpx.AsyncClient() as client:
            response = await client.post(self.url, headers=headers, json=data)
            if response.status_code == 200:
                return response.json()['data'][0]['embedding']
            else:
                print(f"❌ Jina API Error: {response.status_code} - {response.text}")
                return None

# --- YE LINE ADD KARNA SABSE ZAROORI HAI ---
jina_service = JinaService()