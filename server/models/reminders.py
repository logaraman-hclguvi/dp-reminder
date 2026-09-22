from pydantic import BaseModel

class ReminderCreate(BaseModel):
    lead_id: str
    bd_id: str
    payment_id: str

    class Config:
        schema_extra = {
            "example": {
                "lead_id": "lead-123",
                "bd_id": "bd-123",
                "payment_id": "payment-123"
            }
        }

class Reminder(BaseModel):
    _id: str
    lead_id: str
    bd_id: str
    payment_id: str
    status: str  # 'pending', 'notified'

    class Config:
        schema_extra = {
            "example": {
                "_id": "rem-123",
                "lead_id": "lead-123",
                "bd_id": "bd-123",
                "payment_id": "payment-123",
                "status": "pending"
            }
        }
