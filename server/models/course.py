from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CourseBase(BaseModel):
    id: str
    title: str
    code: str
    total_fee: float
    default_token_amount: float = 2000.0

class CourseCreate(BaseModel):
    id: Optional[str] = None
    title: str
    code: str
    total_fee: float
    default_token_amount: float = 2000.0

class CourseResponse(CourseBase):
    created_at: Optional[datetime] = None
