"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, BookOpen, ChevronLeft, Loader2, Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";
import { interviewApi, InterviewTurn } from "@/api/interview";

export default function InterviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [turnId, setTurnId] = useState<string>("");
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [context, setContext] = useState<InterviewTurn["context"]>([]);
  const [turnNumber, setTurnNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("medium");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!id) return;
    
    const initializeSession = async () => {
      const stored = localStorage.getItem(`session_${id}`);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          setTurnId(data.turn_id);
          setQuestion(data.question);
          setContext(data.source_context || []);
          setDifficulty(data.difficulty || "medium");
          return;
        } catch {
          // Fallback to API if JSON parse fails
        }
      }

      try {
        const data = await interviewApi.getSession(String(id));
        if (data.turns && data.turns.length > 0) {
          const lastTurn = data.turns[data.turns.length - 1];
          setTurnId(lastTurn.id); 
          setQuestion(lastTurn.question);
          setContext(lastTurn.context || []);
          setTurnNumber(data.turns.length);
        }
      } catch {
        setError("Session not found.");
      }
    };

    initializeSession();
  }, [id]);

  async function submitAnswer() {
    if (!answer.trim()) return;
    setLoading(true);
    setError("");

    try {
      const data = await interviewApi.submitAnswer({ 
        session_id: String(id), 
        turn_id: turnId, 
        answer 
      });
      
      if (data.session_complete) {
        router.push(`/results/${id}`);
        return;
      }

      setFeedback(data.feedback || "");
      setAnswer("");
      setTurnId(data.turn_id);
      setQuestion(data.question);
      setContext(data.source_context || []);
      setDifficulty(data.difficulty || "medium");
      setTurnNumber(data.turn_number || 1);
      
      // Scroll to top when new question arrives
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setError("Failed to process your answer. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background text-foreground">
      {/* Main Interview Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-accent rounded-md transition-colors text-muted-foreground hover:text-foreground">
              <ChevronLeft size={20} />
            </Link>
            <div>
              <h1 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Technical Interview</h1>
              <p className="text-xs font-medium">Session ID: {String(id).slice(0, 8)}...</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold px-2 py-1 bg-accent rounded text-muted-foreground">TURN {turnNumber} / 8</span>
            <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${
              difficulty === "hard" ? "bg-red-500/20 text-red-500" :
              difficulty === "easy" ? "bg-green-500/20 text-green-500" : "bg-yellow-500/20 text-yellow-500"
            }`}>
              {difficulty}
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 pb-32">
          {error && (
            <div className="max-w-3xl mx-auto flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {/* AI Question */}
          <div className="max-w-3xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">Interviewer</span>
            </div>
            <Card className="border-none bg-accent/50 shadow-none">
              <CardContent className="p-6 md:p-8">
                <p className="text-xl md:text-2xl leading-relaxed font-medium">
                  {question || <Loader2 className="animate-spin" />}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* AI Feedback (if any) */}
          {feedback && (
            <div className="max-w-3xl mx-auto animate-in fade-in duration-700">
              <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 text-sm leading-relaxed text-muted-foreground flex gap-4">
                <div className="text-primary pt-1">💬</div>
                <p>{feedback}</p>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="fixed bottom-0 left-0 right-0 md:left-0 md:w-[calc(100%-20rem)] bg-background/80 backdrop-blur-xl border-t border-border p-4 z-20">
          <div className="max-w-3xl mx-auto relative">
            <textarea
              className="w-full bg-accent/50 border border-input rounded-2xl p-4 pr-16 text-foreground resize-none h-24 md:h-32 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
              placeholder="Type your detailed answer here..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) submitAnswer();
              }}
            />
            <div className="absolute bottom-4 right-4 flex items-center gap-3">
               <p className="hidden md:block text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Ctrl + Enter to send</p>
               <Button 
                onClick={submitAnswer} 
                disabled={loading || !answer.trim()}
                size="icon"
                className="rounded-xl w-10 h-10 shadow-lg shadow-primary/20"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Traceability Side Panel */}
      <aside className="w-full md:w-80 border-t md:border-t-0 md:border-l border-border bg-card overflow-y-auto max-h-screen">
        <div className="p-6 sticky top-0 bg-card border-b border-border z-10 flex items-center justify-between">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <BookOpen size={16} className="text-primary" />
            SOURCE CONTEXT
          </h3>
          <span className="text-[10px] bg-accent px-1.5 py-0.5 rounded font-mono text-muted-foreground">RAG</span>
        </div>
        <div className="p-4 space-y-4">
          {!context || context.length === 0 ? (
             <div className="text-center py-20 text-muted-foreground px-6 space-y-2">
                <BookOpen size={32} className="mx-auto opacity-20" />
                <p className="text-xs font-medium">Wait for the next question to see source context.</p>
             </div>
          ) : (
            context.map((chunk, i) => (
              <Card key={i} className="bg-accent/30 border-none hover:bg-accent/50 transition-colors">
                <CardHeader className="p-4 pb-0">
                  <CardTitle className="text-[10px] font-bold text-primary flex items-center gap-1">
                    <BookOpen size={10} />
                    {chunk.book.toUpperCase()}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <p className="text-xs text-muted-foreground leading-relaxed italic">
                    &quot;{chunk.text}&quot;
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground/50 font-bold">
                    <span>SCORE: {(chunk.score * 100).toFixed(0)}%</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}
