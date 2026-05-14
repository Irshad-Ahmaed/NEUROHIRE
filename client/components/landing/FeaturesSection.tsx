"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  BarChart3,
  ShieldCheck,
  Zap,
  Search,
  BrainCircuit,
  Database,
  Cpu,
  Globe,
} from "lucide-react";

export default function FeaturesSection() {
  return (
    <>
      {/* Feature Section */}
      <section id="features" className="py-40 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                <p className="text-xs font-black uppercase tracking-[0.4em] text-primary">The Technology</p>
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.95] text-foreground">
                  Engineered for <br /> Theoretical <span className="text-muted-foreground">Depth</span>.
                </h2>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-xl text-muted-foreground leading-relaxed max-w-lg font-medium"
              >
                Most platforms focus on API knowledge. We go deeper, retrieving context from the fundamental textbooks of AI and Machine Learning.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex flex-col gap-6"
              >
                {[
                  { icon: Database, text: "Role-specific RAG knowledge base integration" },
                  { icon: BrainCircuit, text: "Adaptive difficulty scaling based on performance" },
                  { icon: Search, text: "Full traceability with integrated source lookup" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="w-12 h-12 bg-card border border-border rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                      <item.icon size={24} />
                    </div>
                    <span className="text-foreground/80 font-bold tracking-tight">{item.text}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            <div className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative aspect-square bg-card border border-border rounded-[3rem] overflow-hidden group shadow-2xl"
              >
                {/* Neural Grid Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:20px_20px] opacity-30" />

                {/* Orbiting Elements */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute w-1/2 h-1/2 border border-primary/20 rounded-full"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute w-3/4 h-3/4 border border-primary/10 border-dashed rounded-full"
                  />
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.5, 0.8, 0.5]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="w-1/3 h-1/3 bg-primary/20 rounded-full blur-[60px]"
                  />
                  <motion.div
                    animate={{
                      rotate: 360,
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute w-full h-full"
                  >
                    <div className="absolute top-[12%] left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
                    <div className="absolute bottom-[12%] left-1/2 -translate-x-1/2 w-3 h-3 bg-primary/50 rounded-full" />
                  </motion.div>
                  <motion.div
                    animate={{
                      top: ["0%", "100%", "0%"]
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 z-20"
                  />
                  <div className="relative z-10 flex flex-col items-center gap-4">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="p-6 bg-background border border-border rounded-3xl shadow-xl"
                    >
                      <Cpu className="text-primary size-12" />
                    </motion.div>
                    <div className="flex gap-3">
                      <motion.div
                        animate={{ x: [-5, 5, -5] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="p-3 bg-background border border-border rounded-xl"
                      >
                        <Database className="text-primary size-6 opacity-50" />
                      </motion.div>
                      <motion.div
                        animate={{ x: [5, -5, 5] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="p-3 bg-background border border-border rounded-xl"
                      >
                        <BrainCircuit className="text-primary size-6 opacity-50" />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="how-it-works" className="py-32 bg-accent/10 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-24">
            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-[0.4em] text-primary">The Workflow</p>
              <h2 className="text-5xl font-black tracking-tighter text-foreground">Three Steps to <br /> Perfection.</h2>
            </div>
            <p className="text-muted-foreground max-w-sm font-medium">A streamlined process designed for both candidates and hiring managers.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Ingestion", desc: "Upload your resume and select your target role to prime our RAG engine." },
              { step: "02", title: "Assessment", desc: "Engage in an 8-turn adaptive interview session grounded in core theory." },
              { step: "03", title: "Analysis", desc: "Receive a comprehensive report with objective scoring and growth paths." }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                viewport={{ once: true }}
                className="bg-card border border-border p-12 rounded-[2.5rem] relative group overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 text-6xl font-black text-foreground/5 group-hover:text-primary/10 transition-colors">
                  {item.step}
                </div>
                <h3 className="text-2xl font-black mb-4 text-foreground">{item.title}</h3>
                <p className="text-muted-foreground font-medium leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Grid Section */}
      <section className="py-20 bg-card/50 border-y border-border">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1">
          {[
            { title: "Dynamic RAG", icon: Globe, desc: "Real-time context retrieval from authoritative sources." },
            { title: "Smart Sessions", icon: Zap, desc: "Stateful interview rounds that maintain context across turns." },
            { title: "Objective Analytics", icon: BarChart3, desc: "Data-driven grading that removes interviewer bias." },
            { title: "Verified Theory", icon: ShieldCheck, desc: "Questions grounded in Mitchell, Burkov, and Bishop." }
          ].map((card, i) => (
            <div key={i} className="p-10 bg-background hover:bg-accent transition-all duration-500 group border border-transparent hover:border-border">
              <div className="w-12 h-12 text-primary mb-6 group-hover:scale-110 transition-transform duration-500">
                <card.icon size={32} />
              </div>
              <h3 className="text-xl font-black mb-4 text-foreground uppercase tracking-tighter">{card.title}</h3>
              <p className="text-muted-foreground font-medium text-sm leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto bg-primary rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden shadow-3xl shadow-primary/20"
        >
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none" />
          <div className="relative z-10 space-y-10">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none text-primary-foreground">
              Ready to find the <br /> top 1%?
            </h2>
            <p className="text-primary-foreground/80 text-lg md:text-xl max-w-xl mx-auto font-medium opacity-80 leading-relaxed">
              Join modern engineering teams using NeuroHire to automate deep technical screening with zero compromise on quality.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 h-16 px-12 text-lg font-black rounded-full transition-all active:scale-95 shadow-xl">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10 h-16 px-8 text-lg font-black rounded-full">
                  Talk to Sales
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer Section */}
      <footer className="py-20 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
              <Cpu size={18} />
            </div>
            <span className="font-black tracking-tighter text-lg uppercase text-foreground">NEUROHIRE</span>
          </div>

          <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <a href="https://github.com/Irshad-Ahmaed/NEUROHIRE" target="_blank" className="hover:text-foreground transition-colors">GitHub</a>
            <a href="https://www.linkedin.com/in/irshad-profile" target="_blank" className="hover:text-foreground transition-colors">LinkedIn</a>
          </div>

          <p className="text-xs text-muted-foreground font-bold">
            © 2026 NEUROHIRE. ALL RIGHTS RESERVED.
          </p>
        </div>
      </footer>
    </>
  );
}
