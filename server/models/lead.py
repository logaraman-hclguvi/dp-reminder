from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class LeadCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = ""
    course_id: str
    assigned_bd_id: str

class LeadStatusUpdate(BaseModel):
    status: str  # NEW, PAYMENT_LINK_SENT, CONVERTED, LOST

class LeadResponse(BaseModel):
    id: str
    name: str
    phone: str
    email: Optional[str] = ""
    course_id: str
    assigned_bd_id: str
    status: str = "NEW"  # NEW, PAYMENT_LINK_SENT, CONVERTED, LOST
    created_at: Optional[datetime] = None
