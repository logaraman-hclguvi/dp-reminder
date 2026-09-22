from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional
from datetime import datetime, timezone
import uuid
from database import get_db
from models.lead import LeadCreate, LeadResponse, LeadStatusUpdate

router = APIRouter(prefix="", tags=["Leads"])

@router.get("/leads", response_model=List[LeadResponse])
async def list_leads(bd_id: Optional[str] = Query(None, description="Filter leads by assigned BD ID")):
    """List leads assigned to a specific BD or all leads."""
    db = get_db()
    query = {}
    if bd_id:
        query["assigned_bd_id"] = bd_id

    leads = []
    cursor = db.leads.find(query).sort("created_at", -1)
    async for doc in cursor:
        leads.append(LeadResponse(
            id=doc["_id"],
            name=doc["name"],
            phone=doc["phone"],
            email=doc.get("email", ""),
            course_id=doc["course_id"],
            assigned_bd_id=doc["assigned_bd_id"],
            status=doc.get("status", "NEW"),
            created_at=doc.get("created_at")
        ))
    return leads

@router.post("/leads", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
async def create_lead(lead_data: LeadCreate):
    """Create a new lead."""
    db = get_db()
    now = datetime.now(timezone.utc)
    lead_id = f"lead_{uuid.uuid4().hex[:6]}"

    doc = {
        "_id": lead_id,
        "name": lead_data.name,
        "phone": lead_data.phone,
        "email": lead_data.email or "",
        "course_id": lead_data.course_id,
        "assigned_bd_id": lead_data.assigned_bd_id,
        "status": "NEW",
        "created_at": now
    }

    await db.leads.insert_one(doc)
    return LeadResponse(
        id=lead_id,
        name=doc["name"],
        phone=doc["phone"],
        email=doc["email"],
        course_id=doc["course_id"],
        assigned_bd_id=doc["assigned_bd_id"],
        status=doc["status"],
        created_at=now
    )

@router.patch("/leads/{lead_id}/status")
async def update_lead_status(lead_id: str, payload: LeadStatusUpdate):
    """Dynamically update a candidate lead's pipeline status."""
    db = get_db()
    lead = await db.leads.find_one({"_id": lead_id})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    new_status = payload.status.upper()
    await db.leads.update_one({"_id": lead_id}, {"$set": {"status": new_status}})
    return {"status": "success", "message": f"Lead {lead_id} status updated to {new_status}", "new_status": new_status}
