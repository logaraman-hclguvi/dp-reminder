from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class NoteEntry(BaseModel):
    timestamp: datetime
    author_id: str
    author_name: Optional[str] = None
    comment: str

class NoteCreate(BaseModel):
    author_id: str
    comment: str

class EmailReminderRequest(BaseModel):
    payment_link_id: str
    to_email: Optional[str] = None
    reminder_type: Optional[str] = "PROACTIVE"  # PROACTIVE or OVERDUE

class ReminderResponse(BaseModel):
    id: str
    payment_link_id: str
    lead_id: str
    bd_id: str
    status: str  # ACTIVE, RESOLVED, DISMISSED
    triggered_at: datetime
    follow_up_count: int = 0
    notes: List[NoteEntry] = []
    resolved_at: Optional[datetime] = None
    # Enriched fields for UI
    lead_name: Optional[str] = None
    lead_phone: Optional[str] = None
    course_title: Optional[str] = None
    amount: Optional[float] = None
    created_at: Optional[datetime] = None
    due_at: Optional[datetime] = None
    overdue_duration_seconds: Optional[int] = None
