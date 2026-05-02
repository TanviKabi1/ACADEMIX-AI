import React from "react";
import { FileText, Cpu, Database, Search, Sparkles } from "lucide-react";

const steps = [
  { icon: FileText, label: "Upload", sub: "PDF / DOCX / Notes" },
  { icon: Cpu, label: "Chunk & Embed", sub: "HuggingFace MiniLM" },
  { icon: Database, label: "Vector DB", sub: "ChromaDB" },
  { icon: Search, label: "Retrieve", sub: "Top-K context" },
  { icon: Sparkles, label: "Generate", sub: "Gemini 3 Flash" },
];

export default function RagPipeline({ active = -1, className = "" }) {
  return (
    <div className={`glass cut-corner p-6 relative ${className}`} data-testid="rag-pipeline">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const isActive = active === i || active === -1;
          return (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center text-center min-w-[72px]">
                <div
                  className={`w-12 h-12 rounded-lg border flex items-center justify-center ${
                    isActive ? "node-pulse" : ""
                  }`}
                  style={{
                    borderColor: i % 2 === 0 ? "rgba(0,240,255,0.5)" : "rgba(176,38,255,0.5)",
                    background: "rgba(5,5,10,0.6)",
                    boxShadow: isActive
                      ? `0 0 18px ${i % 2 === 0 ? "rgba(0,240,255,0.4)" : "rgba(176,38,255,0.4)"}`
                      : "none",
                  }}
                >
                  <Icon size={18} color={i % 2 === 0 ? "#00F0FF" : "#B026FF"} />
                </div>
                <div className="mt-2 text-xs font-mono text-slate-200">{s.label}</div>
                <div className="text-[10px] text-slate-500 font-mono">{s.sub}</div>
              </div>
              {i < steps.length - 1 && (
                <svg width="48" height="24" className="flex-1 max-w-[60px]">
                  <line
                    x1="0" y1="12" x2="48" y2="12"
                    stroke={i % 2 === 0 ? "#00F0FF" : "#B026FF"}
                    strokeWidth="1.2"
                    opacity="0.6"
                    className="flow-line"
                  />
                </svg>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
