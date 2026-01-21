import os
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

class MimoService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MimoService, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
            print("Warning: OPENROUTER_API_KEY not found in environment variables.")
        
        # OpenRouter requires these extra headers to avoid 401 errors
        self.client = AsyncOpenAI(
            api_key=api_key,
            base_url="https://openrouter.ai/api/v1",
            default_headers={
                "HTTP-Referer": "http://localhost:3000", # Aapka site URL
                "X-Title": "MAYA-AI-Local"               # Aapke app ka naam
            }
        )
        self.model = "xiaomi/mimo-v2-flash:free"

    async def generate_text(self, prompt: str) -> str:
        """
        Generates text using the Xiaomi Mimo V2 Flash model via OpenRouter.
        
        Args:
            prompt (str): The input prompt for the model.
            
        Returns:
            str: The generated text response.
        """
        try:
            completion = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are MAYA, a helpful AI assistant for MSMEs in India. Provide direct, professional, and actionable advice. Do not include unnecessary greetings or self-introductions unless specifically asked who you are."},
                    {"role": "user", "content": prompt}
                ]
            )
            return completion.choices[0].message.content
        except Exception as e:
            print(f"Error generating text with MimoService: {e}")
            return "I apologize, but I encountered an error while processing your request."

mimo_service = MimoService()
