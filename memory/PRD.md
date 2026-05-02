# ACADEMIX AI — PRD

## Problem Statement
Build ACADEMIX AI — a futuristic, cyberpunk-styled academic platform powered by Retrieval Augmented Generation that lets students upload notes/PDFs, ask grounded questions, generate quizzes, summarize content, and study in split-screen with an AI assistant. Answers must come ONLY from uploaded documents.

## Stack
- **Frontend**: React 19, Tailwind, shadcn/ui, Framer Motion, lucide-react, sonner (toast)
- **Backend**: FastAPI + Motor (MongoDB), JWT auth (bcrypt)
- **RAG**: sentence-transformers (all-MiniLM-L6-v2) + ChromaDB (persistent)
- **LLM**: Gemini 1.5 Flash via `google-generativeai` using user's own Gemini API key
- **File parsing**: pypdf, python-docx

## Personas
- Student (primary): uploads notes, asks grounded questions, generates quizzes, summaries.

## Implemented (Feb 2026)
- Cinematic loading screen with cycling phases + progress bar
- Landing page: navbar, hero, 6 feature cards, RAG workflow, CTA
- Auth: JWT-based register/login, Remember Me, Google placeholder
- Dashboard home: stats, RAG pipeline visualization, quick actions, doc list
- Upload: drag-drop + multi-file, delete
- Notes Q&A: doc scope selector, animated pipeline, grounded answer + chunks + confidence
- Quiz Generator: MCQ / True-False / Short; difficulty; score; explanations + source chunk
- Summarizer: text OR document mode; bullets, key concepts, copy
- Split-Screen Study: doc viewer + chat with context sync indicator + quick tools
- Settings page

## Backend Endpoints (all /api prefix)
- `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- `POST /documents/upload`, `GET /documents`, `DELETE /documents/{id}`
- `POST /rag/query`, `POST /rag/chat`, `GET /rag/chat/{session_id}`
- `POST /rag/quiz`, `POST /rag/summarize`

## P1 Backlog
- Google OAuth actual integration
- Real PDF viewer in Split Study Mode (iframe / react-pdf)
- Chat history list / sessions sidebar
- Flashcard generator page
- Multi-file quiz from mixed sources
- Token-based auto-refresh / Remember Me backend flag

## P2 Backlog
- Rich-text highlight-to-summarize in PDF viewer
- Shareable study rooms
- Subscription / premium tier (Stripe)

## Next Tasks
- Run testing_agent_v3 after first finish
- Iterate based on user feedback
