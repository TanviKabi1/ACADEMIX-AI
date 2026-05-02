import React from "react";
import { getUser } from "../lib/api";

export default function Settings() {
  const u = getUser();
  return (
    <div className="space-y-6" data-testid="settings-page">
      <div>
        <div className="font-mono text-xs tracking-[0.3em] text-cyan-400 mb-2">// SETTINGS</div>
        <h1 className="font-display font-black text-4xl tracking-tight text-white">Settings</h1>
      </div>
      <div className="glass cut-corner p-6 space-y-4">
        <Row label="NAME" value={u?.name} />
        <Row label="EMAIL" value={u?.email} />
        <Row label="LLM MODEL" value="gemini-1.5-flash" />
        <Row label="EMBEDDINGS" value="sentence-transformers/all-MiniLM-L6-v2" />
        <Row label="VECTOR DB" value="ChromaDB (cosine)" />
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: "rgba(0,240,255,0.08)" }}>
      <span className="font-mono text-xs tracking-widest text-slate-500">{label}</span>
      <span className="text-sm text-white">{value}</span>
    </div>
  );
}
