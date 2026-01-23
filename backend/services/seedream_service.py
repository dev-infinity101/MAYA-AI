import os
import httpx
import logging
from typing import Optional

logger = logging.getLogger(__name__)

class SeedreamService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SeedreamService, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        self.api_key = os.getenv("SEEDREAM_API_KEY")
        # Defaulting to a likely endpoint, user may need to adjust based on their provider
        self.base_url = os.getenv("SEEDREAM_API_URL", "https://api.seedream.ai/v1/images/generations")
        self.model = os.getenv("SEEDREAM_MODEL", "seedream-4.5")
        
        if not self.api_key:
            logger.warning("SEEDREAM_API_KEY not found in environment variables.")

    async def generate_image(self, prompt: str, size: str = "1024x1024") -> Optional[str]:
        """
        Generates an image using Seedream API.
        
        Args:
            prompt (str): The image description.
            size (str): Image size (default 1024x1024).
            
        Returns:
            str: URL of the generated image or None if failed.
        """
        if not self.api_key:
            logger.error("Seedream API Key is missing.")
            return None

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "prompt": prompt,
            "n": 1,
            "size": size,
            "model": self.model
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(self.base_url, json=payload, headers=headers)
                
                if response.status_code == 200:
                    data = response.json()
                    # Standard OpenAI-like response structure
                    if "data" in data and len(data["data"]) > 0:
                         return data["data"][0]["url"]
                    # Fallback for some providers that might return just {url: ...}
                    if "url" in data:
                        return data["url"]
                    return None
                else:
                    logger.error(f"Seedream API Error: {response.status_code} - {response.text}")
                    return None
                    
        except Exception as e:
            logger.error(f"Error generating image with SeedreamService: {e}")
            return None

seedream_service = SeedreamService()
