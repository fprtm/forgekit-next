import React from "react";
import Link from "next/link";
import { ArrowRight, Layers, ShieldCheck, Database, Zap, BookOpen, Terminal, Sparkles, Code2, Globe } from "lucide-react";
import { siteConfig } from "@/shared/config/site";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030303] font-sans text-zinc-100 select-none selection:bg-indigo-500/30 selection:text-white">
      {/* Dynamic Background Radial & Mesh Glows */}
      <div className="absolute top-[-20%] left-[-10%] h-[60rem] w-[60rem] rounded-full bg-gradient-to-tr from-indigo-600/10 to-violet-600/10 blur-[140px] pointer-events-none animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[55rem] w-[55rem] rounded-full bg-gradient-to-br from-emerald-600/5 to-teal-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-[30%] left-[25%] h-[30rem] w-[30rem] rounded-full bg-pink-500/5 blur-[120px] pointer-events-none" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.25]" />

      {/* Header / Top Navigation */}
      <header className="relative z-50 border-b border-zinc-900/60 bg-[#030303]/70 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4 sm:px-8">
          <div className="flex items-center gap-3 group">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-white via-zinc-200 to-zinc-400 text-black font-black text-xl shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(99,102,241,0.5)]">
              {siteConfig.shortName || siteConfig.name.charAt(0)}
            </span>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                {siteConfig.name}
              </span>
              <span className="text-[10px] text-indigo-400 font-mono tracking-widest uppercase">v1.2.0</span>
            </div>
          </div>

          <nav className="flex items-center gap-5">
            <Link
              href="/login"
              className="rounded-full px-5 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-all hover:bg-zinc-900/40"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="group relative flex items-center gap-1.5 overflow-hidden rounded-full p-[1px] text-sm font-semibold transition-transform active:scale-95"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 animate-gradient" />
              <div className="relative flex items-center gap-1.5 rounded-full bg-zinc-950 px-5 py-2 transition-colors group-hover:bg-zinc-900/90 text-white">
                Go to Dashboard
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 pt-24 pb-32 sm:px-8 text-center flex flex-col items-center">
        {/* DDD Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800/80 bg-zinc-950/80 px-4 py-2 text-xs font-medium text-zinc-300 backdrop-blur-md mb-8 shadow-inner shadow-white/5 animate-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono text-zinc-400 text-[11px]">Domain-Driven Design (DDD) Next.js Boilerplate</span>
        </div>

        {/* Hero Headline */}
        <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight sm:text-7xl leading-[1.08] mb-6">
          Architectural Perfection for{" "}
          <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Infinite
          </span>{" "}
          <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 font-black">
            Scalability
          </span>
        </h1>

        {/* Hero Subheadline */}
        <p className="max-w-2xl text-lg sm:text-xl text-zinc-400 font-light leading-relaxed mb-12">
          {siteConfig.description} Engineered with a highly decoupled 4-layer architecture, type-safe database adapters, and interactive seeding engine.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 mb-28">
          <Link
            href="/login"
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-white px-8 text-base font-semibold text-black transition-all duration-300 hover:bg-zinc-200 hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:scale-[1.02] active:scale-95"
          >
            Explore Dashboard <ArrowRight className="h-5 w-5" />
          </Link>
          <a
            href={siteConfig.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex h-12 items-center justify-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/40 px-8 text-base font-semibold text-zinc-300 backdrop-blur-md transition-all duration-300 hover:bg-zinc-900/60 hover:text-white hover:border-zinc-700 active:scale-95"
          >
            Get Started <BookOpen className="h-5 w-5 transition-transform group-hover:scale-105" />
          </a>
        </div>

        {/* Dashboard Preview Glassmorphism */}
        <div className="w-full max-w-5xl rounded-2xl border border-zinc-800/80 bg-zinc-950/40 p-2 sm:p-3 backdrop-blur-xl shadow-2xl shadow-indigo-500/5 mb-32 relative group">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          <div className="rounded-xl border border-zinc-900/50 bg-[#070707] overflow-hidden">
            {/* Top Bar Window control */}
            <div className="flex items-center justify-between border-b border-zinc-900 px-4 py-3 bg-[#0a0a0a]">
              <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-zinc-800" />
                <span className="w-3 h-3 rounded-full bg-zinc-800" />
                <span className="w-3 h-3 rounded-full bg-zinc-800" />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono bg-zinc-950/60 px-3 py-1 rounded-md border border-zinc-900/80">
                <Terminal className="h-3 w-3 text-indigo-400" />
                <span>localhost:3000/dashboard</span>
              </div>
              <div className="w-12" />
            </div>

            {/* Simulated UI Area */}
            <div className="p-8 text-left grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
              <div className="p-5 rounded-lg border border-zinc-900 bg-zinc-950/30">
                <div className="text-zinc-500 mb-2">{'// 4-LAYER CLEAN TAXONOMY'}</div>
                <div className="text-indigo-400 font-bold mb-4">Domain Logic Core</div>
                <div className="text-zinc-400 font-light leading-relaxed">
                  Pure entities decoupled from Next.js, database ORMs, or validation libraries. Completely unit-testable.
                </div>
              </div>
              <div className="p-5 rounded-lg border border-zinc-900 bg-zinc-950/30">
                <div className="text-zinc-500 mb-2">{'// DYNAMIC SEEDER ENGINE'}</div>
                <div className="text-purple-400 font-bold mb-4">Modular Seeding</div>
                <div className="text-zinc-400 font-light leading-relaxed">
                  Decoupled <code className="text-purple-300">seeder.ts</code> per module, dynamically auto-detected and run with full type-safety.
                </div>
              </div>
              <div className="p-5 rounded-lg border border-zinc-900 bg-zinc-950/30">
                <div className="text-zinc-500 mb-2">{'// SECURITY ENFORCED'}</div>
                <div className="text-emerald-400 font-bold mb-4">Adaptive Credentials</div>
                <div className="text-zinc-400 font-light leading-relaxed">
                  Generic OAuth flags combined with strict role guards at the use-case layer to block privilege leaks.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl text-left">
          {/* Card 1: DDD Architecture */}
          <div className="group relative rounded-2xl border border-zinc-900 bg-zinc-950/20 p-7 backdrop-blur-md transition-all duration-300 hover:border-zinc-800/80 hover:bg-zinc-900/10 hover:-translate-y-1 shadow-lg">
            <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-300 transition-all duration-300 group-hover:bg-white group-hover:text-black group-hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">4-Layer DDD</h3>
            <p className="text-sm leading-relaxed text-zinc-400 font-light">
              Clean boundaries across Domain, Application, Infrastructure, and Presentation layers for a future-proof workspace.
            </p>
          </div>

          {/* Card 2: Dynamic Seeder */}
          <div className="group relative rounded-2xl border border-zinc-900 bg-zinc-950/20 p-7 backdrop-blur-md transition-all duration-300 hover:border-zinc-800/80 hover:bg-zinc-900/10 hover:-translate-y-1 shadow-lg">
            <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-300 transition-all duration-300 group-hover:bg-white group-hover:text-black group-hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">Dynamic Seeder</h3>
            <p className="text-sm leading-relaxed text-zinc-400 font-light">
              Elegant and decoupled seeding mechanism scanning active modules dynamically and executing seeds securely.
            </p>
          </div>

          {/* Card 3: NextAuth Authentication */}
          <div className="group relative rounded-2xl border border-zinc-900 bg-zinc-950/20 p-7 backdrop-blur-md transition-all duration-300 hover:border-zinc-800/80 hover:bg-zinc-900/10 hover:-translate-y-1 shadow-lg">
            <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-300 transition-all duration-300 group-hover:bg-white group-hover:text-black group-hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">Adaptive Auth</h3>
            <p className="text-sm leading-relaxed text-zinc-400 font-light">
              Flexible NextAuth v5 configuration supporting dynamically toggled Google OAuth & Credential providers via environments.
            </p>
          </div>

          {/* Card 4: High-Performance */}
          <div className="group relative rounded-2xl border border-zinc-900 bg-zinc-950/20 p-7 backdrop-blur-md transition-all duration-300 hover:border-zinc-800/80 hover:bg-zinc-900/10 hover:-translate-y-1 shadow-lg">
            <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-300 transition-all duration-300 group-hover:bg-white group-hover:text-black group-hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">Bun & Playwright</h3>
            <p className="text-sm leading-relaxed text-zinc-400 font-light">
              High-speed runtime capabilities driven by Bun alongside a robust, fully-orchestrated browser automated testing suite.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-900 bg-[#030303]/60 py-10 backdrop-blur-md text-center text-xs text-zinc-500">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-zinc-800 text-white font-black text-xs">
              {siteConfig.shortName}
            </span>
            <p>© 2026 {siteConfig.author}. Engineered with high precision.</p>
          </div>
          <div className="flex gap-6">
            <a href={siteConfig.links.github} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
            <Link href="/login" className="hover:text-white transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
