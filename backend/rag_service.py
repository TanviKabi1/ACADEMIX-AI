"""RAG service: chunking, embedding with sentence-transformers, storage in ChromaDB."""
import os
import uuid
from pathlib import Path
from typing import List, Dict, Optional
import chromadb
from chromadb.config import Settings
from pypdf import PdfReader
import docx
from llm_service import embed_text, embed_query

if os.environ.get("VERCEL"):
    CHROMA_DIR = "/tmp/chroma_store"
    UPLOAD_DIR = "/tmp/uploads"
else:
    CHROMA_DIR = os.environ.get("CHROMA_DIR", "chroma_store")
    UPLOAD_DIR = os.environ.get("UPLOAD_DIR", "uploads")

try:
    Path(CHROMA_DIR).mkdir(parents=True, exist_ok=True)
    Path(UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
except Exception as e:
    print(f"Warning: Could not create directories: {e}")


# Lazy singletons
_chroma_client = None
_collection = None

def get_collection():
    global _chroma_client, _collection
    if _collection is None:
        if os.environ.get("VERCEL"):
            # Use EphemeralClient if persistent fails or to avoid disk issues
            _chroma_client = chromadb.EphemeralClient(
                settings=Settings(anonymized_telemetry=False)
            )
        else:
            _chroma_client = chromadb.PersistentClient(
                path=CHROMA_DIR,
                settings=Settings(anonymized_telemetry=False),
            )

        _collection = _chroma_client.get_or_create_collection(
            name="academix_gemini_chunks_v2",
            metadata={"hnsw:space": "cosine"},
        )
    return _collection

# ---------- Extraction ----------

def extract_text(file_path: str, file_type: str) -> str:
    ext = file_type.lower()
    if ext == "pdf":
        reader = PdfReader(file_path)
        return "\n\n".join((p.extract_text() or "") for p in reader.pages)
    if ext in ("docx",):
        d = docx.Document(file_path)
        return "\n".join(p.text for p in d.paragraphs)
    if ext in ("txt", "md"):
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
    # fallback: try utf-8 read
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
    except Exception:
        return ""

# ---------- Chunking ----------

def chunk_text(text: str, chunk_size: int = 800, overlap: int = 120) -> List[str]:
    text = " ".join(text.split())
    if not text:
        return []
    chunks: List[str] = []
    start = 0
    n = len(text)
    while start < n:
        end = min(start + chunk_size, n)
        chunks.append(text[start:end])
        if end >= n:
            break
        start = end - overlap
    return chunks

# ---------- Indexing ----------

def index_document(user_id: str, document_id: str, filename: str, text: str) -> int:
    chunks = chunk_text(text)
    if not chunks:
        return 0
    coll = get_collection()
    embeddings = embed_text(chunks)
    ids = [f"{document_id}:{i}" for i in range(len(chunks))]
    metadatas = [
        {"user_id": user_id, "document_id": document_id, "filename": filename, "chunk_index": i}
        for i in range(len(chunks))
    ]
    coll.add(ids=ids, embeddings=embeddings, documents=chunks, metadatas=metadatas)
    return len(chunks)

def delete_document(document_id: str) -> None:
    coll = get_collection()
    coll.delete(where={"document_id": document_id})

# ---------- Retrieval ----------

def retrieve(
    user_id: str,
    question: str,
    document_ids: Optional[List[str]] = None,
    top_k: int = 4,
) -> List[Dict]:
    coll = get_collection()
    if coll.count() == 0:
        return []
    q_emb = embed_query(question)

    where: Dict = {"user_id": user_id}
    if document_ids:
        if len(document_ids) == 1:
            where = {"$and": [{"user_id": user_id}, {"document_id": document_ids[0]}]}
        else:
            where = {
                "$and": [
                    {"user_id": user_id},
                    {"document_id": {"$in": document_ids}},
                ]
            }

    res = coll.query(query_embeddings=[q_emb], n_results=top_k, where=where)

    chunks: List[Dict] = []
    if not res or not res.get("ids") or not res["ids"][0]:
        return chunks

    for i, cid in enumerate(res["ids"][0]):
        md = res["metadatas"][0][i] or {}
        dist = res["distances"][0][i] if res.get("distances") else 1.0
        # cosine distance -> similarity score
        score = max(0.0, 1.0 - float(dist))
        chunks.append({
            "id": cid,
            "text": res["documents"][0][i],
            "document_id": md.get("document_id", ""),
            "filename": md.get("filename", ""),
            "chunk_index": md.get("chunk_index", 0),
            "score": score,
        })
    return chunks

def fetch_document_text(user_id: str, document_id: str, limit_chars: int = 16000) -> str:
    """Return concatenated chunks for a document (used for full-doc summary)."""
    coll = get_collection()
    res = coll.get(where={"$and": [{"user_id": user_id}, {"document_id": document_id}]})
    if not res or not res.get("documents"):
        return ""
    # sort by chunk_index
    pairs = list(zip(res["documents"], res["metadatas"]))
    pairs.sort(key=lambda p: (p[1] or {}).get("chunk_index", 0))
    text = "\n\n".join(p[0] for p in pairs)
    return text[:limit_chars]
