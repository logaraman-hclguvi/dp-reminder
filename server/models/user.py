from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    id: str
    name: str
    email: str
    role: str = "BD_EXECUTIVE"
    is_active: bool = True

class UserCreate(BaseModel):
    id: Optional[str] = None
    name: str
    email: str
    role: str = "BD_EXECUTIVE"
    is_active: bool = True

class UserResponse(UserBase):
    created_at: Optional[datetime] = None
