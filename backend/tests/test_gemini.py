import os
import google.generativeai as genai
from dotenv import load_dotenv

def test_gemini():
    # Load environment variables from .env file
    load_dotenv()
    
    print("\n--- Gemini 2.0 Flash Simple Test ---")
    
    # Check for API key
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    
    if not api_key:
        print("❌ FAILED: No GEMINI_API_KEY or GOOGLE_API_KEY found in .env")
        return

    print(f"✅ API Key found: {api_key[:5]}...{api_key[-5:]}")
    
    try:
        # Configure the SDK
        genai.configure(api_key=api_key)
        
        # Initialize the model (using Gemini 2.0 Flash)
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        test_prompt = "Hello! Confirm you are Gemini 2.0 Flash and tell me one thing you can do."
        print(f"Sending test prompt: '{test_prompt}'")
        
        # Generate content
        response = model.generate_content(test_prompt)
        
        if response.text:
            print(f"✨ SUCCESS: Gemini Response:\n{response.text}")
        else:
            print("❌ FAILED: Received empty response from Gemini")
            
    except Exception as e:
        print(f"❌ FAILED: An error occurred: {str(e)}")
        print("\nNote: Make sure 'google-generativeai' is installed (pip install google-generativeai)")

if __name__ == "__main__":
    test_gemini()
