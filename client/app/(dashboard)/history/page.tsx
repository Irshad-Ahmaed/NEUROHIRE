"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { History as HistoryIcon, ChevronRight, User, Calendar, Clock, Sparkles } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { interviewApi, InterviewSession } from "@/api/interview";

export default function HistoryPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    interviewApi.listSessions()
      .then(data => {
        setSessions(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="relative flex min-h-screen bg-background text-foreground overflow-hidden">
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-20 border-b border-border flex items-center justify-between px-6 md:px-12 bg-background/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="md:hidden w-10 h-10" />
            <h1 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground">Archive</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-black uppercase tracking-tight">Assessment History</p>
              <p className="text-[10px] text-primary font-black uppercase tracking-widest">{sessions.length} Records Found</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-card flex items-center justify-center border border-border shadow-lg">
              <User size={20} className="text-primary" />
            </div>
          </div>
        </header>

        <div className="p-6 md:p-12 max-w-5xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-bold text-primary uppercase tracking-widest">
                <Sparkles size={12} />
                <span>Persistence Layer</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none">Your Technical <br/><span className="text-primary">Timeline.</span></h2>
              <p className="text-muted-foreground text-lg max-w-xl font-medium">Review your historical performance and track your growth across different theoretical domains.</p>
            </div>
            <Button 
              onClick={() => router.push("/dashboard")} 
              className="h-14 px-8 rounded-2xl font-black shadow-xl shadow-primary/10 transition-all active:scale-95"
            >
               New Session
               <ChevronRight size={20} className="ml-2" />
            </Button>
          </div>

          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                   <div key={i} className="h-48 bg-card border border-border rounded-[2rem] animate-pulse"></div>
                ))}
             </div>
          ) : sessions.length === 0 ? (
             <Card className="border-dashed border-2 border-border bg-card/30 text-center py-24 rounded-[3rem]">
                <CardContent className="space-y-6">
                   <div className="w-20 h-20 bg-accent rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                      <HistoryIcon size={40} className="text-muted-foreground opacity-30" />
                   </div>
                   <div className="space-y-2">
                      <p className="font-black text-2xl tracking-tight">No sessions found</p>
                      <p className="text-muted-foreground max-w-xs mx-auto font-medium leading-relaxed">Your technical interview history is currently empty. Start a new session to begin your record.</p>
                   </div>
                   <Button onClick={() => router.push("/dashboard")} variant="outline" className="h-12 px-8 rounded-xl border-border hover:bg-accent font-bold">Initialize First Interview</Button>
                </CardContent>
             </Card>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sessions.map(s => (
                  <Card 
                    key={s.session_id} 
                    onClick={() => router.push(`/results/${s.session_id}`)}
                    className="group border-border bg-card/50 backdrop-blur-sm hover:border-primary cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden rounded-[2.5rem]"
                  >
                    <div className="h-2 w-full bg-accent group-hover:bg-primary transition-colors duration-500"></div>
                    <CardContent className="p-8 space-y-8">
                      <div className="flex justify-between items-start">
                         <div className="space-y-1">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Deployment Role</p>
                            <h3 className="font-black text-xl tracking-tight text-foreground">{s.role}</h3>
                         </div>
                         <div className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${
                           s.status === "COMPLETED" ? "bg-primary/10 text-primary border border-primary/20" : "bg-muted text-muted-foreground"
                         }`}>
                           {s.status}
                         </div>
                      </div>

                      <div className="flex items-center gap-6 opacity-60">
                         <div className="flex items-center gap-2 text-xs font-bold">
                            <Calendar size={14} className="text-primary" />
                            {s.created_at?.split(' ')[0] || "N/A"}
                         </div>
                         <div className="flex items-center gap-2 text-xs font-bold">
                            <Clock size={14} className="text-primary" />
                            {s.created_at?.split(' ')[1] || "N/A"}
                         </div>
                      </div>

                      <div className="pt-6 border-t border-border flex items-center justify-between group-hover:border-primary/20 transition-colors">
                         <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-primary transition-colors">Analytical Report</span>
                         <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                            <ChevronRight size={16} />
                         </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
             </div>
          )}
        </div>
      </main>
    </div>
  );
}
