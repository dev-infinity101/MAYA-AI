import os
import requests
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

JINA_API_KEY = os.getenv("JINA_API_KEY")

def test_jina_embedding():
    if not JINA_API_KEY:
        print("Error: JINA_API_KEY not found in environment variables.")
        return

    print(f"Testing Jina AI API with Key: {JINA_API_KEY[:5]}...")

    url = "https://api.jina.ai/v1/embeddings"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {JINA_API_KEY}"
    }
    
    # Test text
    text = "Government schemes for farmers in India"
    
    data = {
        "input": [text],
        "model": "jina-embeddings-v3",
        "task": "retrieval.passage",
        "dimensions": 768  # Match our DB schema
    }

    try:
        response = requests.post(url, headers=headers, json=data)
        
        if response.status_code == 200:
            result = response.json()
            embedding = result["data"][0]["embedding"]
            print(f"\nSuccess! Generated embedding.")
            print(f"Dimension: {len(embedding)}")
            print(f"Sample (first 5): {embedding[:5]}")
            
            if len(embedding) == 768:
                print("\n✅ Verification Passed: Dimension is 768.")
            else:
                print(f"\n❌ Verification Failed: Expected 768, got {len(embedding)}.")
        else:
            print(f"\nError: API request failed with status code {response.status_code}")
            print(f"Response: {response.text}")

    except Exception as e:
        print(f"\nException occurred: {str(e)}")

if __name__ == "__main__":
    test_jina_embedding()
