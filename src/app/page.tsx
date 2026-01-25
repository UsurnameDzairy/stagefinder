"use client";

import { ArrowRight } from "lucide-react";
import { useState, Suspense, lazy } from "react";
import Link from "next/link";
import VerticalBarsNoise from "@/components/ui/vertical-bars-noise";
import Navbar from "@/components/ui/navbar";
import { useSession } from "@/lib/auth-client";

const Dithering = lazy(() => 
  import("@paper-design/shaders-react").then((mod) => ({ default: mod.Dithering }))
);

export default function LandingPage() {
  const [isHovered, setIsHovered] = useState(false);
  const { data: session } = useSession();

  return (
    <main className="min-h-screen text-white font-sans selection:bg-white/10 selection:text-white relative">
      <VerticalBarsNoise 
        backgroundColor="#000000"
        lineColor="#151515"
        barColor="#ffffff"
        animationSpeed={0.0003}
      />
      
      <Navbar user={session?.user} />

      <section id="features" className="min-h-screen w-full flex flex-col justify-center items-center px-4 md:px-6 relative pt-16 overflow-hidden">
        <div 
          className="w-full max-w-7xl relative group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Card Container */}
          <div className="relative overflow-hidden rounded-[48px] border border-zinc-900 bg-zinc-950/50 backdrop-blur-3xl shadow-2xl min-h-[700px] flex flex-col items-center justify-center transition-all duration-700 hover:border-zinc-700">
            
            {/* Shaders Layer */}
            <Suspense fallback={<div className="absolute inset-0 bg-zinc-900/20" />}>
              <div className="absolute inset-0 z-0 pointer-events-none opacity-20 mix-blend-screen grayscale contrast-125">
                <Dithering
                  colorBack="#00000000"
                  colorFront="#ffffff"
                  shape="warp"
                  type="4x4"
                  speed={isHovered ? 0.4 : 0.15}
                  className="size-full"
                  minPixelRatio={1}
                />
              </div>
            </Suspense>

            {/* Content Container */}
            <div className="relative z-10 px-6 max-w-5xl mx-auto text-center flex flex-col items-center">
              
              {/* Badge IA */}
              <div className="mb-10 inline-flex items-center gap-3 rounded-full border border-white/5 bg-white/[0.02] px-5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                </span>
                AI-Powered Internship Search
              </div>

              {/* Headline - Polices Serif Premium */}
              <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl font-normal tracking-tight text-white mb-10 leading-[0.95] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                Your career, <br />
                <span className="text-zinc-600 italic">orchestrated perfectly.</span>
              </h1>
              
              {/* Description */}
              <p className="text-zinc-500 text-lg md:text-xl max-w-2xl mb-14 leading-relaxed font-medium tracking-tight animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
                Join thousands of students using the first AI that captures the nuance of your potential.
                Strategic, precise, and uniquely yours.
              </p>

              {/* Button Action */}
              <Link href={session?.user ? "/dashboard" : "/pricing"} className="group relative">
                <div className="absolute -inset-4 bg-white/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <button className="relative inline-flex h-16 items-center justify-center gap-4 overflow-hidden rounded-full bg-black text-white px-14 text-sm font-serif italic tracking-tight transition-all duration-500 hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.1)] border border-zinc-800">
                  <span>{session?.user ? "Go to Dashboard" : "Get Started"}</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-2" />
                </button>
              </Link>
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-12 w-full px-12 flex justify-between items-center opacity-40 hover:opacity-100 transition-opacity duration-500">
              <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                Strategic Recruitment AI
              </div>
              <div className="flex gap-6 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                <span>01 Search</span>
                <span>02 Optimize</span>
                <span>03 Success</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Background Elements */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-zinc-900/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-zinc-800/10 rounded-full blur-[150px] pointer-events-none" />
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 border-t border-zinc-900 bg-black">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-6xl mb-4 text-white">
              Pricing <span className="text-zinc-500 italic">Plans</span>
            </h2>
            <p className="text-zinc-500 max-w-2xl mx-auto text-lg">Choose the strategy that fits your career goals.</p>
          </div>
          
          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Student Plan */}
            <div className="rounded-2xl p-8 border border-zinc-800 bg-black/50 backdrop-blur-sm hover:border-zinc-700 transition-all">
              <h3 className="text-xl font-semibold text-white mb-2">Student</h3>
              <p className="text-sm text-zinc-500 mb-6">Pour les étudiants qui démarrent</p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-white">$10</span>
                <span className="text-zinc-500 text-sm ml-2">/ mois</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm text-zinc-400">
                <li className="flex items-start gap-2">
                  <span className="text-white mt-0.5">✓</span>
                  <span>10 requêtes IA par jour</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white mt-0.5">✓</span>
                  <span>70 requêtes IA par semaine</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white mt-0.5">✓</span>
                  <span>Accès aux offres de stages</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white mt-0.5">✓</span>
                  <span>Analyse de CV basique</span>
                </li>
              </ul>
              <Link href="/pricing" className="block">
                <button className="w-full py-3 rounded-full border border-zinc-700 text-white hover:bg-zinc-800 transition-all font-medium">
                  Commencer
                </button>
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="rounded-2xl p-8 border-2 border-white bg-zinc-900/80 backdrop-blur-sm relative transform md:-translate-y-4">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white px-4 py-1.5 rounded-full">
                <span className="text-black text-sm font-semibold">Populaire</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Pro</h3>
              <p className="text-sm text-zinc-500 mb-6">Pour les chercheurs actifs</p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-white">$23</span>
                <span className="text-zinc-500 text-sm ml-2">/ mois</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm text-zinc-400">
                <li className="flex items-start gap-2">
                  <span className="text-white mt-0.5">✓</span>
                  <span>50 requêtes IA par jour</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white mt-0.5">✓</span>
                  <span>350 requêtes IA par semaine</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white mt-0.5">✓</span>
                  <span>Accès illimité aux offres</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white mt-0.5">✓</span>
                  <span>Analyse CV avancée par IA</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white mt-0.5">✓</span>
                  <span>Génération lettres de motivation</span>
                </li>
              </ul>
              <Link href="/pricing" className="block">
                <button className="w-full py-3 rounded-full bg-white text-black hover:bg-zinc-200 transition-all font-medium">
                  Essayer gratuitement
                </button>
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="rounded-2xl p-8 border border-zinc-800 bg-black/50 backdrop-blur-sm hover:border-zinc-700 transition-all">
              <h3 className="text-xl font-semibold text-white mb-2">Enterprise</h3>
              <p className="text-sm text-zinc-500 mb-6">Pour les professionnels exigeants</p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-white">$50</span>
                <span className="text-zinc-500 text-sm ml-2">/ mois</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm text-zinc-400">
                <li className="flex items-start gap-2">
                  <span className="text-white mt-0.5">✓</span>
                  <span>Requêtes IA illimitées</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white mt-0.5">✓</span>
                  <span>Accès API complet</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white mt-0.5">✓</span>
                  <span>Analyse CV premium + coaching</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white mt-0.5">✓</span>
                  <span>Account manager dédié</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white mt-0.5">✓</span>
                  <span>Support 24/7</span>
                </li>
              </ul>
              <Link href="/pricing" className="block">
                <button className="w-full py-3 rounded-full border border-zinc-700 text-white hover:bg-zinc-800 transition-all font-medium">
                  Contacter les ventes
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Section (Placeholder) */}
      <section id="about" className="py-24 border-t border-zinc-900 bg-zinc-950/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
          <h2 className="font-serif text-4xl md:text-6xl mb-8">Our Mission</h2>
          <p className="text-zinc-500 max-w-2xl mx-auto">Empowering the next generation through intelligent orchestration.</p>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="py-24 border-t border-zinc-900 flex flex-col items-center">
        <div className="text-[11px] font-bold uppercase tracking-[0.4em] text-zinc-700 mb-8">
          Built for the next generation of founders
        </div>
        <div className="flex gap-12 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Github</a>
        </div>
      </footer>
    </main>
  );
}

