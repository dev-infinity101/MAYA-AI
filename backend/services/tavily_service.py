import os
import asyncio
from concurrent.futures import ThreadPoolExecutor
from tavily import TavilyClient
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger(__name__)

class TavilyService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(TavilyService, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        api_key = os.getenv("TAVILY_API_KEY")
        if not api_key:
            logger.warning("TAVILY_API_KEY not found in environment variables.")
            self.client = None
        else:
            self.client = TavilyClient(api_key=api_key)
        
        # Create a thread pool for blocking calls
        self.executor = ThreadPoolExecutor(max_workers=3)

    async def search(self, query: str, max_results: int = 5) -> str:
        """
        Performs a web search using Tavily API asynchronously.
        
        Args:
            query (str): The search query.
            max_results (int): Maximum number of results to return.
            
        Returns:
            str: A formatted string containing the search results.
        """
        if not self.client:
            return "Web search is currently unavailable (API Key missing)."

        loop = asyncio.get_running_loop()
        try:
            # Run blocking search in thread pool
            response = await loop.run_in_executor(
                self.executor,
                lambda: self.client.search(query, search_depth="advanced", max_results=max_results)
            )
            
            results = response.get("results", [])
            
            formatted_results = []
            for result in results:
                title = result.get("title", "No Title")
                url = result.get("url", "#")
                content = result.get("content", "No Content")
                formatted_results.append(f"Source: {title} ({url})\nContent: {content}\n")
            
            return "\n".join(formatted_results) if formatted_results else "No relevant information found."
        except Exception as e:
            logger.error(f"Error searching with TavilyService: {e}")
            return f"Error performing web search: {str(e)}"

tavily_service = TavilyService()
