import asyncio
import os
import sys

# Add backend directory to sys.path so imports work
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from services.mimo_service import mimo_service

async def main():
    print("--- Testing Mimo Service Direct Workflow ---")
    try:
        prompt = "Hello! Please confirm you are working by saying 'Mimo is online'."
        print(f"Sending prompt: '{prompt}'")
        response = await mimo_service.generate_text(prompt)
        print(f"Response received:\n{response}")
        
        if response and "error" not in response.lower() and "apologize" not in response.lower():
            print("\n>>> Direct Workflow: SUCCESS")
        else:
            print("\n>>> Direct Workflow: FAILED (Error or apology in response)")
            
    except Exception as e:
        print(f"\n>>> Direct Workflow: FAILED with exception: {e}")

if __name__ == "__main__":
    asyncio.run(main())
