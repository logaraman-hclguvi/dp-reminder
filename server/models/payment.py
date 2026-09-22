from pydantic import BaseModel
from typing import Optional, Any

from datetime import datetime

class PaymentCreate(BaseModel):
    lead_id: str

    class Config:
        schema_extra = {
            "example": {
                "lead_id": "lead-123"
            }
        }

class Payment(BaseModel):
    _id: str
    lead_id: str
    amount: Optional[str] = "Rs. 2000"
    status: str
    generated_at: Optional[datetime] = None

    class Config:
        schema_extra = {
            "example": {
                "_id": "payment-123",
                "lead_id": "lead-123",
                "amount": "Rs. 2000",
                "status": "pending"
            }
        }
