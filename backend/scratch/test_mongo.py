import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

# Fix path to .env (one level up from scratch/)
load_dotenv(Path(__file__).parent.parent / ".env")
MONGO_URL = os.environ.get("MONGO_URL")

async def test_mongo():
    if not MONGO_URL:
        print("MONGO_URL not found in .env")
        return
    print(f"Connecting to: {MONGO_URL[:20]}...")
    client = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=5000)
    try:
        await client.admin.command('ping')
        print("MongoDB Ping successful!")
    except Exception as e:
        print(f"MongoDB connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_mongo())
