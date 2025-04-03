# models/congestion_predictor.py
def predict_congestion(crowd_data: dict):
    # Replace this with actual prediction logic
    people_detected = crowd_data["people_detected"]
    if people_detected > 80:
        return "High congestion"
    else:
        return "Low congestion"
