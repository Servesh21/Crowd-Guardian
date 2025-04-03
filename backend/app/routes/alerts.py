from fastapi import APIRouter, HTTPException
from bavvapp.services.alerts import send_email_alert, send_sms_alert  # Import alert functions

router = APIRouter()

@router.post("/send_alerts", status_code=200)
def send_alerts():
    subject = "Crowd Alert: High Risk Detected"
    message = "A high-density crowd has been detected. Immediate action is required!"

    try:
        send_email_alert(subject, message)  # Send email alert
        send_sms_alert(message)  # Send SMS alert
        return {"status": "Alerts Sent Successfully!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Alert Failed: {e}")
