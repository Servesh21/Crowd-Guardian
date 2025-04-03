import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from twilio.rest import Client
import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Twilio Credentials
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")
ADMIN_PHONE_NUMBER = os.getenv("ADMIN_PHONE_NUMBER")

# Email Credentials
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
EMAIL_SENDER = os.getenv("EMAIL_SENDER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
EMAIL_RECEIVER = os.getenv("ADMIN_EMAIL")

def send_email_alert(subject, message):
    """Send an email alert to the admin."""
    msg = MIMEMultipart()
    msg["From"] = EMAIL_SENDER
    msg["To"] = EMAIL_RECEIVER
    msg["Subject"] = subject
    msg.attach(MIMEText(message, "plain"))

    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(EMAIL_SENDER, EMAIL_PASSWORD)
        server.sendmail(EMAIL_SENDER, EMAIL_RECEIVER, msg.as_string())
        server.quit()
        return "Email alert sent successfully!"
    except Exception as e:
        return f"Error sending email: {str(e)}"

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

@app.route("/send_alerts", methods=["POST"])
def send_alerts():
    subject = "Crowd Alert: High Risk Detected"
    message = "A high-density crowd has been detected. Immediate action is required!"

    email_status = send_email_alert(subject, message)
    sms_status = send_sms_alert(message)

    return jsonify({"email_status": email_status, "sms_status": sms_status}), 200

if __name__ == "__main__":
    app.run(debug=True)
