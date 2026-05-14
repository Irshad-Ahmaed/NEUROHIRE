"use client";

import { useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import HeroSection from "./landing/HeroSection";
import FeaturesSection from "./landing/FeaturesSection";

export default function Landing() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/30 overflow-x-hidden font-sans">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-muted/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: "4s" }} />
      </div>

      <HeroSection 
        targetRef={targetRef}
        opacity={opacity}
        scale={scale}
      />

      <main className="flex-1">
        <FeaturesSection />
      </main>
    </div>
  );
}
