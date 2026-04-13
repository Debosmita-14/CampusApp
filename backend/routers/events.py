from fastapi import APIRouter

router = APIRouter()

events = [
    {"id": "1", "title": "Tech Talk: AI in 2024", "date": "2023-11-01T18:00:00Z", "location": "Auditorium"},
    {"id": "2", "title": "Campus Club Fair", "date": "2023-11-05T10:00:00Z", "location": "Main Quad"},
]

@router.get("/")
def get_events():
    return {"events": events}

@router.post("/{event_id}/register")
def register_event(event_id: str):
    return {"message": f"Successfully registered for event {event_id}"}

from pydantic import BaseModel

class EventCreate(BaseModel):
    title: str
    date: str
    location: str

@router.post("/add")
def add_event(event: EventCreate):
    new_event = {
        "id": str(len(events) + 1),
        "title": event.title,
        "date": event.date,
        "location": event.location
    }
    events.append(new_event)
    return {"message": "Event added successfully", "event": new_event}
