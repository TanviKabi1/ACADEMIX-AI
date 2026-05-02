import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";
import ParticleBackground from "../components/ParticleBackground";

const PHASES = [
  "Initializing Retrieval Engine...",
  "Loading Academic Knowledge Base...",
  "Embedding Documents...",
  "Syncing Vector Database...",
  "Launching AI Workspace...",
];

export default function Loading() {
  const nav = useNavigate();
  const [phase, setPhase] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let p = 0;
    const tick = setInterval(() => {
      p += 2;
      setProgress(Math.min(p, 100));
      setPhase(Math.min(PHASES.length - 1, Math.floor(p / (100 / PHASES.length))));
      if (p >= 100) {
        clearInterval(tick);
        setTimeout(() => nav("/landing"), 450);
      }
    }, 70);
    return () => clearInterval(tick);
  }, [nav]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" data-testid="loading-screen">
      <ParticleBackground />
      {/* Scanning ring */}
      <div className="relative z-10 text-center px-6">
        <div className="flex justify-center mb-8">
          <div className="relative w-28 h-28">
            <div className="absolute inset-0 rounded-full border border-cyan-400/40 pulse-glow" />
            <div
              className="absolute inset-3 rounded-full border border-purple-500/40"
              style={{ animation: "spin 8s linear infinite" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-14 h-14 rounded-lg flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #00F0FF, #B026FF)",
                  boxShadow: "0 0 40px rgba(0,240,255,0.6)",
                }}
              >
                <Zap color="#05050A" size={28} strokeWidth={2.5} />
              </div>
            </div>
          </div>
        </div>

        <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tight text-gradient mb-3">
          ACADEMIX AI
        </h1>
        <p className="font-mono text-xs tracking-[0.4em] text-cyan-400/80 mb-10">
          RETRIEVAL · POWERED · INTELLIGENCE
        </p>

        <div className="max-w-md mx-auto">
          <div
            className="h-1.5 rounded-full overflow-hidden mb-4"
            style={{ background: "rgba(0,240,255,0.1)", border: "1px solid rgba(0,240,255,0.2)" }}
          >
            <div
              className="h-full transition-all duration-200"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #00F0FF, #B026FF)",
                boxShadow: "0 0 12px rgba(0,240,255,0.6)",
              }}
              data-testid="loading-progress"
            />
          </div>
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-cyan-300 caret" data-testid="loading-phase">
              {PHASES[phase]}
            </span>
            <span className="text-purple-400">{progress}%</span>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`}</style>
    </div>
  );
}
