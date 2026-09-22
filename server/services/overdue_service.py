import asyncio
import logging
from datetime import datetime, timezone
import uuid
from database import get_db

logger = logging.getLogger("uvicorn.error")

async def evaluate_overdue_payments():
    """
    Core Background Logic:
    1. Finds all PENDING payment links whose due_at timestamp <= now().
    2. Updates status to OVERDUE.
    3. Generates ACTIVE ReminderAlert records for the responsible BDs.
    """
    db = get_db()
    now = datetime.now(timezone.utc)
    
    try:
        # Find pending links where due_at has passed
        cursor = db.payment_links.find({
            "status": "PENDING",
            "due_at": {"$lte": now}
        })
        overdue_links = await cursor.to_list(length=500)

        updated_count = 0
        for link in overdue_links:
            link_id = link["_id"]
            bd_id = link.get("bd_id")
            lead_id = link.get("lead_id")

            # 1. Update link status to OVERDUE
            await db.payment_links.update_one(
                {"_id": link_id},
                {"$set": {"status": "OVERDUE"}}
            )

            # 2. Check if a reminder already exists for this payment link
            existing_reminder = await db.reminders.find_one({"payment_link_id": link_id})
            if not existing_reminder:
                reminder_doc = {
                    "_id": f"rem_{uuid.uuid4().hex[:8]}",
                    "payment_link_id": link_id,
                    "lead_id": lead_id,
                    "bd_id": bd_id,
                    "status": "ACTIVE",
                    "triggered_at": now,
                    "follow_up_count": 0,
                    "notes": [],
                    "resolved_at": None
                }
                await db.reminders.insert_one(reminder_doc)
                logger.info(f"Created OVERDUE reminder {reminder_doc['_id']} for Payment Link {link_id}")

            updated_count += 1

        if updated_count > 0:
            logger.info(f"Overdue Evaluator: Processed {updated_count} newly overdue payment link(s).")
        return updated_count
    except Exception as e:
        logger.error(f"Error evaluating overdue payments: {e}")
        return 0

async def overdue_checker_loop(interval_seconds: int = 60):
    """Periodic background task that runs every `interval_seconds`."""
    logger.info(f"Starting background overdue evaluator loop (interval: {interval_seconds}s)")
    while True:
        try:
            await evaluate_overdue_payments()
        except asyncio.CancelledError:
            logger.info("Overdue evaluator loop cancelled.")
            break
        except Exception as e:
            logger.error(f"Unexpected error in background loop: {e}")
        await asyncio.sleep(interval_seconds)
