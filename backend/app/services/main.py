# main.py
from fastapi import FastAPI
from backend.app.routes import alerts

# from app.routes import analysis, alerts, admin
# from backend.app.services.main import calculate_area
# from .objectdetection import objectdetect
# from backend.app.services.main import get_location_coordinates, get_place_polygon, calculate_area_from_polygon

app = FastAPI()

# @app.get("/calculate_area")
# def calculate_area(location: str):
#     """
#     API endpoint to get area of a user-entered location.
#     """
#     lat, lng = get_location_coordinates(location)
#     bounds = get_place_polygon(location)
#     area = calculate_area_from_polygon(bounds)
#
#     return {
#         "location": location,
#         "latitude": lat,
#         "longitude": lng,
#         "area_sqm": area
#     }
#

# app = FastAPI()

# Include routes
# app.include_router(analysis.router, prefix="/analysis", tags=["analysis"])
app.include_router(alerts.router, prefix="/alerts", tags=["alerts"])
# app.include_router(admin.router, prefix="/admin", tags=["admin"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Crowd Management API!"}

# @app.get("/check_risk")
# def check_risk():
#     # Example data - replace this with real inputs
#     detected_people = objectdetect()  # Run detection
#     area = calculate_area("sample_map.png")  # Process map
#     # risk_level = evaluate_risk(detected_people, area)  # Analyze risk
#
#     return {"detected_people": detected_people, "area": area}