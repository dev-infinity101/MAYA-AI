import asyncio
import os
import sys

# Fix sys.path to point to the correct backend directory
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(current_dir, '..'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from langchain_core.messages import HumanMessage

# We need to load dotenv here as well to ensure env vars are present if not running via main.py logic
from dotenv import load_dotenv
load_dotenv()

from agents.graph import app_graph

async def test_agent(query: str, test_name: str):
    print(f"\n--- Testing {test_name} ---")
    print(f"User Input: '{query}'")
    try:
        inputs = {"messages": [HumanMessage(content=query)]}
        result = await app_graph.ainvoke(inputs)
        last_message = result["messages"][-1].content
        print(f"Agent Response:\n{last_message}")
        return True
    except Exception as e:
        print(f"Test failed: {e}")
        return False

async def main():
    print("=== Comprehensive Agentic Workflow Test ===")
    
    test_cases = [
        {"name": "General Greeting", "query": "hey"},
        {"name": "General Fact (No Greeting expected)", "query": "Tell me a fun fact about India."},
        {"name": "Market Research", "query": "What are the current trends in the organic food market in India?"},
        {"name": "Financial Planner", "query": "How should a small bakery plan its budget for the first year?"},
        {"name": "Marketing Agent", "query": "What are some low-cost digital marketing strategies for a local clothing brand?"},
        {"name": "Branding Consultant", "query": "Suggest some catchy names for a new eco-friendly stationery brand."},
        {"name": "Scheme Navigator", "query": "Are there any government schemes for women entrepreneurs in textiles?"},
    ]

    for case in test_cases:
        await test_agent(case["query"], case["name"])
        print("-" * 50)

if __name__ == "__main__":
    asyncio.run(main())
