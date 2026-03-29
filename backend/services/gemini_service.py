import os

from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings

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
            print("Error: Google API Key not found.")

        self.llm = ChatGoogleGenerativeAI(
            model="gemini-flash-latest",
            google_api_key=api_key,
            temperature=0.7,
        )

        self.document_embeddings_model = GoogleGenerativeAIEmbeddings(
            model="models/text-embedding-004",
            google_api_key=api_key,
            task_type="retrieval_document",
        )
        self.query_embeddings_model = GoogleGenerativeAIEmbeddings(
            model="models/text-embedding-004",
            google_api_key=api_key,
            task_type="retrieval_query",
        )

    async def generate_response(self, prompt: str) -> str:
        """Generates text response for MAYA-AI Agent."""
        try:
            response = await self.llm.ainvoke(prompt)
            return response.content
        except Exception as e:
            print(f"Gemini generation error: {e}")
            return "MAYA is currently unavailable. Please try again later."

    async def get_embeddings(self, text: str, mode: str = "query"):
        """Generates 768-dim vectors for semantic search."""
        try:
            model = self.document_embeddings_model if mode == "document" else self.query_embeddings_model
            return await model.aembed_query(text)
        except Exception as e:
            print(f"Gemini embedding error: {e}")
            return None


gemini_service = GeminiService()
