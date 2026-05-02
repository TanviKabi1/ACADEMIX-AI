"""Gemini Flash integration via google-generativeai."""
import os
import json
import re
import uuid
from typing import List, Dict, Optional
import google.generativeai as genai

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# Use standard flash model
MODEL_NAME = "gemini-3-flash-preview"

def _format_context(chunks: List[Dict]) -> str:
    if not chunks:
        return "(no retrieved context)"
    parts = []
    for i, c in enumerate(chunks, 1):
        parts.append(
            f"[Source {i} | {c.get('filename','doc')} | chunk {c.get('chunk_index',0)} | score {c.get('score',0):.2f}]\n{c.get('text','')}"
        )
    return "\n\n".join(parts)

GROUNDED_SYS = (
    "You are ACADEMIX AI, an academic retrieval-grounded assistant. "
    "You ONLY answer using the provided Retrieved Context. "
    "If the answer is not present in the context, respond exactly: "
    "'I could not find this information in your uploaded documents.' "
    "Never use outside knowledge. Cite sources inline as [Source 1], [Source 2], etc. "
    "Be concise, precise and academic."
)

async def grounded_answer(question: str, chunks: List[Dict], session_id: Optional[str] = None) -> Dict:
    if not chunks:
        return {
            "answer": "I could not find this information in your uploaded documents.",
            "grounded": False,
            "confidence": 0.0,
            "session_id": session_id or str(uuid.uuid4()),
        }
    sid = session_id or str(uuid.uuid4())
    context = _format_context(chunks)
    prompt = f"System: {GROUNDED_SYS}\n\nRetrieved Context:\n{context}\n\nStudent Question: {question}\n\nGrounded Answer:"
    
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        response = model.generate_content(prompt)
        text = response.text
    except Exception as e:
        text = f"Error generating answer: {str(e)}"
        
    avg_score = sum(c.get("score", 0) for c in chunks) / len(chunks)
    return {
        "answer": text.strip(),
        "grounded": True,
        "confidence": round(avg_score, 3),
        "session_id": sid,
    }

SUMMARY_SYS = (
    "You are ACADEMIX AI summarizer. Summarize ONLY the provided text. "
    "Respond as strict JSON with keys: summary (string, 3-5 sentences), "
    "bullets (array of 5-7 concise bullets), key_concepts (array of 3-8 short labels). "
    "Do not add facts outside the text."
)

async def summarize(text: str) -> Dict:
    if not text.strip():
        return {"summary": "No content provided.", "bullets": [], "key_concepts": []}
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        prompt = f"System: {SUMMARY_SYS}\n\nText to summarize:\n\n{text[:12000]}"
        response = model.generate_content(prompt)
        resp_text = response.text
    except Exception as e:
        return {"summary": f"Error: {str(e)}", "bullets": [], "key_concepts": []}
        
    return _parse_json(resp_text, default={"summary": resp_text.strip(), "bullets": [], "key_concepts": []})

QUIZ_SYS = (
    "You are ACADEMIX AI quiz generator. Create quiz questions ONLY from the provided academic context. "
    "Respond as strict JSON with key 'questions' (array). Each question object must have: "
    "question (string), options (array of 4 strings for mcq; empty array for short; ['True','False'] for true_false), "
    "correct_answer (string - for mcq: exact matching option; for true_false: 'True' or 'False'; for short: model answer), "
    "explanation (string, cite context), source_chunk (short quote from context). "
    "If context is insufficient, return an empty 'questions' array."
)

async def generate_quiz(chunks: List[Dict], difficulty: str, question_type: str, num: int) -> List[Dict]:
    if not chunks:
        return []
    context = _format_context(chunks)
    prompt = (
        f"System: {QUIZ_SYS}\n\n"
        f"Generate {num} {difficulty} {question_type} questions from this academic context.\n\n"
        f"Context:\n{context}\n\nReturn strict JSON."
    )
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        response = model.generate_content(prompt)
        resp_text = response.text
    except Exception as e:
        print(f"Error generating quiz: {e}")
        resp_text = ""
        
    data = _parse_json(resp_text, default={"questions": []})
    qs = data.get("questions", [])
    # sanitize
    out = []
    for q in qs[:num]:
        out.append({
            "question": str(q.get("question", "")).strip(),
            "options": [str(o) for o in (q.get("options") or [])],
            "correct_answer": str(q.get("correct_answer", "")).strip(),
            "explanation": str(q.get("explanation", "")).strip(),
            "source_chunk": str(q.get("source_chunk", "")).strip(),
        })
    return out

def _parse_json(text: str, default):
    """Extract JSON from model output that may contain code fences."""
    if not text:
        return default
    # strip code fences
    m = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    candidate = m.group(1) if m else text
    # find first {...} block
    m2 = re.search(r"\{[\s\S]*\}", candidate)
    if m2:
        candidate = m2.group(0)
    try:
        return json.loads(candidate)
    except Exception:
        return default

def embed_text(texts: List[str]) -> List[List[float]]:
    """Generate embeddings using Google Gemini API."""
    if not texts:
        return []
    try:
        # Task type 'retrieval_document' for indexing, 'retrieval_query' for search
        result = genai.embed_content(
            model="models/gemini-embedding-001",
            content=texts,
            task_type="retrieval_document"
        )
        return result['embedding']
    except Exception as e:
        print(f"Error generating embeddings via Gemini: {e}")
        return [[0.0] * 3072 for _ in texts]

def embed_query(text: str) -> List[float]:
    """Generate query embedding using Google Gemini API."""
    if not text:
        return [0.0] * 768
    try:
        result = genai.embed_content(
            model="models/gemini-embedding-001",
            content=text,
            task_type="retrieval_query"
        )
        return result['embedding']
    except Exception as e:
        print(f"Error generating query embedding via Gemini: {e}")
        return [0.0] * 3072
