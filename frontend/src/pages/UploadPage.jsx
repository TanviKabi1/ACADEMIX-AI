import React, { useEffect, useState, useCallback } from "react";
import { Upload, FileText, Trash2, CheckCircle2, Loader2 } from "lucide-react";
import { documents } from "../lib/api";
import { toast } from "sonner";

export default function UploadPage() {
  const [docs, setDocs] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const refresh = useCallback(() => {
    documents.list().then((r) => setDocs(r.data)).catch(() => {});
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  const handleFiles = async (files) => {
    const arr = Array.from(files || []);
    if (!arr.length) return;
    setUploading(true);
    try {
      await Promise.all(arr.map(async (f) => {
        try {
          await documents.upload(f);
          toast.success(`Indexed ${f.name}`);
        } catch (err) {
          toast.error(err?.response?.data?.detail || `Failed: ${f.name}`);
          throw err; // Allow Promise.all to catch if needed, though we handle individually
        }
      }));
    } catch (err) {
      // Errors handled individually above
    }
    setUploading(false);
    refresh();
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const del = async (id) => {
    try {
      await documents.remove(id);
      toast.success("Document removed");
      refresh();
    } catch {
      toast.error("Failed to remove");
    }
  };

  return (
    <div className="space-y-8" data-testid="upload-page">
      <div>
        <div className="font-mono text-xs tracking-[0.3em] text-purple-400 mb-2">// KNOWLEDGE INGESTION</div>
        <h1 className="font-display font-black text-4xl tracking-tight text-white">Upload Notes</h1>
        <p className="text-slate-400 mt-2">Drag & drop PDFs, DOCX, or TXT files to index into your vector database.</p>
      </div>

      <label
        htmlFor="file-input"
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className="glass cut-corner p-10 md:p-16 block text-center cursor-pointer transition-all"
        style={{
          borderColor: dragging ? "#B026FF" : "rgba(0,240,255,0.2)",
          boxShadow: dragging ? "0 0 40px rgba(176,38,255,0.3)" : "",
        }}
        data-testid="dropzone"
      >
        <input id="file-input" type="file" multiple accept=".pdf,.docx,.txt,.md"
               className="hidden" onChange={(e) => handleFiles(e.target.files)} data-testid="file-input" />
        <div className="w-16 h-16 rounded-xl mx-auto mb-5 flex items-center justify-center"
             style={{ background: "rgba(0,240,255,0.08)", border: "1px solid rgba(0,240,255,0.3)" }}>
          {uploading ? <Loader2 className="animate-spin" color="#00F0FF" size={26} /> : <Upload color="#00F0FF" size={26} />}
        </div>
        <div className="font-display font-bold text-xl text-white mb-2">
          {uploading ? "Embedding..." : "Drop files here or click to browse"}
        </div>
        <div className="text-sm text-slate-400 font-mono">PDF · DOCX · TXT · MD</div>
      </label>

      <div>
        <h2 className="font-display font-bold text-xl mb-4 text-white">Your Knowledge Base</h2>
        {docs.length === 0 ? (
          <div className="text-sm text-slate-500 font-mono">// no documents indexed yet</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="uploaded-docs">
            {docs.map((d) => (
              <div key={d.id} className="glass p-4 flex items-start justify-between gap-3" data-testid={`uploaded-${d.id}`}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={14} color="#00F0FF" />
                    <span className="font-mono text-[10px] tracking-widest text-cyan-400/80 uppercase">
                      {d.file_type}
                    </span>
                    <CheckCircle2 size={12} color="#10B981" />
                  </div>
                  <div className="text-sm text-white truncate mb-1">{d.filename}</div>
                  <div className="text-xs font-mono text-slate-500">{d.chunks} chunks · {(d.size / 1024).toFixed(0)} KB</div>
                </div>
                <button onClick={() => del(d.id)} className="p-2 rounded hover:bg-red-500/10 text-slate-500 hover:text-red-400"
                        data-testid={`delete-${d.id}`}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
