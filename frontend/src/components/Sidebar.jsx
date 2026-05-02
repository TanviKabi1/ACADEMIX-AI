import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Upload, MessageSquareText, BookOpenCheck,
  ListChecks, FileText, Columns, Settings, LogOut, Zap,
} from "lucide-react";
import { clearSession, getUser } from "../lib/api";

const items = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", testid: "nav-dashboard" },
  { to: "/dashboard/notes-qa", icon: MessageSquareText, label: "Notes Q&A", testid: "nav-notes-qa" },
  { to: "/dashboard/upload", icon: Upload, label: "Upload Notes", testid: "nav-upload" },
  { to: "/dashboard/study", icon: BookOpenCheck, label: "Study Assistant", testid: "nav-study" },
  { to: "/dashboard/quiz", icon: ListChecks, label: "Quiz Generator", testid: "nav-quiz" },
  { to: "/dashboard/summarize", icon: FileText, label: "Smart Summaries", testid: "nav-summarize" },
  { to: "/dashboard/split", icon: Columns, label: "Split Study Mode", testid: "nav-split" },
  { to: "/dashboard/settings", icon: Settings, label: "Settings", testid: "nav-settings" },
];

export default function Sidebar() {
  const nav = useNavigate();
  const user = getUser();
  const logout = () => {
    clearSession();
    nav("/login");
  };
  return (
    <aside
      className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 border-r"
      style={{ background: "#05050A", borderColor: "rgba(0,240,255,0.1)" }}
      data-testid="sidebar"
    >
      <div className="px-6 py-6 flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-md flex items-center justify-center pulse-glow"
          style={{
            background: "linear-gradient(135deg, #00F0FF, #B026FF)",
          }}
        >
          <Zap size={18} color="#05050A" strokeWidth={2.5} />
        </div>
        <div>
          <div className="font-display font-bold text-sm tracking-wider text-white">ACADEMIX</div>
          <div className="font-mono text-[10px] text-cyan-400/80 tracking-widest">AI · RAG</div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.to === "/dashboard"}
              data-testid={it.testid}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-md text-sm transition-all font-mono ${
                  isActive
                    ? "sidebar-item-active"
                    : "text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/5"
                }`
              }
            >
              <Icon size={16} />
              <span className="tracking-wide">{it.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t" style={{ borderColor: "rgba(0,240,255,0.1)" }}>
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-sm"
            style={{
              background: "rgba(0,240,255,0.1)",
              border: "1px solid rgba(0,240,255,0.3)",
              color: "#00F0FF",
            }}
          >
            {(user?.name || "U").slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm text-white truncate">{user?.name || "Student"}</div>
            <div className="text-[10px] text-slate-500 font-mono truncate">{user?.email}</div>
          </div>
        </div>
        <button
          onClick={logout}
          data-testid="logout-btn"
          className="w-full flex items-center justify-center gap-2 text-xs font-mono py-2 px-3 rounded-md text-slate-400 border border-slate-700/50 hover:border-red-400/50 hover:text-red-300 transition-all"
        >
          <LogOut size={14} /> LOGOUT
        </button>
      </div>
    </aside>
  );
}
