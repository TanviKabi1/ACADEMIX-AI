import React, { useEffect, useState } from "react";
import { Sparkles, Loader2, Copy, Save, BookMarked } from "lucide-react";
import { documents, rag } from "../lib/api";
import { toast } from "sonner";

export default function Summarizer() {
  const [docs, setDocs] = useState([]);
  const [docId, setDocId] = useState("");
  const [text, setText] = useState("");
  const [mode, setMode] = useState("text"); // text | document
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => { documents.list().then((r) => setDocs(r.data)); }, []);

  const go = async () => {
    setLoading(true); setResult(null);
    try {
      const resp = await rag.summarize(
        mode === "text" ? text : null,
        mode === "document" ? docId : null
      );
      setResult(resp.data);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Summarize failed");
    } finally { setLoading(false); }
  };

  const copy = () => {
    const out = `${result.summary}\n\n${(result.bullets || []).map(b => "• " + b).join("\n")}`;
    navigator.clipboard.writeText(out);
    toast.success("Copied");
  };

  return (
    <div className="space-y-6" data-testid="summarizer-page">
      <div>
        <div className="font-mono text-xs tracking-[0.3em] text-cyan-400 mb-2">// SMART · SUMMARY</div>
        <h1 className="font-display font-black text-4xl tracking-tight text-white">
          Smart <span className="text-gradient">Summarizer</span>
        </h1>
        <p className="text-slate-400 mt-2">Summarize selected text or entire documents — using only retrieved content.</p>
      </div>

      <div className="glass cut-corner p-6 space-y-5">
        <div className="flex gap-2" data-testid="mode-toggle">
          <button onClick={() => setMode("text")}
                  data-testid="mode-text"
                  className={`px-4 py-2 text-xs font-mono rounded-md border ${mode === "text" ? "text-cyan-300 border-cyan-400 bg-cyan-500/10" : "text-slate-400 border-slate-700"}`}>
            PASTE TEXT
          </button>
          <button onClick={() => setMode("document")}
                  data-testid="mode-document"
                  className={`px-4 py-2 text-xs font-mono rounded-md border ${mode === "document" ? "text-cyan-300 border-cyan-400 bg-cyan-500/10" : "text-slate-400 border-slate-700"}`}>
            FROM DOCUMENT
          </button>
        </div>

        {mode === "text" ? (
          <textarea value={text} onChange={(e) => setText(e.target.value)}
                    placeholder="Paste academic text here..."
                    className="neon-input min-h-[180px] font-sans" data-testid="summary-text-input" />
        ) : (
          <select value={docId} onChange={(e) => setDocId(e.target.value)}
                  className="neon-input" data-testid="summary-doc-select">
            <option value="" className="bg-[#05050A]">Select document...</option>
            {docs.map((d) => <option key={d.id} value={d.id} className="bg-[#05050A]">{d.filename}</option>)}
          </select>
        )}

        <button onClick={go} disabled={loading || (mode === "text" ? !text.trim() : !docId)}
                className="btn-neon btn-neon-solid w-full justify-center" data-testid="summarize-btn">
          {loading ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
          {loading ? "GENERATING..." : "GENERATE SUMMARY"}
        </button>
      </div>

      {result && (
        <div className="glass-purple cut-corner p-6 space-y-5" data-testid="summary-result">
          <div className="flex items-center justify-between">
            <div className="font-mono text-xs tracking-widest text-purple-300">◉ SMART_SUMMARY</div>
            <div className="flex gap-2">
              <button onClick={copy} className="btn-neon text-xs" data-testid="copy-summary">
                <Copy size={12} /> COPY
              </button>
              <button onClick={() => toast.success("Saved to notes")} className="btn-neon text-xs" data-testid="save-summary">
                <Save size={12} /> SAVE
              </button>
              <button onClick={() => toast.info("Flashcards feature coming")} className="btn-neon text-xs" data-testid="flashcards-btn">
                <BookMarked size={12} /> FLASHCARDS
              </button>
            </div>
          </div>

          <div>
            <div className="font-mono text-[10px] tracking-widest text-cyan-400 mb-2">OVERVIEW</div>
            <p className="text-slate-100 leading-relaxed">{result.summary}</p>
          </div>

          {result.bullets?.length > 0 && (
            <div>
              <div className="font-mono text-[10px] tracking-widest text-cyan-400 mb-2">KEY POINTS</div>
              <ul className="space-y-2">
                {result.bullets.map((b, i) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-300">
                    <span className="text-cyan-400 font-mono mt-0.5">▸</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.key_concepts?.length > 0 && (
            <div>
              <div className="font-mono text-[10px] tracking-widest text-cyan-400 mb-2">KEY CONCEPTS</div>
              <div className="flex flex-wrap gap-2">
                {result.key_concepts.map((c, i) => (
                  <span key={i} className="px-3 py-1 rounded-full border text-xs font-mono"
                        style={{ borderColor: "rgba(176,38,255,0.5)", color: "#E9D5FF", background: "rgba(176,38,255,0.1)" }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
