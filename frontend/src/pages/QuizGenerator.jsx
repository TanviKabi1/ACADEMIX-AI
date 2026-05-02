import React, { useEffect, useState } from "react";
import { Loader2, Sparkles, CheckCircle2, XCircle } from "lucide-react";
import { documents, rag } from "../lib/api";
import { toast } from "sonner";

const DIFF = ["easy", "medium", "hard"];
const TYPES = [
  { k: "mcq", label: "Multiple Choice" },
  { k: "true_false", label: "True / False" },
  { k: "short", label: "Short Answer" },
];

export default function QuizGenerator() {
  const [docs, setDocs] = useState([]);
  const [selected, setSelected] = useState([]);
  const [difficulty, setDifficulty] = useState("medium");
  const [type, setType] = useState("mcq");
  const [num, setNum] = useState(5);
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => { documents.list().then((r) => setDocs(r.data)); }, []);

  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const generate = async () => {
    if (selected.length === 0) {
      toast.error("Select at least one document");
      return;
    }
    setLoading(true);
    setQuiz(null); setAnswers({}); setSubmitted(false);
    try {
      const resp = await rag.quiz(selected, difficulty, type, num);
      if (!resp.data.questions?.length) {
        toast.error("Could not generate questions from selected documents");
      } else {
        setQuiz(resp.data);
      }
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Quiz generation failed");
    } finally { setLoading(false); }
  };

  const score = quiz && submitted
    ? quiz.questions.reduce((s, q, i) => s + ((answers[i] || "").toString().trim().toLowerCase() === q.correct_answer.toLowerCase() ? 1 : 0), 0)
    : 0;

  return (
    <div className="space-y-6" data-testid="quiz-page">
      <div>
        <div className="font-mono text-xs tracking-[0.3em] text-purple-400 mb-2">// QUIZ · ENGINE</div>
        <h1 className="font-display font-black text-4xl tracking-tight text-white">
          AI <span className="text-gradient">Quiz Generator</span>
        </h1>
        <p className="text-slate-400 mt-2">Generate quizzes directly from uploaded study materials.</p>
      </div>

      {/* Settings */}
      <div className="glass cut-corner p-6 space-y-5">
        <div>
          <label className="text-xs font-mono tracking-wider text-slate-400 mb-2 block">SOURCE DOCUMENTS</label>
          {docs.length === 0 ? (
            <div className="text-sm text-slate-500 font-mono">// upload documents first</div>
          ) : (
            <div className="flex flex-wrap gap-2" data-testid="quiz-docs">
              {docs.map((d) => (
                <button key={d.id} onClick={() => toggle(d.id)}
                        data-testid={`quiz-doc-${d.id}`}
                        className={`px-3 py-1.5 rounded-full text-xs font-mono border transition-all ${
                          selected.includes(d.id) ? "text-cyan-300 border-cyan-400" : "text-slate-400 border-slate-700 hover:border-cyan-400/50"
                        }`}>
                  {d.filename}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-mono tracking-wider text-slate-400 mb-2 block">DIFFICULTY</label>
            <div className="flex gap-2" data-testid="difficulty-group">
              {DIFF.map((d) => (
                <button key={d} onClick={() => setDifficulty(d)}
                        data-testid={`diff-${d}`}
                        className={`flex-1 px-3 py-2 rounded-md text-xs font-mono uppercase border transition-all ${
                          difficulty === d ? "text-cyan-300 border-cyan-400 bg-cyan-500/10" : "text-slate-400 border-slate-700"
                        }`}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-mono tracking-wider text-slate-400 mb-2 block">QUESTION TYPE</label>
            <select value={type} onChange={(e) => setType(e.target.value)}
                    className="neon-input" data-testid="question-type-select">
              {TYPES.map((t) => <option key={t.k} value={t.k} className="bg-[#05050A]">{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-mono tracking-wider text-slate-400 mb-2 block">NUMBER · {num}</label>
            <input type="range" min={3} max={10} value={num} onChange={(e) => setNum(parseInt(e.target.value))}
                   className="w-full accent-cyan-400" data-testid="num-questions" />
          </div>
        </div>

        <button onClick={generate} disabled={loading} className="btn-neon btn-neon-solid w-full justify-center"
                data-testid="generate-quiz">
          {loading ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
          {loading ? "GENERATING FROM CONTEXT..." : "GENERATE QUIZ"}
        </button>
      </div>

      {quiz && (
        <div className="space-y-4" data-testid="quiz-output">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono"
                 style={{ borderColor: "rgba(0,240,255,0.4)", color: "#00F0FF", background: "rgba(0,240,255,0.05)" }}>
              ◉ Generated using retrieved academic context
            </div>
            {submitted && (
              <div className="font-mono text-sm" data-testid="quiz-score">
                <span className="neon-cyan font-bold">{score}</span> / {quiz.questions.length}
              </div>
            )}
          </div>

          {quiz.questions.map((q, i) => (
            <div key={i} className="glass cut-corner p-5" data-testid={`question-${i}`}>
              <div className="font-mono text-[10px] text-purple-400 mb-2">QUESTION {i + 1}</div>
              <div className="font-display font-semibold text-white mb-4">{q.question}</div>

              {type === "mcq" && (
                <div className="space-y-2">
                  {q.options.map((opt, oi) => {
                    const picked = answers[i] === opt;
                    const correct = submitted && q.correct_answer === opt;
                    const wrong = submitted && picked && q.correct_answer !== opt;
                    return (
                      <button key={oi}
                              onClick={() => !submitted && setAnswers((a) => ({ ...a, [i]: opt }))}
                              data-testid={`q${i}-opt${oi}`}
                              className={`w-full text-left px-4 py-2.5 rounded-md border text-sm transition-all ${
                                correct ? "border-emerald-400 text-emerald-300 bg-emerald-500/10"
                                : wrong ? "border-red-400 text-red-300 bg-red-500/10"
                                : picked ? "border-cyan-400 text-cyan-300 bg-cyan-500/10"
                                : "border-slate-700 text-slate-300 hover:border-cyan-500/50"
                              }`}>
                        <span className="font-mono text-[10px] text-slate-500 mr-2">{String.fromCharCode(65 + oi)}</span>
                        {opt}
                        {correct && <CheckCircle2 size={12} className="inline ml-2" />}
                        {wrong && <XCircle size={12} className="inline ml-2" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {type === "true_false" && (
                <div className="flex gap-3">
                  {["True", "False"].map((opt) => {
                    const picked = answers[i] === opt;
                    const correct = submitted && q.correct_answer === opt;
                    const wrong = submitted && picked && q.correct_answer !== opt;
                    return (
                      <button key={opt}
                              onClick={() => !submitted && setAnswers((a) => ({ ...a, [i]: opt }))}
                              data-testid={`q${i}-${opt.toLowerCase()}`}
                              className={`flex-1 px-4 py-2.5 rounded-md border text-sm font-mono transition-all ${
                                correct ? "border-emerald-400 text-emerald-300 bg-emerald-500/10"
                                : wrong ? "border-red-400 text-red-300 bg-red-500/10"
                                : picked ? "border-cyan-400 text-cyan-300 bg-cyan-500/10"
                                : "border-slate-700 text-slate-300"
                              }`}>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {type === "short" && (
                <input type="text" value={answers[i] || ""}
                       onChange={(e) => !submitted && setAnswers((a) => ({ ...a, [i]: e.target.value }))}
                       className="neon-input" placeholder="Your answer..." data-testid={`q${i}-input`} />
              )}

              {submitted && (
                <div className="mt-4 pt-4 border-t" style={{ borderColor: "rgba(0,240,255,0.1)" }}>
                  <div className="text-xs font-mono text-cyan-300 mb-1">CORRECT: {q.correct_answer}</div>
                  <div className="text-xs text-slate-400 leading-relaxed">{q.explanation}</div>
                  {q.source_chunk && (
                    <div className="text-[11px] text-slate-500 mt-2 italic border-l-2 pl-3" style={{ borderColor: "rgba(176,38,255,0.5)" }}>
                      "{q.source_chunk}"
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {!submitted ? (
            <button onClick={() => setSubmitted(true)} className="btn-neon btn-neon-solid w-full justify-center" data-testid="submit-quiz">
              SUBMIT QUIZ
            </button>
          ) : (
            <button onClick={generate} className="btn-neon w-full justify-center" data-testid="regen-quiz">
              GENERATE NEW QUIZ
            </button>
          )}
        </div>
      )}
    </div>
  );
}
