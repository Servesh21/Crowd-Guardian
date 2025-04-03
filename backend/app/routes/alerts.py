from twilio.rest import Client
import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify, Blueprint

# Load environment variables from .env file
load_dotenv()

alerts_bp = Blueprint("alerts", __name__)

# Twilio Credentials
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")
ADMIN_PHONE_NUMBER = os.getenv("ADMIN_PHONE_NUMBER")

def send_sms_alert(message):
    """Send an SMS alert using Twilio."""
    try:
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        client.messages.create(
            body=message,
            from_=TWILIO_PHONE_NUMBER,
            to=ADMIN_PHONE_NUMBER
        )
        return "SMS alert sent successfully!"
    except Exception as e:
        return f"Error sending SMS: {str(e)}"

@alerts_bp.route("/send_alerts", methods=["POST"])
def send_alerts():
    message = "A high-density crowd has been detected. Immediate action is required!"
    sms_status = send_sms_alert(message)

    return jsonify({"sms_status": sms_status}), 200
