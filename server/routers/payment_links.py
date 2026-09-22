from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional
from datetime import datetime, timedelta, timezone
import uuid
from database import get_db
from models.payment_link import PaymentLinkCreate, PaymentLinkResponse, PaymentLinkStatusUpdate

router = APIRouter(prefix="", tags=["Payment Links"])

@router.post("/payment-links", response_model=PaymentLinkResponse, status_code=status.HTTP_201_CREATED)
async def create_payment_link(data: PaymentLinkCreate):
    """Generate a new payment link for a lead with 24h default due time."""
    db = get_db()
    now = datetime.now(timezone.utc)
    due_at = now + timedelta(hours=data.expiry_hours)
    link_id = f"pl_{uuid.uuid4().hex[:8]}"

    # Verify lead exists
    lead = await db.leads.find_one({"_id": data.lead_id})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    # Verify course exists
    course = await db.courses.find_one({"_id": data.course_id})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Verify BD exists
    bd = await db.users.find_one({"_id": data.bd_id})
    if not bd:
        raise HTTPException(status_code=404, detail="BD user not found")

    # Cancel any previous active/pending/overdue links for this lead to avoid duplicate tracking
    await db.payment_links.update_many(
        {"lead_id": data.lead_id, "status": {"$in": ["PENDING", "OVERDUE"]}},
        {"$set": {"status": "CANCELLED"}}
    )
    await db.reminders.update_many(
        {"lead_id": data.lead_id, "status": "ACTIVE"},
        {"$set": {"status": "DISMISSED", "resolved_at": now}}
    )

    # Build payment link
    payment_url = f"http://localhost:3000/pay/{link_id}"
    doc = {
        "_id": link_id,
        "lead_id": data.lead_id,
        "bd_id": data.bd_id,
        "course_id": data.course_id,
        "amount": data.amount,
        "payment_type": data.payment_type,
        "status": "PENDING",
        "payment_url": payment_url,
        "created_at": now,
        "due_at": due_at,
        "paid_at": None,
        "gateway_transaction_id": None
    }

    await db.payment_links.insert_one(doc)

    # Update lead status
    await db.leads.update_one(
        {"_id": data.lead_id},
        {"$set": {"status": "PAYMENT_LINK_SENT"}}
    )

    return PaymentLinkResponse(
        id=link_id,
        lead_id=doc["lead_id"],
        bd_id=doc["bd_id"],
        course_id=doc["course_id"],
        amount=doc["amount"],
        payment_type=doc["payment_type"],
        status=doc["status"],
        payment_url=doc["payment_url"],
        created_at=doc["created_at"],
        due_at=doc["due_at"],
        lead_name=lead.get("name"),
        lead_phone=lead.get("phone"),
        lead_email=lead.get("email", ""),
        course_title=course.get("title"),
        bd_name=bd.get("name")
    )

@router.get("/payment-links", response_model=List[PaymentLinkResponse])
async def list_payment_links(
    bd_id: Optional[str] = Query(None, description="Filter by BD"),
    status: Optional[str] = Query(None, description="Filter by status (PENDING, OVERDUE, PAID, etc.)")
):
    """List payment links with enrichment."""
    db = get_db()
    query = {}
    if bd_id:
        query["bd_id"] = bd_id
    if status and status != "ALL":
        query["status"] = status

    links = []
    cursor = db.payment_links.find(query).sort("created_at", -1)

    # Fetch lookup dicts for high performance
    leads_map = {doc["_id"]: doc async for doc in db.leads.find({})}
    courses_map = {doc["_id"]: doc async for doc in db.courses.find({})}
    users_map = {doc["_id"]: doc async for doc in db.users.find({})}

    async for doc in cursor:
        lead = leads_map.get(doc.get("lead_id"), {})
        course = courses_map.get(doc.get("course_id"), {})
        bd = users_map.get(doc.get("bd_id"), {})

        links.append(PaymentLinkResponse(
            id=doc["_id"],
            lead_id=doc.get("lead_id", ""),
            bd_id=doc.get("bd_id", ""),
            course_id=doc.get("course_id", ""),
            amount=doc.get("amount", 0.0),
            payment_type=doc.get("payment_type", "TOKEN"),
            status=doc.get("status", "PENDING"),
            payment_url=doc.get("payment_url", ""),
            created_at=doc.get("created_at"),
            due_at=doc.get("due_at"),
            paid_at=doc.get("paid_at"),
            gateway_transaction_id=doc.get("gateway_transaction_id"),
            lead_name=lead.get("name"),
            lead_phone=lead.get("phone"),
            lead_email=lead.get("email", ""),
            course_title=course.get("title"),
            bd_name=bd.get("name")
        ))
    return links

@router.patch("/payment-links/{link_id}/cancel")
async def cancel_payment_link(link_id: str):
    """Cancel an active or overdue payment link."""
    db = get_db()
    now = datetime.now(timezone.utc)
    link = await db.payment_links.find_one({"_id": link_id})
    if not link:
        raise HTTPException(status_code=404, detail="Payment link not found")

    await db.payment_links.update_one(
        {"_id": link_id},
        {"$set": {"status": "CANCELLED"}}
    )

    # Dismiss any active reminder
    await db.reminders.update_many(
        {"payment_link_id": link_id, "status": "ACTIVE"},
        {"$set": {"status": "DISMISSED", "resolved_at": now}}
    )

    return {"status": "success", "message": f"Payment link {link_id} has been cancelled."}

@router.patch("/payment-links/{link_id}/status")
async def update_payment_link_status(link_id: str, payload: PaymentLinkStatusUpdate):
    """Dynamically update a payment link's status (PENDING, OVERDUE, PAID, CANCELLED)."""
    db = get_db()
    now = datetime.now(timezone.utc)
    new_status = payload.status.upper()

    link = await db.payment_links.find_one({"_id": link_id})
    if not link:
        raise HTTPException(status_code=404, detail="Payment link not found")

    update_fields = {"status": new_status}
    if new_status == "PAID":
        update_fields["paid_at"] = now
        # Also mark associated lead to CONVERTED
        if link.get("lead_id"):
            await db.leads.update_one({"_id": link["lead_id"]}, {"$set": {"status": "CONVERTED"}})
        # Dismiss any active reminder
        await db.reminders.update_many(
            {"payment_link_id": link_id, "status": "ACTIVE"},
            {"$set": {"status": "RESOLVED", "resolved_at": now}}
        )
    elif new_status == "OVERDUE":
        # Create active reminder if one does not exist
        existing = await db.reminders.find_one({"payment_link_id": link_id, "status": "ACTIVE"})
        if not existing:
            rem_id = f"rem_{uuid.uuid4().hex[:8]}"
            await db.reminders.insert_one({
                "_id": rem_id,
                "payment_link_id": link_id,
                "lead_id": link.get("lead_id", ""),
                "bd_id": link.get("bd_id", ""),
                "status": "ACTIVE",
                "triggered_at": link.get("due_at") or now,
                "follow_up_count": 0,
                "notes": [],
                "resolved_at": None
            })
    elif new_status == "CANCELLED":
        await db.reminders.update_many(
            {"payment_link_id": link_id, "status": "ACTIVE"},
            {"$set": {"status": "DISMISSED", "resolved_at": now}}
        )

    await db.payment_links.update_one({"_id": link_id}, {"$set": update_fields})
    return {"status": "success", "message": f"Payment link {link_id} status changed to {new_status}", "new_status": new_status}
