from fastapi import FastAPI
from dotenv import load_dotenv
from loguru import logger
import os
import asyncio

# Load environment variables
load_dotenv()

# Create app with FastAPI (including Swagger)
app = FastAPI(title = "Notes Service", 
              version = "1.0.0", 
              description = "API to manage notes")


from models.db import init_db

@app.on_event("startup")
async def on_startup():
    logger.info("Initializing database...")
    await init_db()
    logger.info("Database initialized.")


# Import routes
from routes.notes_routes import router as notes_router
app.include_router(notes_router)

# Server configuration
PORT = int(os.getenv("PORT", 3005))
HOST = os.getenv("HOST", "127.0.0.1")

logger.info(f"Notes service loaded.")

# Execute server
if __name__ == "__main__":
    import uvicorn
    logger.info(f"Notes service running on http://{HOST}:{PORT}/")
    uvicorn.run("main:app", host = HOST, port = PORT, reload = True)
