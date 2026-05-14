"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, User, ChevronRight, Sparkles } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { interviewApi } from "@/api/interview";

const ROLES = ["AI/ML Engineer", "Data Scientist", "Backend Engineer"];

export default function Dashboard() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [role, setRole] = useState(ROLES[0]);
  const [experience, setExperience] = useState("2");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function startInterview() {
    if (!file) return;
    setLoading(true);
    const form = new FormData();
    form.append("file", file);
    form.append("role", role);
    form.append("experience", experience);

    try {
      const data = await interviewApi.startSession(form);
      
      if (data.session_id) {
        localStorage.setItem(`session_${data.session_id}`, JSON.stringify(data));
        router.push(`/interview/${data.session_id}`);
      }
    } catch (err) {
      console.error("Failed to start interview", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen bg-background text-foreground overflow-hidden">
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-20 border-b border-border flex items-center justify-between px-6 md:px-12 bg-background/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="md:hidden w-10 h-10" /> {/* Spacer for mobile menu button */}
            <h1 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground">Command Center</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-black uppercase tracking-tight">Candidate Portal</p>
              <p className="text-[10px] text-primary font-black uppercase tracking-widest">Active Session Ready</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-card flex items-center justify-center border border-border shadow-lg">
              <User size={20} className="text-primary" />
            </div>
          </div>
        </header>

        <div className="p-6 md:p-12 max-w-5xl mx-auto space-y-12">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-bold text-primary uppercase tracking-widest">
              <Sparkles size={12} />
              <span>Interactive RAG Engine</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none">Prepare for your <br/><span className="text-primary">next big role.</span></h2>
            <p className="text-muted-foreground text-lg max-w-2xl">Upload your resume and select your target role. Our AI will simulate a real technical interview based on world-class textbooks.</p>
          </div>

          <Card className="border-border shadow-2xl bg-card/50 backdrop-blur-sm overflow-hidden rounded-[2rem]">
            <div className="bg-primary h-1.5 w-full"></div>
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-2xl font-bold">Start New Session</CardTitle>
              <CardDescription>We&apos;ll analyze your resume to ground our questions.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-8">
              {/* Upload Area */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`group relative border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-500 ${
                  file ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-accent/50"
                }`}
              >
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept=".pdf,.docx" 
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <div className="flex flex-col items-center gap-6">
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-500 ${file ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/40 rotate-0" : "bg-accent text-muted-foreground group-hover:rotate-12 group-hover:scale-110"}`}>
                    <Upload size={32} />
                  </div>
                  {file ? (
                    <div className="space-y-2">
                      <p className="font-black text-xl text-primary">{file.name}</p>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">Click or drag to replace file</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="font-bold text-xl">Drop your resume here</p>
                      <p className="text-sm text-muted-foreground">Support for PDF and DOCX files</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Target Role</label>
                  <select 
                    value={role} 
                    onChange={(e) => setRole(e.target.value)}
                    className="flex h-14 w-full rounded-2xl border border-input bg-background/50 px-4 py-2 text-sm font-bold ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 appearance-none transition-all hover:bg-background"
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Experience (Years)</label>
                  <input 
                    type="number" 
                    value={experience} 
                    onChange={(e) => setExperience(e.target.value)}
                    min="0" max="20"
                    className="flex h-14 w-full rounded-2xl border border-input bg-background/50 px-4 py-2 text-sm font-bold ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all hover:bg-background"
                  />
                </div>
              </div>

              <Button 
                onClick={startInterview} 
                disabled={!file || loading}
                size="lg"
                className="w-full h-16 text-lg font-black rounded-2xl group shadow-xl shadow-primary/20 relative overflow-hidden"
              >
                {loading ? (
                  <span className="flex items-center gap-3">
                    <span className="w-5 h-5 border-4 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></span>
                    Initializing Engine...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Begin Technical Assessment
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
