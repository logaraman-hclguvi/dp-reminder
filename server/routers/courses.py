from fastapi import APIRouter
from typing import List
from database import get_db
from models.course import CourseResponse

router = APIRouter(prefix="", tags=["Courses"])

@router.get("/courses", response_model=List[CourseResponse])
async def list_courses():
    """Lists all available courses."""
    db = get_db()
    courses = []
    cursor = db.courses.find({})
    async for doc in cursor:
        courses.append(CourseResponse(
            id=doc["_id"],
            title=doc["title"],
            code=doc.get("code", ""),
            total_fee=doc["total_fee"],
            default_token_amount=doc.get("default_token_amount", 2000.0),
            created_at=doc.get("created_at")
        ))
    return courses
