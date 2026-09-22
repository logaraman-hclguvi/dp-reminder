import os
from datetime import datetime, timedelta, timezone
import uuid
import logging
from motor.motor_asyncio import AsyncIOMotorClient

from dotenv import load_dotenv
load_dotenv()

logger = logging.getLogger("uvicorn.error")

MONGO_DB_URL = os.getenv("MONGO_DB_URL") or os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "dp_reminder_db")

client: AsyncIOMotorClient = None

def get_db():
    global client
    if client is None:
        try:
            import certifi
            ca = certifi.where()
            client = AsyncIOMotorClient(
                MONGO_DB_URL,
                serverSelectionTimeoutMS=5000,
                tlsCAFile=ca,
                tlsAllowInvalidCertificates=True
            )
        except Exception:
            client = AsyncIOMotorClient(
                MONGO_DB_URL,
                serverSelectionTimeoutMS=5000,
                tlsAllowInvalidCertificates=True
            )
    return client[DB_NAME]

async def seed_initial_data_if_empty():
    """Seed the database with initial BDs, Courses, Leads, and sample Payment Links for testing."""
    db = get_db()
    try:
        # Check if users collection is empty
        user_count = await db.users.count_documents({})
        if user_count > 0:
            return

        logger.info("Database is empty. Seeding initial EdTech data...")
        now = datetime.now(timezone.utc)

        # 1. Seed BD Users
        users = [
            {"_id": "bd_01", "name": "Rahul Sharma", "email": "rahul.sharma@edtech.com", "role": "BD_EXECUTIVE", "is_active": True, "created_at": now},
            {"_id": "bd_02", "name": "Priya Patel", "email": "priya.patel@edtech.com", "role": "BD_EXECUTIVE", "is_active": True, "created_at": now},
            {"_id": "bd_03", "name": "Amit Kumar", "email": "amit.kumar@edtech.com", "role": "BD_EXECUTIVE", "is_active": True, "created_at": now}
        ]
        await db.users.insert_many(users)

        # 2. Seed Courses
        courses = [
            {"_id": "course_01", "title": "Full Stack Web Development Masterclass", "code": "FSWD-101", "total_fee": 45000.0, "default_token_amount": 2000.0, "created_at": now},
            {"_id": "course_02", "title": "Data Science & AI Bootcamp", "code": "DSAI-201", "total_fee": 60000.0, "default_token_amount": 3000.0, "created_at": now},
            {"_id": "course_03", "title": "UI/UX Product Design Pro", "code": "UIUX-301", "total_fee": 35000.0, "default_token_amount": 1500.0, "created_at": now}
        ]
        await db.courses.insert_many(courses)

        # 3. Seed Leads
        leads = [
            {"_id": "lead_101", "name": "Ananya Roy", "phone": "+91 98765 43210", "email": "ananya.roy@example.com", "course_id": "course_01", "assigned_bd_id": "bd_01", "status": "PAYMENT_LINK_SENT", "created_at": now - timedelta(days=2)},
            {"_id": "lead_102", "name": "Vikram Malhotra", "phone": "+91 91234 56789", "email": "vikram.m@example.com", "course_id": "course_02", "assigned_bd_id": "bd_01", "status": "PAYMENT_LINK_SENT", "created_at": now - timedelta(hours=5)},
            {"_id": "lead_103", "name": "Sneha Reddy", "phone": "+91 99887 76655", "email": "sneha.r@example.com", "course_id": "course_01", "assigned_bd_id": "bd_01", "status": "NEW", "created_at": now - timedelta(hours=1)},
            {"_id": "lead_104", "name": "Rohan Verma", "phone": "+91 97766 55443", "email": "rohan.v@example.com", "course_id": "course_03", "assigned_bd_id": "bd_02", "status": "PAYMENT_LINK_SENT", "created_at": now - timedelta(days=1)}
        ]
        await db.leads.insert_many(leads)

        # 4. Seed Payment Links (1 Overdue, 1 Pending within SLA)
        overdue_created = now - timedelta(hours=28)
        overdue_due = overdue_created + timedelta(hours=24) # Due 4 hours ago!

        pending_created = now - timedelta(hours=2)
        pending_due = pending_created + timedelta(hours=24) # Due in 22 hours

        payment_links = [
            {
                "_id": "pl_5001",
                "lead_id": "lead_101",
                "bd_id": "bd_01",
                "course_id": "course_01",
                "amount": 2000.0,
                "payment_type": "TOKEN",
                "status": "OVERDUE",
                "payment_url": "http://localhost:3000/pay/pl_5001",
                "created_at": overdue_created,
                "due_at": overdue_due,
                "paid_at": None,
                "gateway_transaction_id": None
            },
            {
                "_id": "pl_5002",
                "lead_id": "lead_102",
                "bd_id": "bd_01",
                "course_id": "course_02",
                "amount": 3000.0,
                "payment_type": "TOKEN",
                "status": "PENDING",
                "payment_url": "http://localhost:3000/pay/pl_5002",
                "created_at": pending_created,
                "due_at": pending_due,
                "paid_at": None,
                "gateway_transaction_id": None
            }
        ]
        await db.payment_links.insert_many(payment_links)

        # 5. Seed Reminder for the Overdue link
        reminders = [
            {
                "_id": "rem_9001",
                "payment_link_id": "pl_5001",
                "lead_id": "lead_101",
                "bd_id": "bd_01",
                "status": "ACTIVE",
                "triggered_at": overdue_due,
                "follow_up_count": 1,
                "notes": [
                    {
                        "timestamp": now - timedelta(hours=2),
                        "author_id": "bd_01",
                        "author_name": "Rahul Sharma",
                        "comment": "Called Ananya. She asked for evening 7 PM to complete UPI transfer."
                    }
                ],
                "resolved_at": None
            }
        ]
        await db.reminders.insert_many(reminders)

        # Create indexes
        await db.payment_links.create_index([("status", 1), ("due_at", 1)])
        await db.payment_links.create_index([("bd_id", 1), ("status", 1)])
        await db.reminders.create_index([("bd_id", 1), ("status", 1)])
        await db.reminders.create_index([("payment_link_id", 1)])

        logger.info("Data seeding completed successfully.")
    except Exception as e:
        logger.warning(f"Database seeding check note (MongoDB might be starting or offline): {e}")