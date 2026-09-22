from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional
from datetime import datetime, timezone
import logging
from database import get_db
from models.reminder import ReminderResponse, NoteCreate, NoteEntry, EmailReminderRequest
from services.overdue_service import evaluate_overdue_payments
from services.email_service import send_payment_reminder_email

logger = logging.getLogger("uvicorn.error")

router = APIRouter(prefix="", tags=["Reminders & Overdue Queue"])

@router.get("/reminders/overdue", response_model=List[ReminderResponse])
async def list_overdue_reminders(bd_id: Optional[str] = Query(None, description="Filter reminders by BD ID")):
    """
    Returns active overdue reminders for the BD follow-up operational queue.
    Includes lead details, course name, amount, and elapsed time overdue.
    """
    # Trigger an on-the-fly evaluation to guarantee real-time freshness
    await evaluate_overdue_payments()

    db = get_db()
    query = {"status": "ACTIVE"}
    if bd_id:
        query["bd_id"] = bd_id

    reminders = []
    cursor = db.reminders.find(query).sort("triggered_at", -1)

    leads_map = {doc["_id"]: doc async for doc in db.leads.find({})}
    courses_map = {doc["_id"]: doc async for doc in db.courses.find({})}
    links_map = {doc["_id"]: doc async for doc in db.payment_links.find({})}

    now = datetime.now(timezone.utc)

    async for doc in cursor:
        link = links_map.get(doc.get("payment_link_id"), {})
        lead = leads_map.get(doc.get("lead_id"), {})
        course = courses_map.get(link.get("course_id") or lead.get("course_id"), {})

        triggered_at = doc.get("triggered_at")
        overdue_secs = 0
        if triggered_at:
            if triggered_at.tzinfo is None:
                triggered_at = triggered_at.replace(tzinfo=timezone.utc)
            overdue_secs = int((now - triggered_at).total_seconds())

        notes_list = [
            NoteEntry(
                timestamp=n.get("timestamp"),
                author_id=n.get("author_id", ""),
                author_name=n.get("author_name", "BD Executive"),
                comment=n.get("comment", "")
            ) for n in doc.get("notes", [])
        ]

        reminders.append(ReminderResponse(
            id=doc["_id"],
            payment_link_id=doc.get("payment_link_id", ""),
            lead_id=doc.get("lead_id", ""),
            bd_id=doc.get("bd_id", ""),
            status=doc.get("status", "ACTIVE"),
            triggered_at=triggered_at or now,
            follow_up_count=doc.get("follow_up_count", 0),
            notes=notes_list,
            resolved_at=doc.get("resolved_at"),
            lead_name=lead.get("name", "Unknown Lead"),
            lead_phone=lead.get("phone", "-"),
            course_title=course.get("title", "Course"),
            amount=link.get("amount", 0.0),
            created_at=link.get("created_at"),
            due_at=link.get("due_at"),
            overdue_duration_seconds=max(0, overdue_secs)
        ))

    return reminders

@router.post("/reminders/{reminder_id}/notes")
async def add_follow_up_note(reminder_id: str, note_data: NoteCreate):
    """BD logs a follow-up action/note on an overdue reminder."""
    db = get_db()
    now = datetime.now(timezone.utc)

    reminder = await db.reminders.find_one({"_id": reminder_id})
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")

    author = await db.users.find_one({"_id": note_data.author_id})
    author_name = author.get("name", "BD Executive") if author else "BD Executive"

    new_note = {
        "timestamp": now,
        "author_id": note_data.author_id,
        "author_name": author_name,
        "comment": note_data.comment
    }

    await db.reminders.update_one(
        {"_id": reminder_id},
        {
            "$push": {"notes": new_note},
            "$inc": {"follow_up_count": 1}
        }
    )

    return {"status": "success", "message": "Follow-up note logged successfully", "note": new_note}

@router.post("/reminders/evaluate-overdue")
async def trigger_manual_evaluation():
    """Manual trigger to evaluate overdue payments immediately (useful for testing/demo)."""
    count = await evaluate_overdue_payments()
    return {"status": "success", "newly_marked_overdue_count": count}

@router.post("/reminders/send-email")
async def send_reminder_email(req: EmailReminderRequest):
    """
    Sends an automated/manual payment reminder email to a student via Gmail SMTP.
    Also automatically logs a follow-up touchpoint in the reminders collection.
    """
    db = get_db()
    now = datetime.now(timezone.utc)

    # 1. Fetch Payment Link
    link = await db.payment_links.find_one({"_id": req.payment_link_id})
    if not link:
        raise HTTPException(status_code=404, detail="Payment link not found")

    # 2. Fetch Lead
    lead = await db.leads.find_one({"_id": link.get("lead_id")})
    if not lead:
        raise HTTPException(status_code=404, detail="Associated lead not found")

    # 3. Fetch Course
    course = await db.courses.find_one({"_id": link.get("course_id") or lead.get("course_id")})
    course_title = course.get("title", "Selected Course") if course else "Selected Course"

    # 4. Fetch BD
    bd = await db.users.find_one({"_id": link.get("bd_id")})
    bd_name = bd.get("name", "Admissions Team") if bd else "Admissions Team"

    # Target email
    recipient_email = req.to_email or lead.get("email")
    if not recipient_email or "@" not in recipient_email:
        raise HTTPException(status_code=400, detail="Valid recipient email address is required")

    lead_name = lead.get("name", "Candidate")
    amount = float(link.get("amount", 0.0))
    payment_url = link.get("payment_url") or f"http://localhost:3000/pay/{link['_id']}"
    reminder_type = req.reminder_type or ("OVERDUE" if link.get("status") == "OVERDUE" else "PROACTIVE")

    # 5. Dispatch Email via SMTP
    try:
        result = await send_payment_reminder_email(
            to_email=recipient_email,
            lead_name=lead_name,
            course_title=course_title,
            amount=amount,
            payment_url=payment_url,
            reminder_type=reminder_type,
            bda_name=bd_name
        )
    except Exception as e:
        logger.error(f"Email delivery error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

    # 6. Automatically log follow-up touchpoint note in MongoDB reminder if exists
    reminder = await db.reminders.find_one({"payment_link_id": req.payment_link_id, "status": "ACTIVE"})
    email_note = {
        "timestamp": now,
        "author_id": link.get("bd_id", "system"),
        "author_name": bd_name,
        "comment": f"Sent {reminder_type} reminder email to {recipient_email}."
    }

    if reminder:
        await db.reminders.update_one(
            {"_id": reminder["_id"]},
            {
                "$push": {"notes": email_note},
                "$inc": {"follow_up_count": 1}
            }
        )
    else:
        # If proactive pre-24h link, create or record the touchpoint
        pass

    return {
        "status": "success",
        "message": f"Reminder email successfully sent to {recipient_email}",
        "recipient": recipient_email,
        "reminder_type": reminder_type
    }
