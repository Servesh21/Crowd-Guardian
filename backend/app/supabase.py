# supabase.py
from supabase import create_client, Client
from config import SUPABASE_URL, SUPABASE_API_KEY

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_API_KEY)

# Example: Fetch data from the "events" table
def get_all_events():
    response = supabase.table("events").select("*").execute()
    return response.data

def insert_alert(event_id: int, message: str):
    response = supabase.table("alerts").insert({"event_id": event_id, "message": message}).execute()
    return response.data
