from fastapi import APIRouter

router = APIRouter()

# Mock database
rooms = [
    {"id": "1", "name": "Library Study Room A", "capacity": 4, "available": True},
    {"id": "2", "name": "Library Study Room B", "capacity": 6, "available": False},
    {"id": "3", "name": "Student Center Booth 1", "capacity": 2, "available": True},
]

@router.get("/rooms")
def get_rooms():
    return {"rooms": rooms}

@router.post("/book/{room_id}")
def book_room(room_id: str):
    for room in rooms:
        if room["id"] == room_id:
            if room["available"]:
                room["available"] = False
                return {"message": "Room booked successfully", "room": room}
            else:
                return {"error": "Room is already booked"}
    return {"error": "Room not found"}
