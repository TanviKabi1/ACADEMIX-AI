import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# Use MongoDB if MONGO_URL is set, otherwise fallback to SQLite
MONGO_URL = os.environ.get("MONGO_URL")

if MONGO_URL and "mongodb" in MONGO_URL:
    print("Using MongoDB database...")
    from db_mongo import db
else:
    print("Using SQLite database...")
    from db_sqlite import SQLiteDB
    db = SQLiteDB(os.path.join(ROOT_DIR, "database.db"))
