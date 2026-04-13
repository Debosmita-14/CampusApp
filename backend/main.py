from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import booking, lost_found, events, chatbot

app = FastAPI(
    title="Campus Resource API",
    description="Backend for the AI-powered campus resource management system.",
    version="1.0.0"
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

@app.get("/")
def root():
    return {"message": "Campus Resource API is running."}
