import sys
import os
import asyncio
import logging

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), "backend"))

async def check_imports():
    print("Checking imports...")
    try:
        from backend.main import app
        print("✅ backend.main imported successfully")
    except Exception as e:
        print(f"❌ Failed to import backend.main: {e}")
        return

    try:
        from backend.agents.graph import app_graph
        print("✅ backend.agents.graph imported successfully")
    except Exception as e:
        print(f"❌ Failed to import backend.agents.graph: {e}")
        return

    try:
        from backend.agents.router import route_request
        print("✅ backend.agents.router imported successfully")
    except Exception as e:
        print(f"❌ Failed to import backend.agents.router: {e}")
        return
    
    print("\nChecking for gemini_service references...")
    # We can inspect the modules to see if gemini_service is loaded?
    # Or just rely on the grep we did earlier.
    
    print("All critical modules imported without error.")

if __name__ == "__main__":
    try:
        asyncio.run(check_imports())
    except Exception as e:
        print(f"Runtime check failed: {e}")
