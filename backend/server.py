from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
from db_sqlite import SQLiteDB
import os
import logging
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from models import (
    UserCreate, UserLogin, UserOut, TokenResponse,
    Document, QueryRequest, QueryResponse, RetrievedChunk,
    QuizRequest, QuizResponse, QuizQuestion,
    SummarizeRequest, SummarizeResponse, ChatRequest,
    GoogleLoginRequest
)
from auth import hash_password, verify_password, create_token, get_current_user
from rag_service import (
    extract_text, index_document, retrieve, delete_document, fetch_document_text,
    UPLOAD_DIR,
)
from llm_service import grounded_answer, summarize as llm_summarize, generate_quiz

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("academix")

db_path = "database.db"
db = SQLiteDB(db_path)

app = FastAPI(title="ACADEMIX AI")
api = APIRouter(prefix="/api")

@app.on_event("startup")
async def startup_db():
    await db.init_db()
    # Pre-load RAG models to avoid delay on first upload
    from rag_service import get_collection
    import threading
    
    def load_rag():
        logger.info("Pre-initializing ChromaDB...")
        get_collection()
        logger.info("ChromaDB initialized.")

    # Load in a separate thread to not block FastAPI startup
    threading.Thread(target=load_rag, daemon=True).start()

# ---------------- Health ----------------
@api.get("/")
async def root():
    return {"service": "ACADEMIX AI", "status": "online"}

# ---------------- Auth ----------------
@api.post("/auth/register", response_model=TokenResponse)
async def register(payload: UserCreate):
    existing = await db.users.find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = str(uuid.uuid4())
    doc = {
        "id": user_id,
        "email": payload.email.lower(),
        "name": payload.name,
        "password_hash": hash_password(payload.password),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(doc)
    token = create_token(user_id, payload.email.lower())
    return TokenResponse(
        access_token=token,
        user=UserOut(id=user_id, email=payload.email.lower(), name=payload.name),
    )

@api.post("/auth/login", response_model=TokenResponse)
async def login(payload: UserLogin):
    user = await db.users.find_one({"email": payload.email.lower()}, {"_id": 0})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token(user["id"], user["email"])
    return TokenResponse(
        access_token=token,
        user=UserOut(id=user["id"], email=user["email"], name=user["name"]),
    )

@api.post("/auth/google", response_model=TokenResponse)
async def google_login(payload: GoogleLoginRequest):
    try:
        # Verify the token
        idinfo = id_token.verify_oauth2_token(
            payload.credential,
            google_requests.Request(),
            os.environ.get("GOOGLE_CLIENT_ID")
        )

        email = idinfo["email"].lower()
        name = idinfo.get("name", email.split("@")[0])
        
        # Check if user exists
        user = await db.users.find_one({"email": email})
        if not user:
            # Create new user
            user_id = str(uuid.uuid4())
            user = {
                "id": user_id,
                "email": email,
                "name": name,
                "password_hash": "", # No password for Google users
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
            await db.users.insert_one(user)
        
        token = create_token(user["id"], user["email"])
        return TokenResponse(
            access_token=token,
            user=UserOut(id=user["id"], email=user["email"], name=name),
        )
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google token")
    except Exception as e:
        logger.error(f"Google login error: {e}")
        raise HTTPException(status_code=500, detail="Google authentication failed")

@api.get("/auth/me", response_model=UserOut)
async def me(current=Depends(get_current_user)):
    user = await db.users.find_one({"id": current["id"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserOut(id=user["id"], email=user["email"], name=user["name"])

# ---------------- Documents ----------------
ALLOWED_EXT = {"pdf", "docx", "txt", "md"}

@api.post("/documents/upload")
async def upload_document(file: UploadFile = File(...), current=Depends(get_current_user)):
    filename = file.filename or "untitled"
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in ALLOWED_EXT:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

    doc_id = str(uuid.uuid4())
    dest_dir = Path(UPLOAD_DIR) / current["id"]
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest_path = dest_dir / f"{doc_id}.{ext}"

    content = await file.read()
    dest_path.write_bytes(content)

    text = extract_text(str(dest_path), ext)
    chunk_count = index_document(current["id"], doc_id, filename, text)

    doc = {
        "id": doc_id,
        "user_id": current["id"],
        "filename": filename,
        "file_type": ext,
        "size": len(content),
        "chunks": chunk_count,
        "path": str(dest_path),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.documents.insert_one(doc)
    doc.pop("_id", None)
    doc.pop("path", None)
    return doc

@api.get("/documents")
async def list_documents(current=Depends(get_current_user)):
    docs = await db.documents.find(
        {"user_id": current["id"]},
        {"_id": 0, "path": 0},
    ).sort("created_at", -1).to_list(200)
    return docs

@api.delete("/documents/{doc_id}")
async def remove_document(doc_id: str, current=Depends(get_current_user)):
    d = await db.documents.find_one({"id": doc_id, "user_id": current["id"]})
    if not d:
        raise HTTPException(status_code=404, detail="Document not found")
    delete_document(doc_id)
    # remove file
    try:
        if d.get("path") and Path(d["path"]).exists():
            Path(d["path"]).unlink()
    except Exception:
        pass
    await db.documents.delete_one({"id": doc_id})
    return {"deleted": doc_id}

# ---------------- RAG ----------------
@api.post("/rag/query", response_model=QueryResponse)
async def rag_query(payload: QueryRequest, current=Depends(get_current_user)):
    chunks = retrieve(current["id"], payload.question, payload.document_ids, payload.top_k)
    result = await grounded_answer(payload.question, chunks)
    return QueryResponse(
        answer=result["answer"],
        grounded=result["grounded"],
        confidence=result["confidence"],
        session_id=result["session_id"],
        chunks=[
            RetrievedChunk(
                text=c["text"],
                document_id=c["document_id"],
                filename=c["filename"],
                chunk_index=c["chunk_index"],
                score=c["score"],
            ) for c in chunks
        ],
    )

@api.post("/rag/chat")
async def rag_chat(payload: ChatRequest, current=Depends(get_current_user)):
    session_id = payload.session_id or str(uuid.uuid4())
    chunks = retrieve(current["id"], payload.message, payload.document_ids, top_k=4)
    result = await grounded_answer(payload.message, chunks, session_id=session_id)
    # store history
    msg = {
        "id": str(uuid.uuid4()),
        "user_id": current["id"],
        "session_id": session_id,
        "question": payload.message,
        "answer": result["answer"],
        "chunks": chunks[:4],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.chat_messages.insert_one(msg)
    msg.pop("_id", None)
    return {
        "answer": result["answer"],
        "grounded": result["grounded"],
        "confidence": result["confidence"],
        "session_id": session_id,
        "chunks": chunks,
    }

@api.get("/rag/chat/{session_id}")
async def get_chat_history(session_id: str, current=Depends(get_current_user)):
    msgs = await db.chat_messages.find(
        {"session_id": session_id, "user_id": current["id"]},
        {"_id": 0},
    ).sort("created_at", 1).to_list(500)
    return msgs

@api.post("/rag/quiz", response_model=QuizResponse)
async def generate_quiz_endpoint(payload: QuizRequest, current=Depends(get_current_user)):
    # gather retrieval from multiple docs
    all_chunks = []
    for doc_id in payload.document_ids:
        c = retrieve(current["id"], "Core concepts, definitions, important facts", [doc_id], top_k=6)
        all_chunks.extend(c)
    if not all_chunks:
        raise HTTPException(status_code=400, detail="No content found in selected documents")
    questions = await generate_quiz(
        all_chunks,
        payload.difficulty,
        payload.question_type,
        payload.num_questions,
    )
    quiz_id = str(uuid.uuid4())
    await db.quizzes.insert_one({
        "id": quiz_id,
        "user_id": current["id"],
        "document_ids": payload.document_ids,
        "difficulty": payload.difficulty,
        "question_type": payload.question_type,
        "questions": questions,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return QuizResponse(id=quiz_id, questions=[QuizQuestion(**q) for q in questions])

@api.post("/rag/summarize", response_model=SummarizeResponse)
async def summarize_endpoint(payload: SummarizeRequest, current=Depends(get_current_user)):
    text = payload.text or ""
    if not text and payload.document_id:
        text = fetch_document_text(current["id"], payload.document_id)
    if not text.strip():
        raise HTTPException(status_code=400, detail="No text provided")
    result = await llm_summarize(text)
    return SummarizeResponse(
        summary=result.get("summary", ""),
        bullets=result.get("bullets", []),
        key_concepts=result.get("key_concepts", []),
    )

# Include router
app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
