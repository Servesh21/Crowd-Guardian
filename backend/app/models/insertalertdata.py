from supabase import create_client, Client
from app.config import SUPABASE_URL, SUPABASE_API_KEY
from datetime import datetime

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_API_KEY)

# Function to insert an alert into the database
def insert_alert_data(location, message, image_path, people_count, density_per_sqm, risk_level):
    data = {
        "timestamp": datetime.utcnow().isoformat(),
        "location": location,
        "message": message,
        "image_path": image_path,
        "people_count": people_count,
        "density_per_sqm": density_per_sqm,
        "risk_level": risk_level
    }

    response = supabase.table("alerts").insert(data).execute()
    return response.data
