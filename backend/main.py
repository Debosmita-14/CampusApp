import sys
import os

# Ensure the backend directory is in the Python path for Vercel
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import booking, lost_found, events, chatbot, auth, analytics

app = FastAPI(
    title="CampusOS API",
    description="Backend for the AI-powered Campus Operating System.",
    version="2.0.0"
)

# Allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(booking.router, prefix="/api/bookings", tags=["bookings"])
app.include_router(lost_found.router, prefix="/api/lost-found", tags=["lost-found"])
app.include_router(events.router, prefix="/api/events", tags=["events"])
app.include_router(chatbot.router, prefix="/api/chatbot", tags=["chatbot"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])

@app.get("/")
def root():
    return {"message": "CampusOS API v2.0 is running.", "status": "operational"}

@app.get("/api")
def api_root():
    return {"message": "CampusOS API v2.0 is running.", "status": "operational"}
