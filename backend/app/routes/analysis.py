from fastapi import APIRouter
from app.services.map_processing import calculate_area_from_polygon, get_location_coordinates, get_place_polygon
from objectdetection import objectdetect  # Assuming detection module exists

router = APIRouter()

@router.get("/risk_analysis")
def risk_analysis(location: str):
    """
    API endpoint to analyze crowd risk based on location.
    """
    lat, lng = get_location_coordinates(location)
    bounds = get_place_polygon(location)
    area = calculate_area_from_polygon(bounds)
    
    detected_people = objectdetect()  # Run detection
    density = detected_people / area  # Calculate crowd density

    # risk_level = "Low"
    # if density > 0.1: risk_level = "Medium"
    # if density > 0.3: risk_level = "High"

    return {
        "location": location,
        "latitude": lat,
        "longitude": lng,
        "area_sqm": area,
        "detected_people": detected_people,
        "density": density,
        # "risk_level": risk_level
    }
