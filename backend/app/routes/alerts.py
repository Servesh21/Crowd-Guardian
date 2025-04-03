# routes/alerts.py
from fastapi import APIRouter
from supabase import create_client

router = APIRouter()

@router.post("/send-alert")
async def send_alert(event_id: int, message: str):
    # Insert alert into Supabase
    result = create_client.table("alerts").insert({"event_id": event_id, "message": message}).execute()
    
    if result.error:
        return {"error": result.error}
    
    return {"message": "Alert sent successfully!"}
