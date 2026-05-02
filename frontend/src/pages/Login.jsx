import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Zap, Mail, Lock, ArrowRight, User } from "lucide-react";
import ParticleBackground from "../components/ParticleBackground";
import { auth, saveSession } from "../lib/api";
import { toast } from "sonner";

const HERO_IMG = "https://static.prod-images.emergentagent.com/jobs/d9d3fb33-630f-4f8a-bc35-4c7b5135dac7/images/6eb0d10dc8fe7fa3132ce7c49c663e692d2345c9cfaa9f1f67c93edd406b0eb3.png";

export default function Login({ mode = "login" }) {
  const nav = useNavigate();
  const [isRegister, setIsRegister] = useState(mode === "register");
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = isRegister
        ? await auth.register(form.email, form.password, form.name || form.email.split("@")[0])
        : await auth.login(form.email, form.password);
      saveSession(resp.data.access_token, resp.data.user);
      toast.success(isRegister ? "Account created" : "Welcome back");
      nav("/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const resp = await auth.googleLogin(credentialResponse.credential);
      saveSession(resp.data.access_token, resp.data.user);
      toast.success("Welcome with Google");
      nav("/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Google authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 relative overflow-hidden" data-testid="login-page">
      <ParticleBackground />

      {/* LEFT PANEL */}
      <div className="hidden lg:flex relative p-10 flex-col justify-between"
           style={{ background: "linear-gradient(160deg, rgba(176,38,255,0.08), rgba(0,240,255,0.04) 60%, transparent)" }}>
        <Link to="/landing" className="flex items-center gap-3" data-testid="login-logo-link">
          <div className="w-8 h-8 rounded-md flex items-center justify-center pulse-glow"
               style={{ background: "linear-gradient(135deg,#00F0FF,#B026FF)" }}>
            <Zap size={16} color="#05050A" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-display font-bold text-sm tracking-widest text-white">ACADEMIX</div>
            <div className="font-mono text-[9px] text-cyan-400/80 tracking-[0.3em]">AI · RAG</div>
          </div>
        </Link>

        <div className="relative">
          <div className="glass cut-corner overflow-hidden relative scan-line">
            <img src={HERO_IMG} alt="neural vector" className="w-full h-auto opacity-90" />
          </div>
          <div className="absolute -top-3 -right-3 font-mono text-[10px] tracking-widest text-cyan-300 px-2 py-1 rounded"
               style={{ background: "rgba(5,5,10,0.8)", border: "1px solid rgba(0,240,255,0.3)" }}>
            ◉ VECTOR_INDEX
          </div>
        </div>

        <div>
          <h2 className="font-display font-bold text-3xl tracking-tight mb-2 text-white">
            Your Knowledge. <br />
            <span className="text-gradient">Retrieved Intelligently.</span>
          </h2>
          <p className="text-sm text-slate-400 font-mono">// powered by Gemini 3 Flash + ChromaDB</p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="relative flex items-center justify-center p-6 lg:p-16">
        <div className="w-full max-w-md glass cut-corner p-8 lg:p-10 relative radial-bg" data-testid="auth-card">
          <div className="font-mono text-xs tracking-[0.3em] text-cyan-400 mb-3">
            // {isRegister ? "CREATE ACCOUNT" : "SECURE ACCESS"}
          </div>
          <h1 className="font-display font-black text-3xl tracking-tight mb-2 text-white">
            {isRegister ? "Join Academix" : "Welcome Back"}
          </h1>
          <p className="text-sm text-slate-400 mb-8">
            {isRegister ? "Start building your knowledge base." : "Access your AI-powered workspace."}
          </p>

          <form onSubmit={submit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="text-xs font-mono tracking-wider text-slate-400 mb-1.5 block">NAME</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="text" required className="neon-input pl-9" placeholder="Jane Student"
                         value={form.name} onChange={update("name")} data-testid="input-name" />
                </div>
              </div>
            )}
            <div>
              <label className="text-xs font-mono tracking-wider text-slate-400 mb-1.5 block">EMAIL</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="email" required className="neon-input pl-9" placeholder="you@campus.edu"
                       value={form.email} onChange={update("email")} data-testid="input-email" />
              </div>
            </div>
            <div>
              <label className="text-xs font-mono tracking-wider text-slate-400 mb-1.5 block">PASSWORD</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="password" required minLength={6} className="neon-input pl-9" placeholder="••••••••"
                       value={form.password} onChange={update("password")} data-testid="input-password" />
              </div>
            </div>

            {!isRegister && (
              <div className="flex items-center justify-between text-xs font-mono">
                <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-cyan-300">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
                         className="accent-cyan-400" data-testid="remember-me" />
                  REMEMBER ME
                </label>
                <button type="button" className="text-slate-400 hover:text-cyan-300" data-testid="forgot-password">
                  FORGOT?
                </button>
              </div>
            )}

            <button type="submit" disabled={loading}
                    className="btn-neon btn-neon-solid w-full justify-center"
                    data-testid={isRegister ? "submit-register" : "submit-login"}>
              {loading ? "PROCESSING..." : isRegister ? "CREATE ACCOUNT" : "LOGIN"} <ArrowRight size={16} />
            </button>
          </form>
          
          <p className="text-center mt-8 text-xs font-mono text-slate-500">
            {isRegister ? "Already have an account?" : "No account yet?"}{" "}
            <button type="button" onClick={() => setIsRegister(!isRegister)}
                    className="text-cyan-300 hover:text-cyan-200" data-testid="toggle-auth-mode">
              {isRegister ? "LOGIN" : "CREATE ACCOUNT"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
