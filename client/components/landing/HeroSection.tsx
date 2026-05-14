"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, MotionValue } from "framer-motion";
import { Cpu, Sparkles, ArrowRight } from "lucide-react";
import { RefObject } from "react";

interface HeroSectionProps {
  targetRef: RefObject<HTMLDivElement | null>;
  opacity: MotionValue<number>;
  scale: MotionValue<number>;
}

export default function HeroSection({ targetRef, opacity, scale }: HeroSectionProps) {
  return (
    <>
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3 bg-card/50 backdrop-blur-md border border-border rounded-full shadow-2xl">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              <Cpu size={22} />
            </div>
            <span className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
              NEUROHIRE
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors relative group">
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors relative group">
              The Engine
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </a>
            <a href="#about" className="hover:text-foreground transition-colors relative group">
              About
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block">
              <Button variant="ghost" className="font-bold text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
                Portal
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-black text-xs uppercase tracking-widest px-6 h-10 rounded-full transition-all active:scale-95 shadow-lg shadow-primary/10">
                Join Now
              </Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section ref={targetRef} className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-6">
        <motion.div 
          style={{ opacity, scale }}
          className="text-center space-y-12 max-w-5xl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/10 rounded-full text-[10px] font-black tracking-[0.3em] text-primary uppercase backdrop-blur-sm"
          >
            <Sparkles size={12} className="animate-pulse" />
            <span>The Future of Technical Assessment</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="text-7xl md:text-[120px] font-black tracking-tighter leading-[0.85] text-foreground"
          >
            Beyond the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-primary via-primary/80 to-muted-foreground">
              Surface Level.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed font-medium"
          >
            NeuroHire utilizes advanced RAG architecture to simulate high-stakes technical rounds grounded in deep academic theory. Stop testing syntax, start testing <span className="text-primary font-bold">intelligence</span>.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4"
          >
            <Link href="/signup">
              <Button 
                size="lg" 
                aria-label="Start assessment"
                className="h-16 px-10 text-lg font-black rounded-full bg-primary text-primary-foreground hover:bg-primary/90 group shadow-[0_20px_50px_-10px_rgba(255,255,255,0.1)] relative overflow-hidden transition-all duration-300"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Begin Assessment
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>
            <Link href="/login">
              <Button 
                size="lg" 
                variant="outline" 
                aria-label="View demo"
                className="h-16 px-10 text-lg font-black rounded-full border-border bg-card/50 hover:bg-accent backdrop-blur-md transition-all"
              >
                View Logic Panel
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Floating Elements (Abstract Visuals) */}
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
          <motion.div
            animate={{ 
              y: [0, -30, 0],
              rotate: [0, 10, 0]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[20%] left-[15%] w-32 h-32 bg-primary/5 border border-border backdrop-blur-md rounded-3xl rotate-12"
          />
          <motion.div
            animate={{ 
              y: [0, 40, 0],
              rotate: [0, -15, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[25%] right-[20%] w-48 h-48 bg-muted/10 border border-border backdrop-blur-md rounded-full -rotate-12"
          />
        </div>
      </section>
    </>
  );
}
