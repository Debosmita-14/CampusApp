from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

# In a real scenario, this would use google-genai and perform RAG retrieval given the FAISS index
@router.post("/")
def chat_with_bot(request: ChatRequest):
    user_msg = request.message.lower()
    
    # Mock RAG intent detection based on basic keywords
    if "book" in user_msg or "room" in user_msg or "study" in user_msg:
        response = "You can book a study room by going to the 'Booking' tab in the app. Currently, Library Study Room A is available."
    elif "lost" in user_msg or "found" in user_msg:
        response = "If you lost an item, please check the 'Lost & Found' feed. You can also report an item there."
    elif "event" in user_msg:
        response = "There is a Tech Talk on AI in 2024 happening in the Auditorium on Nov 1st!"
    else:
        response = "I am mapping all the campus resources! How can I help you regarding bookings, lost & found, or events today?"
        
    return {"response": response, "source": "RAG Database"}
