import React, { useEffect, useState } from "react";
import { Send, Loader2, FileText, AlertTriangle, Sparkles, Quote } from "lucide-react";
import { documents, rag } from "../lib/api";
import RagPipeline from "../components/RagPipeline";
import { toast } from "sonner";

export default function NotesQA() {
  const [docs, setDocs] = useState([]);
  const [selected, setSelected] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeStep, setActiveStep] = useState(-1);

  useEffect(() => {
    documents.list().then((r) => setDocs(r.data)).catch(() => {});
  }, []);

  const toggle = (id) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const ask = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setResult(null);
    // animate pipeline
    for (let i = 0; i < 5; i++) {
      setActiveStep(i);
      await new Promise((r) => setTimeout(r, 280));
    }
    try {
      const resp = await rag.query(question, selected.length ? selected : null, 4);
      setResult(resp.data);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Query failed");
    } finally {
      setLoading(false);
      setActiveStep(-1);
    }
  };

  return (
    <div className="space-y-6" data-testid="notes-qa-page">
      <div>
        <div className="font-mono text-xs tracking-[0.3em] text-cyan-400 mb-2">// RAG · Q&A</div>
        <h1 className="font-display font-black text-4xl tracking-tight text-white">
          Academic <span className="text-gradient">Notes Q&A</span>
        </h1>
        <p className="text-slate-400 mt-2">Ask questions grounded only in your uploaded study materials.</p>
      </div>

      <RagPipeline active={activeStep} />

      {/* Document selector */}
      <div className="glass cut-corner p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="font-display font-semibold text-white text-sm">Scope (optional)</div>
          <div className="font-mono text-[10px] text-slate-500">
            {selected.length === 0 ? "ALL DOCUMENTS" : `${selected.length} selected`}
          </div>
        </div>
        {docs.length === 0 ? (
          <div className="text-sm text-slate-500 font-mono">// upload documents first</div>
        ) : (
          <div className="flex flex-wrap gap-2" data-testid="doc-scope">
            {docs.map((d) => (
              <button key={d.id} onClick={() => toggle(d.id)}
                      data-testid={`scope-${d.id}`}
                      className={`px-3 py-1.5 rounded-full text-xs font-mono border transition-all ${
                        selected.includes(d.id)
                          ? "text-cyan-300 border-cyan-400"
                          : "text-slate-400 border-slate-700 hover:border-cyan-400/50"
                      }`}
                      style={selected.includes(d.id) ? { boxShadow: "0 0 12px rgba(0,240,255,0.3)" } : {}}>
                <FileText size={10} className="inline mr-1.5" />
                {d.filename}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Question input */}
      <div className="glass cut-corner p-1 flex items-center gap-2 scan-line">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && ask()}
          placeholder="Ask something from your uploaded notes..."
          data-testid="question-input"
          className="flex-1 bg-transparent outline-none px-5 py-4 text-white placeholder-slate-500 font-mono text-sm"
        />
        <button onClick={ask} disabled={loading || !question.trim()}
                className="btn-neon btn-neon-solid m-1" data-testid="ask-button">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          {loading ? "QUERYING" : "ASK"}
        </button>
      </div>

      {/* Warning */}
      <div className="flex items-center gap-2 text-xs font-mono text-amber-300/90">
        <AlertTriangle size={14} />
        Answers are generated only from retrieved academic documents.
      </div>

      {/* Response */}
      {result && (
        <div className="space-y-5" data-testid="answer-area">
          <div className="glass-purple cut-corner p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={14} color="#B026FF" />
                <span className="font-mono text-[11px] tracking-widest text-purple-300">GROUNDED_ANSWER</span>
              </div>
              <div className="flex items-center gap-3 font-mono text-[10px]">
                <span className={result.grounded ? "text-cyan-300" : "text-amber-300"}>
                  {result.grounded ? "◉ grounded" : "◉ no-context"}
                </span>
                <span className="text-slate-500">confidence {(result.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>
            <div className="text-slate-100 leading-relaxed whitespace-pre-wrap" data-testid="answer-text">
              {result.answer}
            </div>
          </div>

          {result.chunks?.length > 0 && (
            <div>
              <div className="font-display font-semibold text-white mb-3 text-sm flex items-center gap-2">
                <Quote size={14} color="#00F0FF" /> Retrieved Sources
              </div>
              <div className="space-y-3" data-testid="chunks-list">
                {result.chunks.map((c, i) => (
                  <div key={i} className="glass p-4" data-testid={`chunk-${i}`}>
                    <div className="flex items-center justify-between mb-2 font-mono text-[10px]">
                      <span className="text-cyan-300">
                        [Source {i + 1}] {c.filename} · chunk {c.chunk_index}
                      </span>
                      <span className="text-slate-500">score {(c.score * 100).toFixed(0)}%</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{c.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
