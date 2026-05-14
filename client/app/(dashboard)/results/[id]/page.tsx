"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Award, BarChart3, ChevronLeft, BookOpen, History as HistoryIcon } from "lucide-react";
import Link from "next/link";
import { interviewApi, InterviewSession, InterviewTurn } from "@/api/interview";

export default function ResultsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<InterviewSession["final_analysis"]>(null);
  const [turns, setTurns] = useState<InterviewTurn[]>([]);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    interviewApi.getSession(String(id))
      .then(data => {
        setAnalysis(data.final_analysis);
        setTurns(data.turns || []);
        setRole(data.role || "");
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-muted-foreground font-medium animate-pulse">Generating your final report...</p>
    </div>
  );

  if (!analysis) return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-6 px-6 text-center">
      <AlertCircle size={64} className="text-destructive opacity-20" />
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Analysis Not Found</h1>
        <p className="text-muted-foreground">We couldn&apos;t retrieve the analysis for this session.</p>
      </div>
      <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
    </div>
  );

  const gradeColor: Record<string, string> = {
    A: "text-green-500", B: "text-blue-500", C: "text-yellow-500", D: "text-orange-500", F: "text-red-500"
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-10 flex items-center px-6 md:px-12">
        <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft size={16} />
          Back to Dashboard
        </Link>
      </header>

      <main className="max-w-5xl mx-auto p-6 md:p-12 space-y-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight">Interview Report</h1>
            <p className="text-muted-foreground text-lg italic">Evaluation for {role} Candidate</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-8 shadow-xl">
             <div className="text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Grade</p>
                <p className={`text-5xl font-black ${gradeColor[analysis.grade] || "text-primary"}`}>{analysis.grade}</p>
             </div>
             <div className="w-px h-12 bg-border"></div>
             <div className="text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Score</p>
                <p className="text-3xl font-bold">{analysis.overall_score}<span className="text-sm text-muted-foreground font-medium">/100</span></p>
             </div>
          </div>
        </div>

        {/* Summary Card */}
        <Card className="border-border bg-card/50 shadow-sm overflow-hidden">
          <div className="bg-primary/5 h-2 w-full"></div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="text-primary" size={20} />
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg leading-relaxed text-muted-foreground">
              {analysis.summary}
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent rounded-full text-sm font-bold">
              Recommendation: <span className="text-primary">{analysis.recommendation?.toUpperCase()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <Card className="border-green-500/10 bg-green-500/5 shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-500">
                  <CheckCircle2 size={20} />
                  Core Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analysis.strengths?.map((s: string, i: number) => (
                    <li key={i} className="flex gap-3 text-sm text-muted-foreground leading-relaxed">
                      <div className="text-green-500 pt-1">•</div>
                      {s}
                    </li>
                  ))}
                </ul>
              </CardContent>
           </Card>

           <Card className="border-orange-500/10 bg-orange-500/5 shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-500">
                  <BarChart3 size={20} />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analysis.improvement_areas?.map((s: string, i: number) => (
                    <li key={i} className="flex gap-3 text-sm text-muted-foreground leading-relaxed">
                      <div className="text-orange-500 pt-1">•</div>
                      {s}
                    </li>
                  ))}
                </ul>
              </CardContent>
           </Card>
        </div>

        {/* Turn Breakdown */}
        <div className="space-y-6">
           <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
              <HistoryIcon className="text-primary" size={24} />
              Session Breakdown
           </h2>
           <div className="space-y-4">
              {turns.map((t, i) => (
                <div key={i} className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/20 transition-all duration-300">
                  <div className="p-6 md:p-8 space-y-6">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-bold text-muted-foreground bg-accent px-2 py-1 rounded">TURN {t.turn_number}</span>
                       {t.score !== undefined && t.score !== null && (
                         <span className="text-xs font-bold text-primary">SCORE: {(t.score * 100).toFixed(0)}%</span>
                       )}
                    </div>
                    
                    <div className="space-y-4">
                       <div className="space-y-2">
                          <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Question</p>
                          <p className="text-lg font-medium leading-relaxed">{t.question}</p>
                       </div>
                       
                       {t.answer && (
                         <div className="space-y-2 pl-4 border-l-2 border-accent">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Your Answer</p>
                            <p className="text-sm text-muted-foreground leading-relaxed italic">&quot;{t.answer}&quot;</p>
                         </div>
                       )}
                    </div>

                    {t.context && t.context.length > 0 && (
                      <div className="pt-4 flex flex-wrap gap-2">
                        {t.context.map((c: { book: string }, ci: number) => (
                          <div key={ci} className="flex items-center gap-1.5 px-2 py-1 bg-accent/50 rounded text-[10px] font-medium text-muted-foreground">
                            <BookOpen size={10} />
                            {c.book}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
           </div>
        </div>

        <div className="pt-8 flex justify-center">
           <Button onClick={() => router.push("/dashboard")} variant="outline" className="gap-2 h-12 px-8 font-bold">
             Back to Dashboard
           </Button>
        </div>
      </main>
    </div>
  );
}

