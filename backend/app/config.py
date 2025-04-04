# config.py
from dotenv import load_dotenv
import os

load_dotenv()

# Supabase configuration
SUPABASE_URL =os.getenv('SUPABASE_URL')
SUPABASE_API_KEY =os.getenv('SUPABASE_API_KEY')


SAFE_EXIT_ROUTES = {
     "https://maps.google.com/?q=19.12345,72.98765",
    # "Central Plaza": "https://maps.google.com/?q=19.54321,72.12345",
    # "Food Court": "https://maps.google.com/?q=19.98765,72.45678"
}
