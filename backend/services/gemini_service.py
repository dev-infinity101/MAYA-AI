import os
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from dotenv import load_dotenv

load_dotenv()

class GeminiService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(GeminiService, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
        if not api_key:
            print("❌ Error: Google API Key not found.")
        
        # 1. Chat Model: Gemini 1.5 Flash (Perfect for your Agent)
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-flash-latest", 
            google_api_key=api_key,
            temperature=0.7
        )

        # 2. Embedding Model: text-embedding-004 (More stable than 001)
        # Yeh 768 dimensions hi return karega.
        self.embeddings_model = GoogleGenerativeAIEmbeddings(
            model="models/text-embedding-004", # UPDATED
            google_api_key=api_key,
            task_type="retrieval_document" # Document storage ke liye
        )

    async def generate_response(self, prompt: str) -> str:
        """Generates text response for MAYA-AI Agent"""
        try:
            response = await self.llm.ainvoke(prompt)
            return response.content
        except Exception as e:
            print(f"❌ Gemini Generation Error: {e}")
            return "MAYA is currently unavailable. Please try again later."

    async def get_embeddings(self, text: str):
        """Generates 768-dim vector for semantic search"""
        try:
            # LangChain uses aembed_query for a single string
            embedding = await self.embeddings_model.aembed_query(text)
            return embedding
        except Exception as e:
            print(f"❌ Gemini Embedding Error (429/Other): {e}")
            return None

# Instance for easy import
gemini_service = GeminiService()