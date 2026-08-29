def score_vehicle(vehicle: dict, params: dict) -> dict:
    budget = params.get("budgetInr", 500)
    distance = params.get("distanceKm", 10)
    weather = params.get("weather", "clear").lower()
    traffic = params.get("trafficLevel", "moderate").lower()
    price = vehicle.get("pricePerHour", 100)
    category = vehicle.get("category", "CAR")
    fuel_type = vehicle.get("fuelType", "PETROL")

    budget_score = max(0, min(30, ((budget - price) / budget) * 30)) if budget > 0 else 0

    weather_score = 0
    if "rain" in weather:
        if category in ("CAR", "LUXURY"):
            weather_score = 20
    elif "clear" in weather:
        if category in ("BIKE", "SCOOTER"):
            weather_score = 15
    if params.get("temp", 25) > 35 and fuel_type == "ELECTRIC":
        weather_score += 10

    traffic_score = 0
    if traffic == "heavy":
        if category in ("SCOOTER", "BIKE"):
            traffic_score = 20
    elif traffic == "light":
        if category == "CAR":
            traffic_score = 10

    efficiency_score = 0
    if fuel_type == "ELECTRIC":
        efficiency_score = 20
    elif category in ("BIKE", "SCOOTER"):
        efficiency_score = 15
    elif category == "CAR":
        efficiency_score = 5

    distance_score = 0
    if distance < 5:
        if category == "SCOOTER":
            distance_score = 20
    elif distance <= 20:
        if category == "BIKE":
            distance_score = 15
    else:
        if category in ("CAR", "LUXURY"):
            distance_score = 20

    total = budget_score + weather_score + traffic_score + efficiency_score + distance_score

    co2_estimate = 0
    if fuel_type == "ELECTRIC":
        co2_estimate = distance * 0.21
    elif category in ("BIKE", "SCOOTER"):
        co2_estimate = distance * 0.08
    else:
        co2_estimate = distance * 0.05

    return {
        "vehicle": vehicle,
        "totalScore": round(min(100, total), 1),
        "breakdown": {
            "budget": round(budget_score, 1),
            "weather": weather_score,
            "traffic": traffic_score,
            "efficiency": efficiency_score,
            "distance": distance_score,
        },
        "co2Estimate": round(co2_estimate, 2),
    }
