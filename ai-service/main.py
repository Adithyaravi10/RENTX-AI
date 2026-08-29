import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from routes.chatbot import router as chatbot_router
from routes.recommendations import router as recommendations_router
from routes.safety import router as safety_router
from routes.demand import router as demand_router

app = FastAPI(
    title="RentX AI Service",
    description="AI microservice for RentX vehicle rental platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chatbot_router, prefix="/api/ai", tags=["Chatbot"])
app.include_router(recommendations_router, prefix="/api/ai", tags=["Recommendations"])
app.include_router(safety_router, prefix="/api/ai", tags=["Safety"])
app.include_router(demand_router, prefix="/api/ai", tags=["Demand"])


@app.get("/health")
async def health():
    return {"status": "ok", "service": "rentx-ai"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True)
