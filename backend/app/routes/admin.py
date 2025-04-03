# routes/admin.py
from fastapi import APIRouter
from supabase import create_client

router = APIRouter()

@router.get("/events")
async def get_events():
    # Fetch all events from Supabase
    response = create_client.table("events").select("*").execute()
    
    if response.error:
        return {"error": response.error}
    
    return {"events": response.data}
