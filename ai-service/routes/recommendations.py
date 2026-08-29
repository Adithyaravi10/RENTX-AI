import os
import json
import httpx
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from openai import OpenAI
from utils.vehicle_scorer import score_vehicle

router = APIRouter()
NODE_URL = os.getenv("NODE_INTERNAL_URL", "http://localhost:5000")


class RecommendRequest(BaseModel):
    userId: Optional[str] = None
    distanceKm: float = 10
    budgetInr: float = 500
    weather: str = "clear"
    trafficLevel: str = "moderate"
    groupSize: int = 1
    purpose: str = "commute"
    temp: float = 28


async def fetch_vehicles():
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{NODE_URL}/api/vehicles/internal/available", timeout=5)
            if resp.status_code == 200:
                return resp.json().get("vehicles", [])
    except Exception:
        pass
    return []


def generate_ai_reason(vehicle: dict, context: str, client) -> str:
    if not client:
        cat = vehicle.get("category", "vehicle")
        fuel = vehicle.get("fuelType", "PETROL")
        return f"Great {cat.lower()} choice — {fuel.lower()} power suits your {context} trip perfectly."

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": f"Explain in 1 sentence why {vehicle['name']} is perfect for this trip: {context}",
                }
            ],
            max_tokens=80,
        )
        return response.choices[0].message.content.strip()
    except Exception:
        return f"{vehicle['name']} is a smart pick for your trip based on distance and conditions."


@router.post("/recommend")
async def recommend(request: RecommendRequest):
    vehicles = await fetch_vehicles()

    if not vehicles:
        return {"success": True, "recommendations": []}

    params = request.model_dump()
    scored = [score_vehicle(v, params) for v in vehicles]
    scored.sort(key=lambda x: x["totalScore"], reverse=True)
    top3 = scored[:3]

    context = (
        f"{request.distanceKm}km trip, budget ₹{request.budgetInr}, "
        f"weather: {request.weather}, traffic: {request.trafficLevel}, "
        f"purpose: {request.purpose}"
    )

    api_key = os.getenv("OPENAI_API_KEY")
    client = OpenAI(api_key=api_key) if api_key and api_key.startswith("sk-") else None

    recommendations = []
    for item in top3:
        vehicle = item["vehicle"]
        ai_reason = generate_ai_reason(vehicle, context, client)
        recommendations.append({
            "vehicle": vehicle,
            "totalScore": item["totalScore"],
            "aiReason": ai_reason,
            "co2Estimate": item["co2Estimate"],
            "breakdown": item["breakdown"],
        })

    return {"success": True, "recommendations": recommendations}
