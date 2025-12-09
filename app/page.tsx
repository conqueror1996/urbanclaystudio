"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, Layers, Box } from "lucide-react";
import { useRef } from "react";
import Image from "next/image";

export default function Home() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  return (
    <main ref={containerRef} className="bg-[#050505] text-white selection:bg-urban-terracotta selection:text-white">

      {/* SECTION 1: HERO */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="h-screen sticky top-0 flex flex-col items-center justify-center overflow-hidden z-10"
      >
        <div className="z-20 text-center max-w-4xl space-y-6 px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="inline-block mb-4"
          >
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-urban-stone backdrop-blur-md">
              <Sparkles className="w-3 h-3 text-urban-terracotta" />
              <span>AI V1.0 Now Live</span>
            </div>
          </motion.div>

          <h1 className="text-6xl md:text-9xl font-display font-light tracking-tighter leading-[0.9]">
            UrbanClay
            <span className="font-serif italic text-urban-terracotta block md:inline md:ml-4">Studio</span>
          </h1>

          <p className="text-xl md:text-2xl font-light text-urban-stone/80 max-w-2xl mx-auto leading-relaxed">
            The intelligent material engine for modern architecture.
            <br className="hidden md:block" /> Curated, calibrated, and visualized by AI.
          </p>

          <div className="pt-8">
            <Link
              href="/onboarding"
              className="group relative inline-flex items-center gap-4 px-10 py-5 bg-white text-black rounded-full text-sm font-medium transition-all duration-500 hover:bg-urban-terracotta hover:text-white hover:scale-105 shadow-xl hover:shadow-urban-terracotta/20"
            >
              <span className="relative z-10 flex items-center gap-2 uppercase tracking-wide">
                Start Project
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </div>

        {/* Ambient Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-urban-terracotta/10 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[10s]" />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05] mix-blend-overlay" />
        </div>
      </motion.section>

      {/* SECTION 2: PHILOSOPHY (Scrolling Overlay) */}
      <section className="relative z-20 bg-[#0A0A0A] min-h-screen py-32 px-6 border-t border-white/5">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">

          <div className="space-y-12">
            <div className="space-y-4">
              <span className="text-urban-terracotta text-xs uppercase tracking-widest font-bold">The Philosophy</span>
              <h2 className="text-4xl md:text-6xl font-light font-display leading-tight">
                Materiality meets <br /> <span className="font-serif italic text-white/50">Machine Intelligence.</span>
              </h2>
              <p className="text-lg text-urban-stone/70 leading-relaxed max-w-md">
                We believe that material selection shouldn't be a generic catalog search. It should be a curated journey tailored to your architectural style, project constraints, and aesthetic vision.
              </p>
            </div>

            <div className="grid gap-8">
              <FeatureRow
                icon={Layers}
                title="Deep Catalog Indexing"
                desc="Our AI scans thousands of textures, understanding characteristics like porosity, finish, and thermal properties."
              />
              <FeatureRow
                icon={Box}
                title="Context Awareness"
                desc="Recommendations adapt to your project's location, climate data, and local vernacular."
              />
            </div>
          </div>

          <div className="relative aspect-[3/4] md:aspect-square bg-white/5 rounded-2xl overflow-hidden border border-white/5">
            {/* Abstract visual representation of AI scanning a brick */}
            <div className="absolute inset-0 bg-gradient-to-br from-urban-terracotta/20 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1/2 h-1/2 border border-white/20 rounded-lg backdrop-blur-sm flex items-center justify-center relative">
                <div className="absolute -inset-4 border border-dashed border-white/10 rounded-xl animate-[spin_10s_linear_infinite]" />
                <span className="font-mono text-xs text-urban-terracotta">ANALYZING TEXTURE</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 3: FOOTER */}
      <footer className="relative z-20 bg-black py-24 px-6 border-t border-white/10">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
          <div>
            <h3 className="text-2xl font-serif italic mb-2">UrbanClay Studio</h3>
            <p className="text-urban-stone text-sm max-w-xs">
              Redefining architectural supply chains through design-first technology.
            </p>
          </div>

          <div className="flex gap-8 text-sm text-urban-stone uppercase tracking-widest">
            <Link href="/discover" className="hover:text-white transition-colors">Discover</Link>
            <Link href="/moodboard" className="hover:text-white transition-colors">Moodboard</Link>
            <Link href="/sales" className="hover:text-white transition-colors">Partner Access</Link>
          </div>
        </div>
      </footer>

    </main>
  );
}

function FeatureRow({ icon: Icon, title, desc }: any) {
  return (
    <div className="flex gap-4 group">
      <div className="w-12 h-12 rounded-full bg-white/5 border border-white/5 flex items-center justify-center shrink-0 group-hover:bg-urban-terracotta/10 group-hover:border-urban-terracotta/20 transition-colors">
        <Icon className="w-5 h-5 text-white/70 group-hover:text-urban-terracotta transition-colors" />
      </div>
      <div>
        <h4 className="text-lg font-medium mb-1">{title}</h4>
        <p className="text-sm text-urban-stone/60 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}
