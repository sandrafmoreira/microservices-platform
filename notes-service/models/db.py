from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from dotenv import load_dotenv
import os

# Model
from models.notes_model import Notes

load_dotenv()

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")
DB_HOST = os.getenv("DB_HOST")

MONGO_URL = f"mongodb+srv://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}?retryWrites=true&w=majority"


async def init_db():
    client = AsyncIOMotorClient(MONGO_URL)

    # Choose DB
    DB = client[DB_NAME]

    # start models
    await init_beanie(
        database=db,
        document_models=[ Notes ]
    )

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]