from twilio.rest import Client
import os
from supabase import create_client, Client
from backend.app.config import SUPABASE_URL, SUPABASE_API_KEY
from dotenv import load_dotenv
from flask import Flask, request, jsonify, Blueprint

# Load environment variables from .env file
load_dotenv()
supabase: Client = create_client(SUPABASE_URL, SUPABASE_API_KEY)
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

@alerts_bp.route("/get_alerts", methods=["GET"])
def get_crowd_data():
    try:
        response = (
            supabase.table("crowd_data")
            .select("*")
            .execute()  # Explicitly pass API key
        )

        print(response)
        if response.data:
            return jsonify({"status": "success", "data": response.data}), 200
        else:
            return jsonify({"status": "success", "data": []}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": f"Error fetching crowd data: {str(e)}"}), 500
