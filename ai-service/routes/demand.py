from fastapi import APIRouter
from datetime import datetime
from utils.context_builder import is_peak_hour, is_festival_day, fetch_available_vehicles

router = APIRouter()


@router.get("/forecast")
async def demand_forecast():
    vehicles = await fetch_available_vehicles()
    total = len(vehicles) or 1

    hour = datetime.now().hour
    base_demand = 0.4

    if is_peak_hour():
        base_demand = 0.85
    elif 11 <= hour <= 16:
        base_demand = 0.55
    elif hour >= 21 or hour < 6:
        base_demand = 0.25

    if is_festival_day():
        base_demand = min(1.0, base_demand + 0.2)

    surge_multiplier = 1.0
    if base_demand > 0.8:
        surge_multiplier = 1.8
    elif base_demand > 0.6:
        surge_multiplier = 1.5
    if is_festival_day():
        surge_multiplier *= 1.3

    surge_multiplier = min(round(surge_multiplier, 2), 2.5)

    return {
        "success": True,
        "demandLevel": round(base_demand, 2),
        "surgeMultiplier": surge_multiplier,
        "availableVehicles": total,
        "isPeakHour": is_peak_hour(),
        "isFestival": is_festival_day(),
        "recommendation": "Book early during peak hours" if is_peak_hour() else "Good time to book — lower demand",
    }
