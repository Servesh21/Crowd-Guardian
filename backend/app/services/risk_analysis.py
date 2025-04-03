def calculate_risk(area_sqm, people_count, occupancy_per_person=1):
    """Calculate crowd density risk level based on area and people count."""
    
    # Compute safe capacity
    C_safe = area_sqm / occupancy_per_person  

    # Risk Calculation
    risk_ratio = people_count / C_safe

    # Define Risk Levels
    if risk_ratio < 0.8:
        return {"status": "🟢 SAFE", "risk_ratio": risk_ratio}
    elif 0.8 <= risk_ratio < 1.0:
        return {"status": "🟡 CAUTION", "risk_ratio": risk_ratio}
    else:
        return {"status": "🔴 DANGER - OVERCROWDED", "risk_ratio": risk_ratio}
