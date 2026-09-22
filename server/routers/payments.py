from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import uuid
from database import get_db

router = APIRouter(prefix="", tags=["Payments & Mock Gateway"])

class WebhookPayload(BaseModel):
    payment_link_id: str
    status: str = "SUCCESS"  # SUCCESS, FAILED
    transaction_id: Optional[str] = None

@router.post("/payments/simulate-webhook")
async def simulate_payment_webhook(payload: WebhookPayload):
    """
    Simulates an incoming webhook callback from the payment gateway.
    When SUCCESS:
      1. Marks payment_link as PAID with timestamp and transaction ID.
      2. Marks any active reminder for this link as RESOLVED.
      3. Updates lead status to CONVERTED.
    """
    db = get_db()
    now = datetime.now(timezone.utc)
    txn_id = payload.transaction_id or f"txn_mock_{uuid.uuid4().hex[:8]}"

    link = await db.payment_links.find_one({"_id": payload.payment_link_id})
    if not link:
        raise HTTPException(status_code=404, detail="Payment link not found")

    if link.get("status") == "PAID":
        return {
            "status": "already_paid",
            "message": "Payment link has already been processed and marked as PAID",
            "payment_link_id": payload.payment_link_id
        }

    if payload.status == "SUCCESS":
        # 1. Update payment link to PAID
        await db.payment_links.update_one(
            {"_id": payload.payment_link_id},
            {
                "$set": {
                    "status": "PAID",
                    "paid_at": now,
                    "gateway_transaction_id": txn_id
                }
            }
        )

        # 2. Resolve active reminder
        await db.reminders.update_many(
            {"payment_link_id": payload.payment_link_id, "status": "ACTIVE"},
            {
                "$set": {
                    "status": "RESOLVED",
                    "resolved_at": now
                }
            }
        )

        # 3. Update lead status to CONVERTED
        lead_id = link.get("lead_id")
        if lead_id:
            await db.leads.update_one(
                {"_id": lead_id},
                {"$set": {"status": "CONVERTED"}}
            )

        return {
            "status": "success",
            "message": f"Payment successfully simulated for link {payload.payment_link_id}",
            "payment_link_id": payload.payment_link_id,
            "transaction_id": txn_id,
            "paid_at": now.isoformat()
        }
    else:
        # Payment failed attempt
        return {
            "status": "failed",
            "message": "Payment attempt failed on gateway",
            "payment_link_id": payload.payment_link_id
        }
