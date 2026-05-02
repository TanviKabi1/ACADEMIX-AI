import React from "react";
import { Link } from "react-router-dom";
import {
  Zap, Brain, MessageSquareText, BookOpenCheck, ListChecks, FileText, Columns,
  ArrowRight, Upload, Cpu, Database, Search, Sparkles, ShieldCheck,
} from "lucide-react";
import ParticleBackground from "../components/ParticleBackground";

const HERO_IMG = "https://static.prod-images.emergentagent.com/jobs/d9d3fb33-630f-4f8a-bc35-4c7b5135dac7/images/472b485696cb023ed1e8ed4065e0695cbe3dc470c950522b0f29fb7e544094cb.png";
const WORKFLOW_IMG = "https://static.prod-images.emergentagent.com/jobs/d9d3fb33-630f-4f8a-bc35-4c7b5135dac7/images/d7931d0d3f8d66194312b2b814b0492f2988fc4986e01738807ea7d660e2d328.png";

const FEATURES = [
  { icon: MessageSquareText, title: "Academic Notes Q&A", desc: "Ask questions directly from uploaded PDFs and notes using AI retrieval.", color: "#00F0FF" },
  { icon: BookOpenCheck, title: "Study Assistant", desc: "Generate grounded explanations only from your uploaded learning materials.", color: "#B026FF" },
  { icon: Brain, title: "Knowledge-Based Chatbot", desc: "A chatbot restricted to your uploaded academic database.", color: "#00F0FF" },
  { icon: ListChecks, title: "AI Quiz Generator", desc: "Generate quizzes directly from uploaded study material.", color: "#B026FF" },
  { icon: FileText, title: "Smart Summarizer", desc: "Convert selected academic content into concise summaries.", color: "#00F0FF" },
  { icon: Columns, title: "Split-Screen Study Mode", desc: "Study documents while interacting with an AI learning assistant.", color: "#B026FF" },
];

const STEPS = [
  { icon: Upload, title: "Upload Academic Documents", desc: "PDFs, DOCX, notes & presentations." },
  { icon: Cpu, title: "Chunk and Embed Text", desc: "Local HuggingFace embeddings." },
  { icon: Database, title: "Store in Vector DB", desc: "ChromaDB with cosine similarity." },
  { icon: Search, title: "Retrieve Relevant Context", desc: "Top-K grounded chunks." },
  { icon: Sparkles, title: "Generate Grounded Answer", desc: "Gemini 3 Flash with citations." },
];

export default function Landing() {
  return (
    <div className="min-h-screen relative" data-testid="landing-page">
      <ParticleBackground />

      {/* NAV */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl" style={{ background: "rgba(5,5,10,0.6)", borderBottom: "1px solid rgba(0,240,255,0.1)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3" data-testid="nav-logo">
            <div className="w-8 h-8 rounded-md flex items-center justify-center pulse-glow"
                 style={{ background: "linear-gradient(135deg,#00F0FF,#B026FF)" }}>
              <Zap size={16} color="#05050A" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-display font-bold text-sm tracking-widest text-white">ACADEMIX</div>
              <div className="font-mono text-[9px] text-cyan-400/80 tracking-[0.3em]">AI · RAG</div>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="nav-link text-sm font-mono tracking-wider">Features</a>
            <a href="#retrieval" className="nav-link text-sm font-mono tracking-wider">AI Retrieval</a>
            <a href="#tools" className="nav-link text-sm font-mono tracking-wider">Study Tools</a>
            <a href="#how" className="nav-link text-sm font-mono tracking-wider">How It Works</a>
            <Link to="/login" data-testid="nav-login" className="btn-neon btn-neon-solid">Login</Link>
          </div>
          <Link to="/login" className="md:hidden btn-neon btn-neon-solid text-xs">Login</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-16 pb-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono tracking-widest mb-6"
                 style={{ borderColor: "rgba(0,240,255,0.3)", color: "#00F0FF", background: "rgba(0,240,255,0.05)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 pulse-glow" />
              RETRIEVAL · AUGMENTED · GENERATION
            </div>
            <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-tight mb-6">
              Ask Questions <br />
              Directly From Your <br />
              <span className="text-gradient">Academic Notes</span>
            </h1>
            <p className="text-slate-400 text-base sm:text-lg leading-relaxed mb-10 max-w-xl">
              An AI-powered Retrieval Augmented Generation platform that answers only from your uploaded study materials, PDFs, lecture notes, and academic resources.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/login" data-testid="cta-start" className="btn-neon btn-neon-solid">
                Start Learning <ArrowRight size={16} />
              </Link>
              <a href="#features" data-testid="cta-explore" className="btn-neon">
                Explore Features
              </a>
            </div>

            <div className="mt-10 flex items-center gap-6 font-mono text-xs text-slate-500">
              <div className="flex items-center gap-2"><ShieldCheck size={14} color="#00F0FF" /> Grounded Answers</div>
              <div className="flex items-center gap-2"><Database size={14} color="#B026FF" /> Vector DB</div>
              <div className="flex items-center gap-2"><Sparkles size={14} color="#00F0FF" /> Gemini Flash</div>
            </div>
          </div>

          <div className="relative float-y">
            <div className="glass cut-corner overflow-hidden relative scan-line" style={{ aspectRatio: "1/0.92" }}>
              <img src={HERO_IMG} alt="RAG visualization" className="w-full h-full object-cover opacity-90" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(5,5,10,0.4), transparent 50%)" }} />
              <div className="absolute top-4 left-4 font-mono text-[10px] tracking-widest text-cyan-300">
                ◉ LIVE · RAG_PIPELINE
              </div>
              <div className="absolute bottom-4 right-4 font-mono text-[10px] text-purple-300">
                vector_search_active
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative max-w-7xl mx-auto px-6 lg:px-10 py-20">
        <div className="mb-14">
          <div className="font-mono text-xs tracking-[0.3em] text-purple-400 mb-3">// CAPABILITIES</div>
          <h2 className="font-display font-bold text-4xl sm:text-5xl tracking-tight">
            Built for <span className="text-gradient">intelligent learning</span>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="features-grid">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="glass cut-corner p-6 group relative overflow-hidden" data-testid={`feature-${i}`}>
                <div className="w-11 h-11 rounded-lg border flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                     style={{ borderColor: f.color, background: "rgba(5,5,10,0.6)", boxShadow: `0 0 16px ${f.color}33` }}>
                  <Icon size={18} color={f.color} />
                </div>
                <h3 className="font-display font-bold text-lg mb-2 text-white">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                <div className="absolute top-2 right-3 font-mono text-[9px] text-slate-600">0{i + 1}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW RAG WORKS */}
      <section id="how" className="relative max-w-7xl mx-auto px-6 lg:px-10 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="font-mono text-xs tracking-[0.3em] text-cyan-400 mb-3">// HOW RAG WORKS</div>
            <h2 className="font-display font-bold text-4xl sm:text-5xl tracking-tight mb-4">
              Retrieval <span className="text-gradient">powered answers</span>
            </h2>
            <p className="text-slate-400 mb-10">
              Every response is grounded in your uploaded documents. No hallucinations. Citations included.
            </p>
            <div className="space-y-3">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="glass p-4 flex items-center gap-4" data-testid={`step-${i}`}>
                    <div className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
                         style={{ background: i % 2 === 0 ? "rgba(0,240,255,0.1)" : "rgba(176,38,255,0.1)",
                                  border: `1px solid ${i % 2 === 0 ? "rgba(0,240,255,0.4)" : "rgba(176,38,255,0.4)"}` }}>
                      <Icon size={16} color={i % 2 === 0 ? "#00F0FF" : "#B026FF"} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-display font-semibold text-white text-sm">
                        <span className="font-mono text-[10px] text-slate-500 mr-2">0{i + 1}</span>
                        {s.title}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{s.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass cut-corner p-4 relative scan-line">
            <img src={WORKFLOW_IMG} alt="RAG workflow" className="w-full h-auto rounded-md opacity-95" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative max-w-5xl mx-auto px-6 lg:px-10 py-20">
        <div className="glass-purple cut-corner p-10 md:p-14 text-center relative overflow-hidden">
          <div className="font-mono text-xs tracking-[0.3em] text-purple-400 mb-3">// GET STARTED</div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-tight mb-4">
            Your knowledge. <span className="text-gradient">Retrieved intelligently.</span>
          </h2>
          <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
            Upload your academic notes and start asking questions with answers grounded only in your materials.
          </p>
          <Link to="/login" className="btn-neon btn-neon-solid" data-testid="cta-footer">
            Launch AI Workspace <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="max-w-7xl mx-auto px-6 lg:px-10 py-10 border-t font-mono text-xs text-slate-500 flex items-center justify-between"
              style={{ borderColor: "rgba(0,240,255,0.1)" }}>
        <div>© 2026 ACADEMIX AI · Retrieval Powered Academic Intelligence</div>
        <div className="text-cyan-400/70">v1.0.0-rag</div>
      </footer>
    </div>
  );
}
