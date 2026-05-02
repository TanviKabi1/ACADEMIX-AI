import React, { useEffect, useRef, useState } from "react";
import { Send, Loader2, FileText, Sparkles, Zap, Activity, BookMarked, CircleDot } from "lucide-react";
import { documents, rag } from "../lib/api";
import { toast } from "sonner";

const QUICK_TOOLS = [
  { k: "flashcards", label: "Flashcards", prompt: "Create 5 flashcards (question + answer) from this document." },
  { k: "formulas", label: "Extract Formulas", prompt: "Extract all formulas, equations, and important definitions from this document." },
  { k: "revision", label: "Revision Notes", prompt: "Create concise revision notes with all the key takeaways from this document." },
  { k: "viva", label: "Viva Questions", prompt: "Generate 5 viva / oral-exam style questions from this document." },
  { k: "cheat", label: "Cheat Sheet", prompt: "Create a compact cheat-sheet summary of this document." },
];

export default function SplitStudy() {
  const [docs, setDocs] = useState([]);
  const [doc, setDoc] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [synced, setSynced] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => { documents.list().then((r) => setDocs(r.data)); }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs]);

  useEffect(() => {
    if (doc) {
      setSynced(false);
      const t = setTimeout(() => setSynced(true), 700);
      return () => clearTimeout(t);
    }
  }, [doc]);

  const send = async (text) => {
    const q = (text ?? input).trim();
    if (!q) return;
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setLoading(true);
    try {
      const resp = await rag.chat(q, sessionId, doc ? [doc.id] : null);
      setSessionId(resp.data.session_id);
      setMsgs((m) => [...m, {
        role: "assistant",
        text: resp.data.answer,
        chunks: resp.data.chunks,
        grounded: resp.data.grounded,
        confidence: resp.data.confidence,
      }]);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Chat failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-5 -mx-2" data-testid="split-study-page">
      <div>
        <div className="font-mono text-xs tracking-[0.3em] text-purple-400 mb-2">// SPLIT · STUDY</div>
        <h1 className="font-display font-black text-3xl tracking-tight text-white">
          Split-Screen <span className="text-gradient">Study Mode</span>
        </h1>
        <p className="text-slate-400 mt-1 text-sm">Study your document while chatting with an AI assistant grounded in it.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 min-h-[640px]">
        {/* LEFT: Document viewer */}
        <div className="glass cut-corner p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText size={14} color="#00F0FF" />
              <span className="font-mono text-[10px] tracking-widest text-cyan-400">DOCUMENT_VIEWER</span>
            </div>
            <select value={doc?.id || ""}
                    onChange={(e) => setDoc(docs.find((d) => d.id === e.target.value) || null)}
                    className="neon-input text-xs max-w-[220px]" data-testid="split-doc-select">
              <option value="" className="bg-[#05050A]">Select document</option>
              {docs.map((d) => <option key={d.id} value={d.id} className="bg-[#05050A]">{d.filename}</option>)}
            </select>
          </div>

          <div className="flex-1 glass-purple p-5 overflow-auto scan-line" data-testid="doc-viewer">
            {!doc ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <Sparkles size={28} className="text-purple-400 mb-3" />
                <div className="font-display font-semibold text-white">No document selected</div>
                <div className="text-sm text-slate-400 mt-1">Pick one from the dropdown to begin.</div>
              </div>
            ) : (
              <div>
                <div className="font-display font-bold text-lg text-white mb-1">{doc.filename}</div>
                <div className="font-mono text-[10px] text-cyan-400/80 mb-4">
                  {doc.chunks} CHUNKS · {doc.file_type.toUpperCase()} · {(doc.size / 1024).toFixed(0)} KB
                </div>
                <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
                  <p>
                    This document has been embedded and indexed into your vector database. The AI Study
                    Assistant on the right will retrieve relevant chunks automatically from this document
                    to answer every question you ask.
                  </p>
                  <p className="text-slate-400">
                    Use the <span className="neon-cyan">Quick Tools</span> below to instantly generate
                    flashcards, revision notes, extract formulas, or create viva questions — all grounded
                    strictly in this document.
                  </p>
                </div>
              </div>
            )}
          </div>

          {doc && (
            <div className="mt-4 flex flex-wrap gap-2" data-testid="quick-tools">
              {QUICK_TOOLS.map((t) => (
                <button key={t.k} onClick={() => send(t.prompt)}
                        data-testid={`tool-${t.k}`}
                        className="px-3 py-1.5 rounded-full text-[11px] font-mono border border-cyan-500/30 text-cyan-300 hover:border-cyan-400 hover:shadow-[0_0_12px_rgba(0,240,255,0.3)] transition-all">
                  <BookMarked size={10} className="inline mr-1.5" /> {t.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Chat */}
        <div className="glass cut-corner p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-display font-bold text-white text-sm flex items-center gap-2">
                <Zap size={14} color="#B026FF" /> AI Study Assistant
              </div>
              <div className="font-mono text-[10px] text-slate-500 mt-0.5">Grounded in your uploaded resources</div>
            </div>
            {doc && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-mono"
                   style={{ borderColor: synced ? "#10B981" : "rgba(148,163,184,0.3)", color: synced ? "#6EE7B7" : "#94A3B8" }}
                   data-testid="context-sync">
                <CircleDot size={10} className={synced ? "animate-pulse" : ""} />
                {synced ? "CONTEXT SYNCED" : "SYNCING..."}
              </div>
            )}
          </div>

          <div ref={scrollRef} className="flex-1 overflow-auto space-y-3 pr-2" data-testid="chat-area" style={{ minHeight: 320 }}>
            {msgs.length === 0 && (
              <div className="h-full flex items-center justify-center text-center">
                <div>
                  <Activity size={26} className="mx-auto mb-2 text-cyan-400" />
                  <div className="text-sm text-slate-400">Ask something about this document or use a quick tool.</div>
                </div>
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i} className={`${m.role === "user" ? "ml-8" : "mr-8"}`} data-testid={`msg-${i}`}>
                <div className={`rounded-lg px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-50"
                    : "glass-purple text-slate-100"
                }`}>
                  <div className="font-mono text-[9px] tracking-widest opacity-60 mb-1">
                    {m.role === "user" ? "YOU" : "ACADEMIX AI"}
                    {m.role === "assistant" && m.confidence !== undefined && (
                      <> · {(m.confidence * 100).toFixed(0)}% confidence</>
                    )}
                  </div>
                  {m.text}
                  {m.chunks?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {m.chunks.slice(0, 3).map((c, ci) => (
                        <span key={ci} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/40 border border-cyan-500/30 text-cyan-300">
                          [{ci + 1}] {c.filename}#{c.chunk_index}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="mr-8">
                <div className="glass-purple rounded-lg px-4 py-3 text-sm text-slate-300 inline-flex items-center gap-2">
                  <Loader2 size={12} className="animate-spin" />
                  retrieving and generating...
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                   onKeyDown={(e) => e.key === "Enter" && !loading && send()}
                   placeholder="Ask something about this slide or document..."
                   className="neon-input flex-1" data-testid="chat-input" />
            <button onClick={() => send()} disabled={loading || !input.trim()}
                    className="btn-neon btn-neon-solid" data-testid="chat-send">
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
