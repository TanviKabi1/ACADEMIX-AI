# 🎓 ACADEMIX AI — Your Intelligent Academic Companion

![ACADEMIX AI Banner](https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?q=80&w=1200&auto=format&fit=crop)

**ACADEMIX AI** is a state-of-the-art academic intelligence platform designed to transform how students interact with their study materials. By leveraging **Retrieval-Augmented Generation (RAG)** and **Gemini 3 Flash**, it turns static notes into interactive knowledge bases.

---

## ✨ Key Features

- 🧠 **Context-Aware Q&A**: Ask questions directly to your uploaded PDFs, DOCX, and TXT files.
- 📝 **Smart Summarization**: Get instant, high-fidelity summaries and key concept extractions.
- 📝 **AI Quiz Generator**: Automatically generate MCQs, True/False, and Short Answer questions from your notes.
- 📂 **Multi-Doc Indexing**: Search and synthesize information across multiple documents simultaneously.
- ⚡ **Cyber-Aesthetic UI**: A premium, high-performance interface built for deep focus and productivity.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, Lucide React
- **Backend**: FastAPI (Python), ChromaDB (Vector Store), SQLite (Metadata)
- **AI Engine**: Google Gemini 3 Flash & Gemini Embedding-001

---

## 🚀 Local Setup Instructions

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **Google Gemini API Key** ([Get one here](https://aistudio.google.com/app/apikey))

### 2. Clone the Repository
```bash
git clone https://github.com/TanviKabi1/ACADEMIX-AI.git
cd ACADEMIX-AI
```

### 3. Backend Configuration
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_random_secret_string
CORS_ORIGINS=http://localhost:3000
```

### 4. Frontend Configuration
```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:8000/api
```

---

## 🏃 Running the Project

### Start the Backend
```bash
# From the backend directory
.\venv\Scripts\python server.py
```
The API will be live at `http://localhost:8000`.

### Start the Frontend
```bash
# From the frontend directory
npm run dev
```
The application will be live at `http://localhost:3000`.

---

## 🛡️ License
Distributed under the MIT License. See `LICENSE` for more information.

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/TanviKabi1">Tanvi Kabi</a>
</p>
