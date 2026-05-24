import React from "react";
import Link from "next/link";
import { ArrowRight, Layers, ShieldCheck, Database, Zap, BookOpen } from "lucide-react";
import { siteConfig } from "@/config/site";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black font-sans text-white select-none">
      {/* Background Mesh Glows */}
      <div className="absolute top-[-10%] left-[-10%] h-[50rem] w-[50rem] rounded-full bg-indigo-900/20 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[50rem] w-[50rem] rounded-full bg-violet-900/20 blur-[150px] pointer-events-none" />
      
      {/* Header / Top Navigation */}
      <header className="relative z-10 mx-auto max-w-7xl flex items-center justify-between px-6 py-6 sm:px-8 border-b border-zinc-900">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-transform hover:scale-105">
            {siteConfig.shortName || siteConfig.name.charAt(0)}
          </span>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            {siteConfig.name}
          </span>
        </div>
        <nav className="flex items-center gap-4">
          <Link
            href="/login"
            className="rounded-full px-5 py-2 text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-1.5 rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition-all hover:bg-zinc-200 hover:shadow-[0_0_25px_rgba(255,255,255,0.25)] hover:scale-[1.02] active:scale-[0.98]"
          >
            Go to Dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 pt-20 pb-32 sm:px-8 text-center flex flex-col items-center">
        {/* DDD Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/80 px-4 py-1.5 text-xs font-semibold text-zinc-400 backdrop-blur-md mb-8">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Domain-Driven Design (DDD) Next.js Boilerplate
        </div>

        {/* Hero Headline */}
        <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight sm:text-7xl leading-[1.1] mb-6">
          Enterprise-Grade Core for{" "}
          <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
            Infinite Scalability
          </span>
        </h1>

        {/* Hero Subheadline */}
        <p className="max-w-2xl text-lg sm:text-xl text-zinc-400 leading-8 mb-10">
          {siteConfig.description}
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 mb-24">
          <Link
            href="/login"
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-white px-8 text-base font-semibold text-black transition-all hover:bg-zinc-200 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-[1.02]"
          >
            Explore Dashboard <ArrowRight className="h-5 w-5" />
          </Link>
          <a
            href={siteConfig.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 items-center justify-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/40 px-8 text-base font-semibold text-zinc-300 backdrop-blur-md transition-all hover:bg-zinc-900/60 hover:text-white hover:border-zinc-700"
          >
            Get Started <BookOpen className="h-5 w-5" />
          </a>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl text-left">
          {/* Card 1: DDD Architecture */}
          <div className="group relative rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 backdrop-blur-md transition-all duration-300 hover:border-zinc-800 hover:bg-zinc-900/20">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white transition-colors group-hover:bg-white group-hover:text-black">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">4-Layer DDD</h3>
            <p className="text-sm leading-6 text-zinc-400">
              Clean separation between Domain, Application, Infrastructure, and Presentation layers for highly decoupled modules.
            </p>
          </div>

          {/* Card 2: Dynamic Seeder */}
          <div className="group relative rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 backdrop-blur-md transition-all duration-300 hover:border-zinc-800 hover:bg-zinc-900/20">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white transition-colors group-hover:bg-white group-hover:text-black">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Dynamic Seeder</h3>
            <p className="text-sm leading-6 text-zinc-400">
              An elegant dynamic seeder engine that scans modules dynamically and runs database seeding with 100% type-safety.
            </p>
          </div>

          {/* Card 3: NextAuth Authentication */}
          <div className="group relative rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 backdrop-blur-md transition-all duration-300 hover:border-zinc-800 hover:bg-zinc-900/20">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white transition-colors group-hover:bg-white group-hover:text-black">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Adaptive Auth</h3>
            <p className="text-sm leading-6 text-zinc-400">
              NextAuth v5 powered with Credentials & Google integration, controlled globally via generic toggle environment flags.
            </p>
          </div>

          {/* Card 4: High-Performance */}
          <div className="group relative rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 backdrop-blur-md transition-all duration-300 hover:border-zinc-800 hover:bg-zinc-900/20">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white transition-colors group-hover:bg-white group-hover:text-black">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Bun & Playwright</h3>
            <p className="text-sm leading-6 text-zinc-400">
              Ultra-fast workspace tooling powered by Bun runtime, along with an orchestrated Playwright E2E browser testing suite.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-900 bg-black/60 py-8 backdrop-blur-md text-center text-xs text-zinc-600">
        <p>© 2026 {siteConfig.author}. All rights reserved. Crafted with precision for high scalability.</p>
      </footer>
    </div>
  );
}
