"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Cpu, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData();
    form.append("email", email);
    form.append("password", password);

    try {
      await login(form);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-background p-6 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[440px] z-10"
      >
        <div className="mb-8 flex flex-col items-center text-center gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-xl shadow-primary/10 group-hover:scale-110 transition-transform">
              <Cpu size={28} />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase">NEUROHIRE</span>
          </Link>
        </div>

        <Card className="border-border bg-card/50 backdrop-blur-xl shadow-2xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="pt-10 px-10 pb-6 text-center space-y-2">
            <CardTitle className="text-3xl font-black tracking-tight">Welcome Back</CardTitle>
            <CardDescription className="text-muted-foreground font-medium">
              Access your technical assessment portal
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="px-10 space-y-6">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive font-bold text-center"
                >
                  {error}
                </motion.div>
              )}
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex h-14 w-full rounded-2xl border border-input bg-background/50 px-5 py-2 text-base font-medium ring-offset-background placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground" htmlFor="password">
                    Password
                  </label>
                  <Link href="#" className="text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors">
                    Forgot?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex h-14 w-full rounded-2xl border border-input bg-background/50 px-5 py-2 text-base font-medium ring-offset-background placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                />
              </div>
            </CardContent>
            <CardFooter className="px-10 pb-10 pt-6 flex flex-col space-y-6">
              <Button className="w-full font-black h-16 rounded-2xl text-lg shadow-xl shadow-primary/10 active:scale-[0.98] transition-all" disabled={loading}>
                {loading ? "AUTHENTICATING..." : "SIGN IN"}
              </Button>
              <p className="text-center text-sm font-medium text-muted-foreground">
                New candidate?{" "}
                <Link href="/signup" className="text-primary hover:text-primary/80 font-black transition-colors">
                  Create an account
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        <Link href="/" className="mt-8 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors group">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to home
        </Link>
      </motion.div>
    </div>
  );
}
