# config.py
from dotenv import load_dotenv
import os

load_dotenv()

# Supabase configuration
SUPABASE_URL =os.getenv('SUPABASE_URL')
SUPABASE_API_KEY =os.getenv('SUPABASE_API_KEY')


SAFE_EXIT_ROUTES = {
     "https://www.google.com/maps/dir//Phoenix+Marketcity,+Lal+Bahadur+Shastri+Marg,+Patelwadi.Kurla,+Kurla+West,+Kurla,+Mumbai,+Maharashtra/@19.086456,72.8477775,13z/data=!3m1!5s0x3be7c8878a6ce00d:0x5d860d2b775b3318!4m8!4m7!1m0!1m5!1m1!1s0x3be7c887efb78b9f:0x9f9dc99c3119470a!2m2!1d72.8889774!2d19.0863795?entry=ttu&g_ep=EgoyMDI1MDQwMi4xIKXMDSoASAFQAw%3D%3D",
    # "Central Plaza": "https://maps.google.com/?q=19.54321,72.12345",
    # "Food Court": "https://maps.google.com/?q=19.98765,72.45678"
}
