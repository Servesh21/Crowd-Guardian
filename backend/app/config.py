# config.py
from dotenv import load_dotenv
import os

load_dotenv()

# Supabase configuration
SUPABASE_URL =os.getenv('SUPABASE_URL')
SUPABASE_API_KEY =os.getenv('SUPABASE_API_KEY')
