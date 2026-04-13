from fastapi import APIRouter

router = APIRouter()

items = [
    {"id": "1", "type": "lost", "title": "Blue Water Bottle", "location": "Library", "date": "2023-10-25"},
    {"id": "2", "type": "found", "title": "AirPods Pro", "location": "Gym", "date": "2023-10-26"},
]

@router.get("/")
def get_items():
    return {"items": items}

@router.post("/")
def report_item(item: dict):
    # expect typical item structure
    new_item = {
        "id": str(len(items) + 1),
        "type": item.get("type", "lost"),
        "title": item.get("title", "Unknown Request"),
        "location": item.get("location", "Unknown Location"),
        "date": item.get("date", "Today")
    }
    items.append(new_item)
    return {"message": "Item reported successfully", "item": new_item}
