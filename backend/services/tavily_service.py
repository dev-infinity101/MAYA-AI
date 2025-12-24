import os
from tavily import TavilyClient
from dotenv import load_dotenv

load_dotenv()

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
            print("Warning: TAVILY_API_KEY not found in environment variables.")
            self.client = None
        else:
            self.client = TavilyClient(api_key=api_key)

    def search(self, query: str, max_results: int = 5) -> str:
        """
        Performs a web search using Tavily API.
        
        Args:
            query (str): The search query.
            max_results (int): Maximum number of results to return.
            
        Returns:
            str: A formatted string containing the search results.
        """
        if not self.client:
            return "Web search is currently unavailable (API Key missing)."

        try:
            response = self.client.search(query, search_depth="advanced", max_results=max_results)
            results = response.get("results", [])
            
            formatted_results = []
            for result in results:
                title = result.get("title", "No Title")
                url = result.get("url", "#")
                content = result.get("content", "No Content")
                formatted_results.append(f"Source: {title} ({url})\nContent: {content}\n")
            
            return "\n".join(formatted_results) if formatted_results else "No relevant information found."
        except Exception as e:
            print(f"Error searching with TavilyService: {e}")
            return f"Error performing web search: {str(e)}"

tavily_service = TavilyService()
