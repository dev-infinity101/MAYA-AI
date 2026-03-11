import os
from langchain_google_genai import ChatGoogleGenerativeAI
from google import genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class GeminiService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(GeminiService, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        """Initializes New SDK for embeddings and LangChain for LLM."""
        self.api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
        
        if not self.api_key:
            print("❌ Error: Google API Key not found.")
            
        # 1. Chat Model: LangChain works perfectly here
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash", 
            google_api_key=self.api_key,
            temperature=0.7
        )

        # 2. Embedding Client: New SDK initialized
        self.genai_client = genai.Client(api_key=self.api_key)

    async def generate_response(self, prompt: str) -> str:
        """Generates text response for the MAYA-AI Agent"""
        try:
            response = await self.llm.ainvoke(prompt)
            return response.content
        except Exception as e:
            print(f"❌ Gemini Generation Error: {e}")
            return "MAYA is currently unavailable. Please try again later."

    # UPDATED: Added is_document flag for dynamic task routing
    async def get_embeddings(self, text: str, is_document: bool = False):
        """Direct New SDK Call - Generates strictly 768-dim vector"""
        try:
            # Document for seeding (saving), Query for searching
            task = "RETRIEVAL_DOCUMENT" if is_document else "RETRIEVAL_QUERY"
            
            response = self.genai_client.models.embed_content(
                model="gemini-embedding-001", # Active Stable Model
                contents=text,
                config={
                    "task_type": task,
                    "output_dimensionality": 768 # Force 768 to match your Vector(768) in models.py
                }
            )
            return response.embeddings[0].values
            
        except Exception as e:
            print(f"❌ New SDK Embedding Error: {e}")
            return None

# Singleton instance
gemini_service = GeminiService()