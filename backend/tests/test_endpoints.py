import httpx
import asyncio
import sys

async def test_endpoints():
    base_url = "http://localhost:8000"
    
    print("\n--- Testing API Endpoints ---")
    
    async with httpx.AsyncClient() as client:
        # 1. Test Root
        try:
            resp = await client.get(f"{base_url}/")
            print(f"GET /: {resp.status_code} - {resp.json()}")
        except Exception as e:
            print(f"GET / failed: {e}")
            return # Exit if server is not up

        # 2. Test /api/chat/test (Direct Mimo test)
        print("\nTesting Direct Mimo Endpoint (/api/chat/test)...")
        try:
            payload = {"message": "Hello, simply reply with 'Mimo is working!'"}
            resp = await client.post(f"{base_url}/api/chat/test", json=payload, timeout=30.0)
            print(f"Status: {resp.status_code}")
            if resp.status_code == 200:
                print(f"Response: {resp.json()['response']}")
            else:
                print(f"Error: {resp.text}")
        except Exception as e:
            print(f"POST /api/chat/test failed: {e}")

        # 3. Test /api/chat/agent (LangGraph test - Brand Agent)
        print("\nTesting Agent Endpoint (/api/chat/agent)...")
        try:
            # Using a brand query to trigger the Brand Agent (which was just updated)
            payload = {"message": "Suggest a cool brand name for a coffee shop in Bangalore."}
            resp = await client.post(f"{base_url}/api/chat/agent", json=payload, timeout=60.0)
            print(f"Status: {resp.status_code}")
            if resp.status_code == 200:
                data = resp.json()
                print(f"Agent Used: {data.get('agent')}")
                print(f"Response Preview: {data.get('response')[:150]}...")
            else:
                print(f"Error: {resp.text}")
        except Exception as e:
            print(f"POST /api/chat/agent failed: {e}")

if __name__ == "__main__":
    try:
        asyncio.run(test_endpoints())
    except KeyboardInterrupt:
        print("Test stopped.")
