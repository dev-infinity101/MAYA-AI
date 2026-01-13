import httpx
import asyncio

async def test_greeting():
    base_url = "http://localhost:8000"
    print("\n--- Testing Custom Greeting ---")
    
    async with httpx.AsyncClient() as client:
        payload = {"message": "hey"}
        try:
            resp = await client.post(f"{base_url}/api/chat/agent", json=payload, timeout=30.0)
            if resp.status_code == 200:
                print(f"Input: 'hey'")
                print(f"Response: {resp.json()['response']}")
            else:
                print(f"Error: {resp.status_code} - {resp.text}")
        except Exception as e:
            print(f"Test failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_greeting())
