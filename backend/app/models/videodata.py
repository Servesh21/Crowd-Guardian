from supabase import create_client, Client
from app.config import SUPABASE_URL,SUPABASE_API_KEY
from datetime import datetime
import json

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_API_KEY)

# Function to create the "crowd_data" table if it doesn't exist
def create_crowd_table():
    query = """
    CREATE TABLE IF NOT EXISTS crowd_data (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        timestamp TIMESTAMP DEFAULT now(),
        location TEXT,
        people_count INT NOT NULL,
        area_sqm FLOAT NOT NULL,
        density_per_sqm FLOAT NOT NULL,
        risk_level TEXT CHECK (risk_level IN ('Low', 'Medium', 'High')),
        occupancy INT NOT NULL,
        density_over_time JSONB,
        occupancy_over_time JSONB
    );
    """
    response = supabase.rpc("sql", {"query": query}).execute()
    return response

# Function to insert crowd data into the database
def insert_crowd_data(location, people_count, area_sqm, density_over_time, occupancy_over_time):
    density_per_sqm = people_count / area_sqm  # Calculate density
    occupancy = people_count  # Assuming occupancy is the same as the total count
    risk_level = "Low" if density_per_sqm < 2 else "Medium" if density_per_sqm < 4 else "High"

    data = {
        "timestamp": datetime.utcnow().isoformat(),
        "location": location,
        "people_count": people_count,
        "area_sqm": area_sqm,
        "density_per_sqm": density_per_sqm,
        "risk_level": risk_level,
        "occupancy": occupancy,
        "density_over_time": json.dumps(density_over_time),
        "occupancy_over_time": json.dumps(occupancy_over_time),
    }

    response = supabase.table("crowd_data").insert(data).execute()
    return response.data
