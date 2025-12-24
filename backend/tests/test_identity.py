import httpx
import asyncio

async def test_all_endpoints():
    base_url = "http://localhost:8000"
    
    test_cases = [
        {"endpoint": "/api/test-ai", "message": "hey"},
        {"endpoint": "/api/chat/test", "message": "hello"},
        {"endpoint": "/api/test-ai", "message": "who are you?"},
    ]
    
    print("\n--- Testing Endpoints for Greetings and Identity ---")
    
    async with httpx.AsyncClient() as client:
        for case in test_cases:
            payload = {"message": case["message"]}
            try:
                resp = await client.post(f"{base_url}{case['endpoint']}", json=payload, timeout=30.0)
                if resp.status_code == 200:
                    print(f"\nEndpoint: {case['endpoint']}")
                    print(f"Input: '{case['message']}'")
                    print(f"Response: {resp.json()['response']}")
                else:
                    print(f"\nError: {resp.status_code} - {resp.text}")
            except Exception as e:
                print(f"\nTest failed for {case['endpoint']}: {e}")

if __name__ == "__main__":
    asyncio.run(test_all_endpoints())
