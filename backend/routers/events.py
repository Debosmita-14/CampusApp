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
