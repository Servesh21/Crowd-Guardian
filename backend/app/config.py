# config.py
from dotenv import load_dotenv
import os

load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("https://fhmirnkqdnhwansnnxnv.supabase.co")
SUPABASE_API_KEY = os.getenv("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZobWlybmtxZG5od2Fuc25ueG52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2NjkwNDEsImV4cCI6MjA1OTI0NTA0MX0.bdGJr52ePk0D26xywRPFwgSo2B0bK9jpGNh8fxucsMc")
