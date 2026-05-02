import aiosqlite
import json
import os
from pathlib import Path

class SQLiteCollection:
    def __init__(self, db_path, table_name):
        self.db_path = db_path
        self.table_name = table_name

    async def find_one(self, query, projection=None):
        k, v = list(query.items())[0]
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute(f"SELECT * FROM {self.table_name} WHERE {k} = ?", (v,))
            row = await cursor.fetchone()
            if not row:
                return None
            res = dict(row)
            # Handle JSON fields if any (in this app, 'questions' and 'chunks' are lists)
            for field in ['questions', 'chunks', 'document_ids']:
                if field in res and isinstance(res[field], str):
                    try:
                        res[field] = json.loads(res[field])
                    except:
                        pass
            return res

    async def insert_one(self, doc):
        # Convert lists/dicts to JSON strings for SQLite
        prepared_doc = {}
        for k, v in doc.items():
            if isinstance(v, (list, dict)):
                prepared_doc[k] = json.dumps(v)
            else:
                prepared_doc[k] = v
        
        keys = list(prepared_doc.keys())
        placeholders = ",".join(["?"] * len(keys))
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(f"INSERT INTO {self.table_name} ({','.join(keys)}) VALUES ({placeholders})", list(prepared_doc.values()))
            await db.commit()

    async def delete_one(self, query):
        k, v = list(query.items())[0]
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(f"DELETE FROM {self.table_name} WHERE {k} = ?", (v,))
            await db.commit()

    def find(self, query, projection=None):
        return SQLiteCursor(self.db_path, self.table_name, query)

class SQLiteCursor:
    def __init__(self, db_path, table_name, query):
        self.db_path = db_path
        self.table_name = table_name
        self.query = query
        self._sort = None

    def sort(self, field, direction):
        self._sort = (field, "DESC" if direction == -1 else "ASC")
        return self

    async def to_list(self, length):
        k, v = list(self.query.items())[0]
        sql = f"SELECT * FROM {self.table_name} WHERE {k} = ?"
        if self._sort:
            sql += f" ORDER BY {self._sort[0]} {self._sort[1]}"
        sql += f" LIMIT {length}"
        
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute(sql, (v,))
            rows = await cursor.fetchall()
            results = []
            for row in rows:
                res = dict(row)
                for field in ['questions', 'chunks', 'document_ids']:
                    if field in res and isinstance(res[field], str):
                        try:
                            res[field] = json.loads(res[field])
                        except:
                            pass
                results.append(res)
            return results

class SQLiteDB:
    def __init__(self, db_path):
        self.db_path = db_path
        self.users = SQLiteCollection(db_path, "users")
        self.documents = SQLiteCollection(db_path, "documents")
        self.chat_messages = SQLiteCollection(db_path, "chat_messages")
        self.quizzes = SQLiteCollection(db_path, "quizzes")

    async def init_db(self):
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    email TEXT UNIQUE,
                    name TEXT,
                    password_hash TEXT,
                    created_at TEXT
                )
            """)
            await db.execute("""
                CREATE TABLE IF NOT EXISTS documents (
                    id TEXT PRIMARY KEY,
                    user_id TEXT,
                    filename TEXT,
                    file_type TEXT,
                    size INTEGER,
                    chunks INTEGER,
                    path TEXT,
                    created_at TEXT
                )
            """)
            await db.execute("""
                CREATE TABLE IF NOT EXISTS chat_messages (
                    id TEXT PRIMARY KEY,
                    user_id TEXT,
                    session_id TEXT,
                    question TEXT,
                    answer TEXT,
                    chunks TEXT,
                    created_at TEXT
                )
            """)
            await db.execute("""
                CREATE TABLE IF NOT EXISTS quizzes (
                    id TEXT PRIMARY KEY,
                    user_id TEXT,
                    document_ids TEXT,
                    difficulty TEXT,
                    question_type TEXT,
                    questions TEXT,
                    created_at TEXT
                )
            """)
            await db.commit()
