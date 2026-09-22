import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from database import seed_initial_data_if_empty
from services.overdue_service import overdue_checker_loop
from routers import users, courses, leads, payment_links, reminders, payments

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("server")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Startup: Seed DB if empty
    logger.info("Initializing DP Reminder Backend...")
    await seed_initial_data_if_empty()
    
    # 2. Start background overdue checker task (every 60 seconds)
    worker_task = asyncio.create_task(overdue_checker_loop(interval_seconds=60))
    logger.info("Background overdue evaluator task launched.")
    
    yield
    
    # 3. Shutdown: Cancel worker
    worker_task.cancel()
    try:
        await worker_task
    except asyncio.CancelledError:
        pass
    logger.info("DP Reminder Backend shutdown cleanly.")

app = FastAPI(
    title="DP Paid Not Converted — Payment Link Reminder System",
    description="Operational API for managing EdTech payment links, overdue follow-up reminders, and conversions.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all modular routers under /api/v1 and directly at root for convenience
app.include_router(users.router, prefix="/api/v1")
app.include_router(courses.router, prefix="/api/v1")
app.include_router(leads.router, prefix="/api/v1")
app.include_router(payment_links.router, prefix="/api/v1")
app.include_router(reminders.router, prefix="/api/v1")
app.include_router(payments.router, prefix="/api/v1")

# Also mount at root as fallback aliases
app.include_router(users.router, include_in_schema=False)
app.include_router(courses.router, include_in_schema=False)
app.include_router(leads.router, include_in_schema=False)
app.include_router(payment_links.router, include_in_schema=False)
app.include_router(reminders.router, include_in_schema=False)
app.include_router(payments.router, include_in_schema=False)

@app.api_route("/", methods=["GET", "HEAD"])
async def root():
    return {
        "service": "DP Paid Not Converted — Payment Link Reminder System",
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs",
        "api_prefix": "/api/v1"
    }

@app.api_route("/health", methods=["GET", "HEAD"])
@app.api_route("/api/v1/health", methods=["GET", "HEAD"])
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)