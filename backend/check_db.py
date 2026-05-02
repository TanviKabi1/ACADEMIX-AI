import asyncio
from db_sqlite import SQLiteDB

async def check_docs():
    db = SQLiteDB('database.db')
    # Use a real query that might match something or just fetch all
    async def get_all(collection):
        import aiosqlite
        async with aiosqlite.connect(collection.db_path) as conn:
            conn.row_factory = aiosqlite.Row
            cursor = await conn.execute(f"SELECT * FROM {collection.table_name}")
            return [dict(r) for r in await cursor.fetchall()]
    
    docs = await get_all(db.documents)
    print(f"Total documents in DB: {len(docs)}")
    for d in docs:
        print(f"ID: {d['id']}, Filename: {d['filename']}, Chunks: {d['chunks']}")

if __name__ == "__main__":
    asyncio.run(check_docs())
