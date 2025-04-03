from fastapi import APIRouter, HTTPException
from supabase import create_client, Client
from backend.app.config import SUPABASE_URL, SUPABASE_API_KEY

router = APIRouter()

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_API_KEY)

@router.get("/crowd_data")
def get_crowd_data():
    try:
        response = supabase.table("crowd_data").select("*").execute()
        if response.data:
            return {"status": "success", "data": response.data}
        else:
            return {"status": "success", "data": []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching crowd data: {e}")
