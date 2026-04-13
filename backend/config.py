import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Twilio Configuration
    TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
    TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
    TWILIO_WHATSAPP_NUMBER = os.getenv("TWILIO_WHATSAPP_NUMBER")

    # FastAPI settings
    PORT = int(os.getenv("PORT", 8000))
    API_V1_STR = "/api/v1"

settings = Settings()
