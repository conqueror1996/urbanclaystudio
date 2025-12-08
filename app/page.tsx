"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 overflow-hidden relative">
      <div className="z-10 text-center max-w-2xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-4">
            UrbanClay<span className="font-serif italic ml-2 text-urban-terracotta">Studio</span>
          </h1>
          <p className="text-xl md:text-2xl font-light text-urban-stone font-serif italic">
            Material Inspiration Engine
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="space-y-6"
        >
          <p className="text-sm uppercase tracking-widest text-urban-stone/80">
            Welcome to the future of material selection
          </p>

          <Link
            href="/onboarding"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-urban-charcoal text-urban-white dark:bg-urban-white dark:text-urban-charcoal rounded-full text-sm font-medium transition-all hover:scale-105 active:scale-95"
          >
            Start Personalization
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>

      {/* Decorative background element */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 dark:opacity-10 mix-blend-overlay">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-urban-terracotta to-urban-beige rounded-full blur-[120px]" />
      </div>
    </main>
  );
}
