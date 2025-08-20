from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()
import os
SUPABASE_URL =os.getenv('SUPABASE_URL')
SUPABASE_API_KEY =os.getenv('SUPABASE_API_KEY')
from datetime import datetime

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_API_KEY)

# Function to insert an alert into the database
def insert_alert_data(location, grid_x, grid_y, latitude, longitude, message, image_path, people_count, density_per_sqm, risk_level, timestamp):
    data = {
        "location": location,
        "grid_x": grid_x,
        "grid_y": grid_y,
        "latitude": latitude,
        "longitude": longitude,
        "message": message,
        "image_path": image_path,
        "people_count": people_count,
        "density_per_sqm": density_per_sqm,
        "risk_level": risk_level,
        "timestamp": timestamp
    }

    response = supabase.table("alerts").insert(data).execute()
    print("Alert stored:", response)
