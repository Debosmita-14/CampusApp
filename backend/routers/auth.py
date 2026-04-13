from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

# Mock users database
# Default admin user included
users_db = [
    {"id": "1", "username": "admin", "password": "password123", "role": "admin"},
    {"id": "2", "username": "user1", "password": "password123", "role": "user"}
]

class UserAuth(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    role: str

@router.post("/login")
def login(user: UserAuth):
    for u in users_db:
        if u["username"] == user.username and u["password"] == user.password:
            return {"message": "Login successful", "user": {"id": u["id"], "username": u["username"], "role": u["role"]}}
    raise HTTPException(status_code=401, detail="Invalid credentials")

@router.post("/signup")
def signup(user: UserAuth):
    for u in users_db:
        if u["username"] == user.username:
            raise HTTPException(status_code=400, detail="Username already exists")
    
    new_user = {
        "id": str(len(users_db) + 1),
        "username": user.username,
        "password": user.password,
        "role": "user" # default role is user
    }
    users_db.append(new_user)
    return {"message": "Signup successful", "user": {"id": new_user["id"], "username": new_user["username"], "role": new_user["role"]}}

@router.get("/users")
def get_all_users():
    # Only return safe info
    safe_users = [{"id": u["id"], "username": u["username"], "role": u["role"]} for u in users_db]
    return {"users": safe_users}
