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
        # Try both GEMINI_API_KEY and GOOGLE_API_KEY
        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        
        if not api_key:
            print("CRITICAL WARNING: GEMINI_API_KEY or GOOGLE_API_KEY not set.")
            # We don't initialize the LLM if there's no API key to avoid validation errors on import
            self.llm = None
            self.embeddings = None
            return
        
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=api_key,
            temperature=0.7
        )
        
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/embedding-001",
            google_api_key=api_key
        )

    async def generate_text(self, prompt: str) -> str:
        if not self.llm:
            return "Error: Gemini API key not configured."
        try:
            response = await self.llm.ainvoke(prompt)
            return response.content
        except Exception as e:
            print(f"Error generating text: {e}")
            return "Sorry, I encountered an error processing your request."

    async def embed_text(self, text: str) -> list[float]:
        if not self.embeddings:
            print("Error: Gemini API key not configured for embeddings.")
            return []
        try:
            return await self.embeddings.aembed_query(text)
        except Exception as e:
            print(f"Error embedding text: {e}")
            return []

gemini_service = GeminiService()
