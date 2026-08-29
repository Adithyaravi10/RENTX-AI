import os
from datetime import datetime
import httpx

NODE_URL = os.getenv("NODE_INTERNAL_URL", "http://localhost:5000")
OPENWEATHER_KEY = os.getenv("OPENWEATHER_API_KEY", "")


def is_peak_hour() -> bool:
    hour = datetime.now().hour
    return (8 <= hour < 10) or (17 <= hour < 20)


def is_festival_day() -> bool:
    now = datetime.now()
    festivals = [(1, 26), (8, 15), (10, 2), (11, 1), (12, 25)]
    return (now.month, now.day) in festivals


async def fetch_weather(lat: float = 12.9716, lng: float = 77.5946) -> dict:
    if not OPENWEATHER_KEY:
        return {"condition": "clear", "temp": 28, "humidity": 65, "description": "simulated"}
    try:
        async with httpx.AsyncClient() as client:
            url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lng}&appid={OPENWEATHER_KEY}&units=metric"
            resp = await client.get(url, timeout=5)
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "condition": data["weather"][0]["main"].lower(),
                    "temp": data["main"]["temp"],
                    "humidity": data["main"]["humidity"],
                    "description": data["weather"][0]["description"],
                }
    except Exception:
        pass
    return {"condition": "clear", "temp": 28, "humidity": 65, "description": "unavailable"}


async def fetch_available_vehicles() -> list:
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{NODE_URL}/api/vehicles/internal/available", timeout=5)
            if resp.status_code == 200:
                return resp.json().get("vehicles", [])
    except Exception:
        pass
    return []


async def fetch_user_context(user_id: str) -> dict:
    if not user_id:
        return {}
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{NODE_URL}/api/users/internal/{user_id}", timeout=5)
            if resp.status_code == 200:
                return resp.json()
    except Exception:
        pass
    return {}


def count_by_category(vehicles: list) -> dict:
    counts = {}
    for v in vehicles:
        cat = v.get("category", "CAR")
        counts[cat] = counts.get(cat, 0) + 1
    return counts


async def build_chat_context(
    user_id: str = None,
    location: dict = None,
    current_booking: dict = None,
) -> str:
    now = datetime.now()
    lat = (location or {}).get("lat", 12.9716)
    lng = (location or {}).get("lng", 77.5946)

    weather = await fetch_weather(lat, lng)
    vehicles = await fetch_available_vehicles()
    category_counts = count_by_category(vehicles)

    context_parts = [
        f"Current time: {now.strftime('%Y-%m-%d %H:%M IST')}",
        f"Peak hours active: {is_peak_hour()} (surge 1.5x if true)",
        f"Festival day: {is_festival_day()} (surge 1.3x if true)",
        f"Weather: {weather['description']}, {weather['temp']}°C, humidity {weather['humidity']}%",
        f"Available vehicles by category: {category_counts}",
        f"Total available vehicles: {len(vehicles)}",
    ]

    if current_booking:
        context_parts.append(f"Active booking: {current_booking}")

    return "\n".join(context_parts)
