import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

# Load env in case it's not loaded by server.py
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "academix_ai")

class MongoDB:
    def __init__(self):
        self.client = AsyncIOMotorClient(MONGO_URL)
        self.db = self.client[DB_NAME]
        
        # Collections
        self.users = self.db["users"]
        self.documents = self.db["documents"]
        self.chat_messages = self.db["chat_messages"]
        self.quizzes = self.db["quizzes"]

    async def init_db(self):
        # Indexes for performance and uniqueness
        await self.users.create_index("email", unique=True)
        await self.users.create_index("id", unique=True)
        await self.documents.create_index("id", unique=True)
        await self.documents.create_index("user_id")
        await self.chat_messages.create_index([("session_id", 1), ("user_id", 1)])
        await self.quizzes.create_index("id", unique=True)

db = MongoDB()
