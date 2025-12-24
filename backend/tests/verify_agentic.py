import asyncio
import os
import sys
from langchain_core.messages import HumanMessage

# Add backend directory to sys.path so imports work
sys.path.append(os.path.join(os.getcwd(), 'backend'))

# We need to load dotenv here as well to ensure env vars are present if not running via main.py logic
from dotenv import load_dotenv
load_dotenv()

from agents.graph import app_graph

async def main():
    print("--- Testing Agentic Workflow ---")
    try:
        # "Hello" should route to 'general' agent which uses Mimo
        user_input = "Hello, tell me a fun fact about India."
        print(f"User Input: '{user_input}'")
        
        inputs = {"messages": [HumanMessage(content=user_input)]}
        
        # Invoke the graph
        print("Invoking agent graph...")
        result = await app_graph.ainvoke(inputs)
        
        last_message = result["messages"][-1]
        print(f"Agent Response:\n{last_message.content}")
        
        if last_message.content:
             print("\n>>> Agentic Workflow: SUCCESS")
        else:
             print("\n>>> Agentic Workflow: FAILED (Empty response)")
             
    except Exception as e:
        print(f"\n>>> Agentic Workflow: FAILED with exception: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
