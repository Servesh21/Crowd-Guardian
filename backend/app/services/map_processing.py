import requests
from geopy.distance import geodesic

API_KEY = "YOUR_GOOGLE_MAPS_API_KEY"  # Replace with your API key

def get_location_coordinates(location_name):
    """
    Converts a location name to latitude & longitude using Google Geocoding API.
    """
    url = f"https://maps.googleapis.com/maps/api/geocode/json?address={location_name}&key={API_KEY}"
    
    response = requests.get(url)
    data = response.json()
    
    if data['status'] == "OK":
        location = data['results'][0]['geometry']['location']
        return location['lat'], location['lng']
    else:
        raise Exception(f"Error fetching location: {data['status']}")

def get_place_polygon(location_name):
    """
    Fetches the boundary (polygon) of a location using Google Places API.
    """
    url = f"https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input={location_name}&inputtype=textquery&fields=geometry&key={API_KEY}"
    
    response = requests.get(url)
    data = response.json()
    
    if data['status'] == "OK":
        bounds = data['candidates'][0]['geometry']['viewport']
        return bounds
    else:
        raise Exception(f"Error fetching place polygon: {data['status']}")

def calculate_area_from_polygon(bounds):
    """
    Calculates the approximate area of a given location using boundary points.
    """
    northeast = (bounds["northeast"]["lat"], bounds["northeast"]["lng"])
    southwest = (bounds["southwest"]["lat"], bounds["southwest"]["lng"])
    
    # Approximate width and height using geodesic distance
    width = geodesic(northeast, (northeast[0], southwest[1])).meters
    height = geodesic(northeast, (southwest[0], northeast[1])).meters

    area = width * height  # Approximate rectangular area
    return area
