import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Upload, FileText, MessageSquareText, ListChecks, Columns, ArrowRight,
  Database, Activity, Sparkles,
} from "lucide-react";
import { documents } from "../lib/api";
import RagPipeline from "../components/RagPipeline";

const QUICK = [
  { to: "/dashboard/notes-qa", icon: MessageSquareText, title: "Ask Notes", color: "#00F0FF" },
  { to: "/dashboard/quiz", icon: ListChecks, title: "Quiz Me", color: "#B026FF" },
  { to: "/dashboard/summarize", icon: FileText, title: "Summarize", color: "#00F0FF" },
  { to: "/dashboard/split", icon: Columns, title: "Split Study", color: "#B026FF" },
];

export default function DashboardHome() {
  const [docs, setDocs] = useState([]);
  useEffect(() => {
    documents.list().then((r) => setDocs(r.data)).catch(() => setDocs([]));
  }, []);

  const totalChunks = docs.reduce((s, d) => s + (d.chunks || 0), 0);

  return (
    <div className="space-y-8" data-testid="dashboard-home">
      <div>
        <div className="font-mono text-xs tracking-[0.3em] text-cyan-400 mb-2">// WORKSPACE</div>
        <h1 className="font-display font-black text-4xl tracking-tight text-white">
          Your AI <span className="text-gradient">Academic Hub</span>
        </h1>
        <p className="text-slate-400 mt-2">
          Upload notes, ask questions, generate quizzes — all grounded in your own materials.
        </p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4" data-testid="stats-grid">
        <StatCard icon={FileText} label="Documents" value={docs.length} color="#00F0FF" testid="stat-docs" />
        <StatCard icon={Database} label="Chunks Indexed" value={totalChunks} color="#B026FF" testid="stat-chunks" />
        <StatCard icon={Activity} label="RAG Engine" value="ONLINE" color="#00F0FF" testid="stat-engine" small />
      </div>

      {/* Pipeline */}
      <RagPipeline active={-1} />

      {/* Quick Actions */}
      <div>
        <h2 className="font-display font-bold text-xl mb-4 text-white">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK.map((q, i) => {
            const Icon = q.icon;
            return (
              <Link key={i} to={q.to} className="glass cut-corner p-5 group" data-testid={`quick-${i}`}>
                <div className="flex items-start justify-between mb-6">
                  <div className="w-10 h-10 rounded-lg border flex items-center justify-center"
                       style={{ borderColor: q.color, background: "rgba(5,5,10,0.6)" }}>
                    <Icon size={16} color={q.color} />
                  </div>
                  <ArrowRight size={16} className="text-slate-500 group-hover:text-cyan-300 transition-colors" />
                </div>
                <div className="font-display font-semibold text-white">{q.title}</div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Docs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-xl text-white">Recent Documents</h2>
          <Link to="/dashboard/upload" className="btn-neon text-xs" data-testid="upload-link">
            <Upload size={14} /> UPLOAD
          </Link>
        </div>
        {docs.length === 0 ? (
          <div className="glass cut-corner p-8 text-center">
            <Sparkles size={32} className="mx-auto text-purple-400 mb-3" />
            <div className="font-display font-semibold text-white mb-1">No documents yet</div>
            <p className="text-sm text-slate-400 mb-5">Upload your first PDF or notes to start retrieving answers.</p>
            <Link to="/dashboard/upload" className="btn-neon btn-neon-solid" data-testid="empty-upload-btn">
              <Upload size={14} /> UPLOAD NOTES
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="docs-grid">
            {docs.slice(0, 6).map((d) => (
              <div key={d.id} className="glass p-4" data-testid={`doc-${d.id}`}>
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={14} color="#00F0FF" />
                  <span className="font-mono text-[10px] tracking-widest text-cyan-400/80 uppercase">
                    {d.file_type}
                  </span>
                </div>
                <div className="text-sm text-white truncate mb-1">{d.filename}</div>
                <div className="text-xs font-mono text-slate-500">
                  {d.chunks} chunks · {(d.size / 1024).toFixed(0)} KB
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, small, testid }) {
  return (
    <div className="glass cut-corner p-5 relative" data-testid={testid}>
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-md flex items-center justify-center"
             style={{ background: `${color}14`, border: `1px solid ${color}55` }}>
          <Icon size={16} color={color} />
        </div>
      </div>
      <div className={`font-display font-black text-white ${small ? "text-xl neon-cyan" : "text-3xl"}`}>
        {value}
      </div>
      <div className="font-mono text-xs tracking-widest text-slate-500 mt-1 uppercase">{label}</div>
    </div>
  );
}
