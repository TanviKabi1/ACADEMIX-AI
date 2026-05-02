from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime, timezone
import uuid

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleLoginRequest(BaseModel):
    credential: str

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class UserOut(BaseModel):
    id: str
    email: str
    name: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class Document(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    filename: str
    file_type: str
    size: int
    chunks: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class QueryRequest(BaseModel):
    question: str
    document_ids: Optional[List[str]] = None
    top_k: int = 4

class RetrievedChunk(BaseModel):
    text: str
    document_id: str
    filename: str
    chunk_index: int
    score: float

class QueryResponse(BaseModel):
    answer: str
    grounded: bool
    confidence: float
    chunks: List[RetrievedChunk]
    session_id: str

class QuizRequest(BaseModel):
    document_ids: List[str]
    difficulty: str = "medium"  # easy | medium | hard
    question_type: str = "mcq"  # mcq | true_false | short
    num_questions: int = 5

class QuizQuestion(BaseModel):
    question: str
    options: List[str] = []
    correct_answer: str
    explanation: str
    source_chunk: str = ""

class QuizResponse(BaseModel):
    id: str
    questions: List[QuizQuestion]

class SummarizeRequest(BaseModel):
    text: Optional[str] = None
    document_id: Optional[str] = None

class SummarizeResponse(BaseModel):
    summary: str
    bullets: List[str]
    key_concepts: List[str]

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    document_ids: Optional[List[str]] = None
