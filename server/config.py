import os
from typing import Optional
from flask import Flask
from flask_cors import CORS
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

supabase_url: Optional[str] = os.getenv('SUPABASE_URL')
supabase_key: Optional[str] = os.getenv('SUPABASE_KEY')

try:
    if not supabase_url or not supabase_key:
        raise ValueError("Supabase URL/Key not found. Check .env file.")
    supabase: Client = create_client(supabase_url, supabase_key)
    print("Supabase client initialized successfully.")
except ValueError as e:
    print(f"Error initializing Supabase: {e}")
    supabase = None
except Exception as e:
    print(f"An unexpected error occurred during Supabase initialization: {e}")
    supabase = None
def create_app():
    """Flask application factory."""
    app = Flask(__name__)

    # Configure CORS properly
    CORS(
        app,
        origins=os.getenv('CORS_ORIGINS', "http://localhost:3000").split(','), # Allow multiple origins from env var
        supports_credentials=True
    )

    print("Flask app created and CORS configured.")
    return app 