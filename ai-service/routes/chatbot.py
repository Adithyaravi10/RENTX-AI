import os
import json
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from openai import OpenAI
from utils.context_builder import build_chat_context

router = APIRouter()

SYSTEM_PROMPT = """You are RentX AI — a smart, friendly assistant for the RentX vehicle rental platform in India.
You help users book vehicles, check prices, understand surge pricing, get weather-based suggestions,
find EV charging stations, and resolve booking issues. You know about the user's current context.
Always suggest eco-friendly options. Be concise and helpful. Use Indian context (INR, Indian cities).

Respond in JSON format with keys: reply (string), suggestions (array of 3 short strings), intent (one of:
booking_help, price_query, cancel_booking, find_vehicle, weather_advice, eco_tips, emergency, general)."""


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []
    userId: Optional[str] = None
    location: Optional[dict] = None
    currentBooking: Optional[dict] = None


def get_openai_client():
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key and api_key.startswith("sk-"):
        return OpenAI(api_key=api_key)
    return None


def call_gemini_fallback(messages_text: str) -> dict:
    try:
        import google.generativeai as genai
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            return None
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(
            f"{SYSTEM_PROMPT}\n\nUser message: {messages_text}\n\nRespond in JSON."
        )
        return json.loads(response.text.strip().replace("```json", "").replace("```", ""))
    except Exception:
        return None


def detect_intent(message: str) -> str:
    msg = message.lower()
    if any(w in msg for w in ["book", "reserve", "rent"]):
        return "booking_help"
    if any(w in msg for w in ["price", "cost", "surge", "₹", "rupee"]):
        return "price_query"
    if any(w in msg for w in ["cancel", "refund"]):
        return "cancel_booking"
    if any(w in msg for w in ["find", "search", "available", "vehicle", "car", "bike"]):
        return "find_vehicle"
    if any(w in msg for w in ["weather", "rain", "hot"]):
        return "weather_advice"
    if any(w in msg for w in ["eco", "green", "carbon", "ev", "electric"]):
        return "eco_tips"
    if any(w in msg for w in ["emergency", "sos", "help", "accident"]):
        return "emergency"
    return "general"


def fallback_response(message: str, context: str, intent: str) -> dict:
    responses = {
        "booking_help": "I can help you book a vehicle! Head to the Vehicles page, pick your ride, and use the booking wizard. Peak hours have 1.5x surge pricing.",
        "price_query": "Pricing depends on vehicle type and duration. EVs start at ₹50/hr, bikes at ₹45/hr, cars from ₹120/hr. Surge applies during peak hours (8-10 AM, 5-8 PM).",
        "find_vehicle": "Check our Vehicles page for 20+ options in Bengaluru. I recommend EVs for eco-friendly city trips!",
        "weather_advice": "Based on current conditions, I'd suggest checking our weather banner for the best vehicle type today.",
        "eco_tips": "Choose EVs or bikes to save CO₂! Every EV trip saves ~0.21 kg CO₂/km and earns +10 eco score points.",
        "emergency": "Press the SOS button on your dashboard immediately. Help will be alerted to our admin team.",
    }
    reply = responses.get(intent, f"Thanks for your message! I'm RentX AI, here to help with vehicle rentals in India. {context[:100]}")
    return {
        "reply": reply,
        "suggestions": ["Find vehicles", "Check prices", "EV charging stations"],
        "intent": intent,
    }


@router.post("/chat")
async def chat(request: ChatRequest):
    context = await build_chat_context(
        request.userId, request.location, request.currentBooking
    )

    intent = detect_intent(request.message)

    messages = [{"role": "system", "content": f"{SYSTEM_PROMPT}\n\nContext:\n{context}"}]
    for msg in request.history[-10:]:
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": request.message})

    client = get_openai_client()

    if client:
        try:
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=messages,
                response_format={"type": "json_object"},
                max_tokens=500,
                temperature=0.7,
            )
            result = json.loads(response.choices[0].message.content)
            return {"success": True, **result}
        except Exception as e:
            gemini_result = call_gemini_fallback(request.message + "\n" + context)
            if gemini_result:
                return {"success": True, **gemini_result}
            print(f"[AI] OpenAI error: {e}")

    return {"success": True, **fallback_response(request.message, context, intent)}
