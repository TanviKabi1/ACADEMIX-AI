import axios from "axios";

const BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
export const API = `${BASE}/api`;

export const http = axios.create({ baseURL: API });

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("academix_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("academix_token");
      localStorage.removeItem("academix_user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export const auth = {
  login: (email, password) => http.post("/auth/login", { email, password }),
  register: (email, password, name) =>
    http.post("/auth/register", { email, password, name }),
  me: () => http.get("/auth/me"),
};

export const documents = {
  list: () => http.get("/documents"),
  upload: (file) => {
    const fd = new FormData();
    fd.append("file", file);
    return http.post("/documents/upload", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  remove: (id) => http.delete(`/documents/${id}`),
};

export const rag = {
  query: (question, document_ids = null, top_k = 4) =>
    http.post("/rag/query", { question, document_ids, top_k }),
  chat: (message, session_id = null, document_ids = null) =>
    http.post("/rag/chat", { message, session_id, document_ids }),
  history: (session_id) => http.get(`/rag/chat/${session_id}`),
  quiz: (document_ids, difficulty, question_type, num_questions) =>
    http.post("/rag/quiz", {
      document_ids,
      difficulty,
      question_type,
      num_questions,
    }),
  summarize: (text, document_id) =>
    http.post("/rag/summarize", { text, document_id }),
};

export function saveSession(token, user) {
  localStorage.setItem("academix_token", token);
  localStorage.setItem("academix_user", JSON.stringify(user));
}
export function getUser() {
  try {
    return JSON.parse(localStorage.getItem("academix_user") || "null");
  } catch {
    return null;
  }
}
export function clearSession() {
  localStorage.removeItem("academix_token");
  localStorage.removeItem("academix_user");
}
export function isAuthed() {
  return !!localStorage.getItem("academix_token");
}
