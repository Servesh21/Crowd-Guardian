from fastapi import APIRouter, HTTPException
from services.risk_analysis import calculate_risk
from services.map_processing import calculate_area

router = APIRouter()

@router.post("/risk-estimate/")
async def get_risk_estimate(coords: list, people_count: int):
    """
    Estimate crowd risk level based on area and number of people.
    """
    try:
        area_sqm = calculate_area(coords)
        risk = calculate_risk(area_sqm, people_count)
        return {"area": area_sqm, "risk": risk}
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
