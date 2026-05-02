import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

import Loading from "./pages/Loading";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardHome from "./pages/Dashboard";
import UploadPage from "./pages/UploadPage";
import NotesQA from "./pages/NotesQA";
import QuizGenerator from "./pages/QuizGenerator";
import Summarizer from "./pages/Summarizer";
import SplitStudy from "./pages/SplitStudy";
import Settings from "./pages/Settings";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: "rgba(9,12,21,0.9)",
              border: "1px solid rgba(0,240,255,0.25)",
              color: "#F8FAFC",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "12px",
            },
          }}
        />
        <Routes>
          <Route path="/" element={<Loading />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/login" element={<Login mode="login" />} />
          <Route path="/register" element={<Login mode="register" />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="upload" element={<UploadPage />} />
            <Route path="notes-qa" element={<NotesQA />} />
            <Route path="study" element={<SplitStudy />} />
            <Route path="quiz" element={<QuizGenerator />} />
            <Route path="summarize" element={<Summarizer />} />
            <Route path="split" element={<SplitStudy />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
