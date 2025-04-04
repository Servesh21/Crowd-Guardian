
import os
from supabase import create_client, Client
from backend.app.config import SUPABASE_URL, SUPABASE_API_KEY
from dotenv import load_dotenv
from flask import Flask, request, jsonify, Blueprint

# Load environment variables from .env file
load_dotenv()
supabase: Client = create_client(SUPABASE_URL, SUPABASE_API_KEY)
# print(supabase.)
alerts_bp = Blueprint("alerts", __name__)

# Twilio Credentials
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")
ADMIN_PHONE_NUMBER = os.getenv("ADMIN_PHONE_NUMBER")
def send_sms_alert(message):
    """Send an SMS alert using Twilio."""
    try:
        from twilio.rest import Client
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


# alert_service.py
# from twilio.rest import Client
# from  import TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
from backend.app.config import SAFE_EXIT_ROUTES


def send_alert(mobile_number, location):
    from twilio.rest import Client
    print(mobile_number)
    client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    print(client)
    print(mobile_number)
    exit_link ="https://maps.app.goo.gl/UbE1rPs6Y7CkPnFJ6",

    print(exit_link)
    message = f"🚨 URGENT: High crowd density detected at {location}. Please exit safely via this route: {exit_link}"
    print(message)
    message = client.messages.create(
        body=message,
        from_=TWILIO_PHONE_NUMBER,
        to=mobile_number
    )
    return message.sid


@alerts_bp.route('/send_alert', methods=['POST'])
def send_alert_route():
    data = request.get_json()
    mobile = data.get("mobile")
    location = data.get("location")
    if not mobile or not location:
        return jsonify({"error": "Mobile number and location required"}), 400

    try:

        sid = send_alert(mobile, location)
        print(sid)
        return jsonify({"status": "Alert sent", "sid": sid})
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500
