import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    # TELEGRAM_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN") # Removed
    # ALLOWED_CHAT_IDS = ... # Removed
    
    # NEW: Supabase Config
    SUPABASE_URL = os.getenv("VITE_SUPABASE_URL") 
    SUPABASE_KEY = os.getenv("VITE_SUPABASE_SERVICE_KEY")  # Use service_role key to bypass RLS
    TARGET_USER_ID = os.getenv("TARGET_USER_ID") # DEPRECATED: Now using multi-user approach
    
    # Gmail OAuth Credentials (from credentials.json)
    GMAIL_CLIENT_ID = os.getenv("GMAIL_CLIENT_ID")  # Add this to .env
    GMAIL_CLIENT_SECRET = os.getenv("GMAIL_CLIENT_SECRET")  # Add this to .env

    GOOGLE_CREDENTIALS = os.getenv("GOOGLE_CREDENTIALS_FILE", "credentials.json")
    PROFESSIONAL_NAME = os.getenv("PROFESSIONAL_NAME", "Your Name")
    BUSINESS_NAME = os.getenv("BUSINESS_NAME", "Your Business")
    CHECK_INTERVAL = int(os.getenv("CHECK_INTERVAL_MINUTES", "5"))

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    PROMPTS_DIR = os.path.join(BASE_DIR, "prompts")
    TOKEN_PATH = os.path.join(BASE_DIR, "token.json")