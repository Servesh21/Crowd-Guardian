from flask import Flask
from flask_cors import CORS
from routes.detection import detection_bp
from routes.alerts import alerts_bp
from routes.fetch_crowd_data import crowd_bp
from routes.heatmap import heatmap_bp
from routes.videos import videos_bp
app = Flask(__name__)
CORS(app)  # Allow frontend to make API calls

# Register Blueprints (Modular API)
app.register_blueprint(detection_bp, url_prefix="/api/detect")
app.register_blueprint(alerts_bp, url_prefix="/api/alerts")
app.register_blueprint(crowd_bp,url_prefix="/api/crowd")
app.register_blueprint(heatmap_bp)
app.register_blueprint(videos_bp, url_prefix="/api/videos")


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
