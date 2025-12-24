import sys
import os
import asyncio

# Add backend directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.mimo_service import mimo_service
from services.tavily_service import tavily_service

async def test_services():
    print("Testing Service Imports and Initialization...")
    
    # Test MimoService
    if mimo_service:
        print("✅ MimoService initialized successfully.")
    else:
        print("❌ MimoService failed to initialize.")
        
    if hasattr(mimo_service, 'generate_text'):
        print("✅ MimoService has generate_text method.")
    else:
        print("❌ MimoService missing generate_text method.")

    # Test TavilyService
    if tavily_service:
        print("✅ TavilyService initialized successfully.")
    else:
        print("❌ TavilyService failed to initialize.")
        
    if hasattr(tavily_service, 'search'):
        print("✅ TavilyService has search method.")
    else:
        print("❌ TavilyService missing search method.")

    print("\nNote: Actual API calls are skipped as API keys might be missing.")

if __name__ == "__main__":
    asyncio.run(test_services())
