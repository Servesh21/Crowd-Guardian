from flask import Flask
from flask_cors import CORS
from backend.app.routes.detection import detection_bp
from backend.app.routes.alerts import alerts_bp
from backend.app.routes.fetch_crowd_data import crowd_bp
app = Flask(__name__)
CORS(app)  # Allow frontend to make API calls

# Register Blueprints (Modular API)
app.register_blueprint(detection_bp, url_prefix="/api/detect")
app.register_blueprint(alerts_bp, url_prefix="/api/alerts")
app.register_blueprint(crowd_bp,url_prefix="/api/crowd")



if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
