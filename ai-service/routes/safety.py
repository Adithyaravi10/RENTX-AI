import math
import httpx
import os
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()
NODE_URL = os.getenv("NODE_INTERNAL_URL", "http://localhost:5000")


class SafetyRequest(BaseModel):
    vehicleId: str


def calculate_bearing(lat1, lng1, lat2, lng2):
    d_lng = math.radians(lng2 - lng1)
    lat1_r = math.radians(lat1)
    lat2_r = math.radians(lat2)
    y = math.sin(d_lng) * math.cos(lat2_r)
    x = math.cos(lat1_r) * math.sin(lat2_r) - math.sin(lat1_r) * math.cos(lat2_r) * math.cos(d_lng)
    return math.degrees(math.atan2(y, x))


@router.post("/safety")
async def analyze_safety(request: SafetyRequest):
    flags = []

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{NODE_URL}/api/vehicles/{request.vehicleId}/gps", timeout=5
            )
            if resp.status_code != 200:
                return {
                    "success": True,
                    "riskLevel": "low",
                    "flags": [],
                    "recommendation": "Insufficient GPS data for analysis.",
                }
            logs = resp.json().get("logs", [])[:20]
    except Exception:
        logs = []

    if len(logs) < 3:
        return {
            "success": True,
            "riskLevel": "low",
            "flags": [],
            "recommendation": "Not enough GPS data. Drive safely!",
        }

    high_speed_count = 0
    for log in logs:
        if log.get("speed", 0) > 80:
            high_speed_count += 1
        else:
            high_speed_count = 0
        if high_speed_count >= 3:
            flags.append("excessive_speed")
            break

    bearings = []
    for i in range(1, len(logs)):
        b = calculate_bearing(
            logs[i]["lat"], logs[i]["lng"],
            logs[i - 1]["lat"], logs[i - 1]["lng"],
        )
        bearings.append(b)

    zigzag_count = 0
    for i in range(1, len(bearings)):
        diff = abs(bearings[i] - bearings[i - 1])
        if diff > 90:
            zigzag_count += 1

    if zigzag_count >= 3:
        flags.append("erratic_driving")

    risk_level = "low"
    if len(flags) >= 2:
        risk_level = "high"
    elif len(flags) == 1:
        risk_level = "medium"

    recommendations = {
        "low": "Driving patterns look normal. Keep up the safe driving!",
        "medium": "Some irregular patterns detected. Please drive cautiously.",
        "high": "Multiple safety concerns detected. Vehicle may need inspection. Contact support.",
    }

    return {
        "success": True,
        "riskLevel": risk_level,
        "flags": flags,
        "recommendation": recommendations[risk_level],
    }
