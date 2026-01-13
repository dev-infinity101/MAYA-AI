import asyncio
import sys
import os

# Add parent directory to path
sys.path.append(os.getcwd())

try:
    from services.scheme_service import scheme_service
    from agents.graph import app_graph
    print("✅ Imports successful: SchemeService and AppGraph loaded.")
except ImportError as e:
    print(f"❌ Import Error: {e}")
except Exception as e:
    print(f"❌ Error: {e}")

# Optional: Print graph nodes to verify
try:
    # app_graph is a CompiledGraph
    print("Graph compiled successfully.")
except:
    pass
