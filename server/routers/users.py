from fastapi import APIRouter, HTTPException
from typing import List
from database import get_db
from models.user import UserResponse

router = APIRouter(prefix="", tags=["Users & BDs"])

@router.get("/users/bds", response_model=List[UserResponse])
async def list_bd_users():
    """Returns list of active BD users for the UI profile switcher."""
    db = get_db()
    users = []
    cursor = db.users.find({"is_active": True})
    async for doc in cursor:
        users.append(UserResponse(
            id=doc["_id"],
            name=doc["name"],
            email=doc["email"],
            role=doc.get("role", "BD_EXECUTIVE"),
            is_active=doc.get("is_active", True),
            created_at=doc.get("created_at")
        ))
    return users
