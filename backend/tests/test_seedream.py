import asyncio
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Add the backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(backend_dir))

# Load environment variables from .env file
load_dotenv(backend_dir / ".env")

from services.seedream_service import seedream_service

async def test_seedream_generation():
    print("--- Seedream API Test ---")
    
    api_key = os.getenv("SEEDREAM_API_KEY")
    if not api_key:
        print("❌ Error: SEEDREAM_API_KEY not found in .env")
        return

    print(f"Using API Key: {api_key[:5]}...{api_key[-5:]}")
    
    prompt = "A serene mountain landscape at sunset with a crystal clear lake in the foreground, digital art style"
    print(f"Generating image for prompt: '{prompt}'...")
    
    try:
        image_url = await seedream_service.generate_image(prompt=prompt)
        
        if image_url:
            print(f"✅ Success! Image generated.")
            print(f"Image URL: {image_url}")
        else:
            print("❌ Failed to generate image. Check logs for details.")
            
    except Exception as e:
        print(f"❌ An error occurred: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_seedream_generation())
