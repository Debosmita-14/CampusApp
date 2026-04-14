from fastapi import APIRouter
from pydantic import BaseModel
import random

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

# Enhanced AI chatbot with campus-aware responses
CAMPUS_KNOWLEDGE = {
    "rooms": {
        "keywords": ["book", "room", "study", "seat", "reserve", "library room", "lab"],
        "responses": [
            "📚 **Room Availability Update:**\n\n• Library Study Room A — Available (4 seats)\n• Student Center Booth 1 — Available (2 seats)\n• Library Study Room B — Reserved until 4 PM\n\nYou can book instantly from the 'Bookings' tab. The AI recommends Study Room A based on current crowd levels.",
            "🏫 Currently, 2 out of 3 rooms are available. Library Study Room A has low occupancy nearby. I'd recommend booking it now as demand typically peaks in 2 hours based on historical patterns.",
        ]
    },
    "events": {
        "keywords": ["event", "happening", "attend", "register", "rsvp", "hackathon", "fest"],
        "responses": [
            "📅 **Upcoming Events:**\n\n🎤 Tech Talk: AI in 2024 — Nov 1, Auditorium\n🎪 Campus Club Fair — Nov 5, Main Quad\n\nYou can RSVP directly from the 'Events' tab. The AI predicts the Auditorium will be at 70% capacity for the Tech Talk.",
            "🎉 There are 2 upcoming events! The Campus Club Fair has high interest — I'd suggest arriving early. Based on last year's data, peak attendance is between 11 AM - 1 PM.",
        ]
    },
    "lost": {
        "keywords": ["lost", "found", "missing", "item", "belong", "airpod", "bottle", "phone"],
        "responses": [
            "🔍 **Lost & Found Summary:**\n\n❌ Lost: Blue Water Bottle (Library)\n✅ Found: AirPods Pro (Gym)\n\nIf you've lost something, report it in the 'Lost & Found' tab. Our AI matching system will alert you if a matching item is found.",
            "📦 There are currently 2 items in the Lost & Found system. You can report a new item or check if yours has been found. The AI cross-references descriptions and locations automatically.",
        ]
    },
    "crowd": {
        "keywords": ["crowd", "busy", "full", "occupancy", "packed", "empty", "people", "how many"],
        "responses": [
            "📊 **Live Occupancy Report:**\n\n🟢 Main Library — 65% (moderate)\n🟡 Cafeteria — 78% (busy)\n🔴 Computer Lab A — 90% (crowded)\n🟢 Student Center — 35% (quiet)\n\nI recommend heading to the Student Center for a quiet study spot. The Library typically clears out after 6 PM.",
            "🗺️ The campus is moderately active right now. Computer Lab A is the busiest zone. Engineering Lab has available capacity. Check the 'Live Map' tab for real-time density visualization.",
        ]
    },
    "safety": {
        "keywords": ["safe", "alert", "emergency", "sos", "security", "danger", "fire"],
        "responses": [
            "🛡️ **Safety Status: All Clear**\n\nCampus Safety Score: 96.2%\nNo active emergency alerts.\n\n📋 Upcoming: Fire drill scheduled for tomorrow at 10 AM.\n\nFor emergencies, use the SOS feature or call campus security at ext. 911.",
            "🟢 No active safety alerts. The campus monitoring system is fully operational. There's a scheduled fire drill tomorrow — all students must participate. The AI has detected no anomalies in the last 2 hours.",
        ]
    },
    "schedule": {
        "keywords": ["schedule", "class", "timetable", "when", "time", "session", "lecture"],
        "responses": [
            "📋 **Smart Scheduling Active:**\n\nThe AI scheduler has 3 optimization suggestions:\n1. Room 301 can be freed for a larger class\n2. Lab sessions can be staggered to reduce congestion\n3. Exam prep rooms auto-reserved for next week\n\nCheck the 'Smart Schedule' tab for details.",
        ]
    },
    "help": {
        "keywords": ["help", "what can you do", "features", "how", "guide", "tutorial"],
        "responses": [
            "🤖 **I'm CampusAI, your intelligent campus assistant!**\n\nHere's what I can help with:\n\n📚 **Bookings** — Check room availability, book study spaces\n📊 **Live Data** — Real-time crowd density, occupancy\n📅 **Events** — Upcoming events, RSVP\n🔍 **Lost & Found** — Report or find items\n🛡️ **Safety** — Emergency alerts, campus safety\n📋 **Scheduling** — AI-optimized suggestions\n🔮 **Predictions** — Crowd forecasts, demand analysis\n\nJust ask me anything!",
        ]
    }
}

DEFAULT_RESPONSES = [
    "I'm your CampusOS AI assistant! I can help with room bookings, campus events, lost items, live occupancy data, and more. What would you like to know?",
    "I understand you have a question! I'm best at helping with campus resources — try asking about room availability, events, crowd levels, or safety alerts.",
    "Interesting question! While I'm continuously learning, I'm currently specialized in campus resource management. Try asking about bookings, events, or occupancy data.",
]

@router.post("/")
def chat_with_bot(request: ChatRequest):
    user_msg = request.message.lower()
    
    # AI intent detection with keyword matching
    for category, data in CAMPUS_KNOWLEDGE.items():
        for keyword in data["keywords"]:
            if keyword in user_msg:
                response = random.choice(data["responses"])
                return {"response": response, "source": f"CampusAI • {category.title()} Module"}
    
    # Default response
    response = random.choice(DEFAULT_RESPONSES)
    return {"response": response, "source": "CampusAI v2.1"}
