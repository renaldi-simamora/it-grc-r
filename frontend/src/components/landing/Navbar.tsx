'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Menu, X, ArrowRight } from 'lucide-react';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#04070B]/85 border-b border-white/[0.08] transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
        
        {/* Left: Brand Identity with PORTFOLIO badge */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(74,222,128,0.25)] group-hover:border-emerald-500/70 transition-colors">
            <ShieldCheck className="w-5 h-5 text-[#4ADE80]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-tight text-white">GRCTrack</span>
            <span className="text-[10px] font-mono font-semibold text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700 tracking-wider">
              PORTFOLIO
            </span>
          </div>
        </Link>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#overview" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Overview
          </Link>
          <Link href="#workflow" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            GRC Workflow
          </Link>
          <Link href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Features
          </Link>
          <Link href="#risk-matrix" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Risk Matrix
          </Link>
          <Link href="#compliance" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Compliance
          </Link>
        </nav>

        {/* Right: Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs sm:text-sm font-medium text-slate-300 hover:text-white px-3.5 py-2 rounded-xl transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs sm:text-sm shadow-[0_0_20px_rgba(74,222,128,0.35)] transition-all duration-200 cursor-pointer"
          >
            <span>Open Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-6 bg-[#060A12]/95 border-b border-white/10 backdrop-blur-2xl space-y-3">
          <Link
            href="#overview"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm text-white font-medium hover:bg-white/5 rounded-lg"
          >
            Overview
          </Link>
          <Link
            href="#workflow"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg"
          >
            GRC Workflow
          </Link>
          <Link
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg"
          >
            Features
          </Link>
          <Link
            href="#risk-matrix"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg"
          >
            Risk Matrix
          </Link>
          <Link
            href="#compliance"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg"
          >
            Compliance
          </Link>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center px-4 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white text-xs font-semibold"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center px-4 py-2.5 rounded-xl bg-emerald-500 text-black text-xs font-semibold"
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
