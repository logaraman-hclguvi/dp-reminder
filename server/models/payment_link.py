from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PaymentLinkCreate(BaseModel):
    lead_id: str
    bd_id: str
    course_id: str
    amount: float
    payment_type: str = "TOKEN"  # TOKEN, FULL
    expiry_hours: float = 24.0

class PaymentLinkStatusUpdate(BaseModel):
    status: str  # PENDING, OVERDUE, PAID, CANCELLED

class PaymentLinkResponse(BaseModel):
    id: str
    lead_id: str
    bd_id: str
    course_id: str
    amount: float
    payment_type: str
    status: str  # PENDING, OVERDUE, PAID, EXPIRED, CANCELLED
    payment_url: str
    created_at: datetime
    due_at: datetime
    paid_at: Optional[datetime] = None
    gateway_transaction_id: Optional[str] = None
    # Enriched fields for easy UI consumption
    lead_name: Optional[str] = None
    lead_phone: Optional[str] = None
    lead_email: Optional[str] = None
    course_title: Optional[str] = None
    bd_name: Optional[str] = None
