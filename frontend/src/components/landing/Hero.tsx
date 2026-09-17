'use client';

import React from 'react';
import Link from 'next/link';
import {
  Server,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowUpRight,
  Activity,
} from 'lucide-react';

export function Hero() {
  return (
    <section id="overview" className="relative pt-12 sm:pt-16 md:pt-20 pb-16 sm:pb-20 overflow-visible">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Top Chip */}
        <div className="inline-flex items-center justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-800 bg-slate-900/60 text-emerald-400 text-xs font-semibold tracking-wider uppercase backdrop-blur-md shadow-[0_0_15px_rgba(74,222,128,0.12)]">
            <span>IT Governance • Risk • Compliance Platform</span>
          </div>
        </div>

        {/* Display Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-extrabold tracking-tight text-white leading-[1.1] max-w-4xl mx-auto">
          Manage IT Risk.
          <br />
          Strengthen Controls.{' '}
          <span className="text-[#4ADE80] drop-shadow-[0_0_25px_rgba(74,222,128,0.45)]">
            Track Compliance.
          </span>
        </h1>

        {/* Supporting Text */}
        <p className="mt-6 text-sm sm:text-base md:text-lg text-slate-400 max-w-3xl mx-auto font-normal leading-relaxed">
          GRCTrack is a portfolio-based IT Governance, Risk &amp; Compliance platform for managing assets, assessing risks, monitoring controls, tracking evidence and remediation, and evaluating compliance from a single workspace.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm sm:text-base shadow-[0_0_25px_rgba(74,222,128,0.4)] transition-all duration-200"
          >
            <span>Launch Live Dashboard</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/15 font-medium text-sm sm:text-base backdrop-blur-md transition-all duration-200"
          >
            <span>Explore Demo Roles</span>
          </Link>
        </div>

        {/* ======================================================== */}
        {/* Interactive GRC Executive Dashboard Preview Card         */}
        {/* ======================================================== */}
        <div className="mt-14 max-w-5xl mx-auto text-left">
          <div className="glass-card rounded-2xl border border-white/12 p-5 sm:p-7 shadow-2xl bg-[#080D18]/90 backdrop-blur-2xl relative overflow-hidden">
            {/* Top Shimmer */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Mock Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-6 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs font-mono text-slate-400 ml-2">Executive Dashboard Preview</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-mono font-semibold uppercase border border-emerald-500/30">
                  Simulation Active
                </span>
                <span className="text-xs text-slate-500 font-mono">Org: PT Nusantara Digital</span>
              </div>
            </div>

            {/* 4 Core Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
              {/* Stat 1 */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-medium uppercase tracking-wider">Total Assets</span>
                  <Server className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-white">12</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Application, DB, Cloud</div>
              </div>

              {/* Stat 2 */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-medium uppercase tracking-wider">Active Risks</span>
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-white">21</div>
                <div className="text-[10px] text-rose-400/80 mt-0.5">3 Critical • 7 High</div>
              </div>

              {/* Stat 3 */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-medium uppercase tracking-wider">Controls</span>
                  <ShieldCheck className="w-4 h-4 text-[#4ADE80]" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-white">16</div>
                <div className="text-[10px] text-emerald-400 mt-0.5">ISO 27001 &amp; NIST</div>
              </div>

              {/* Stat 4 */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-medium uppercase tracking-wider">Compliance</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400">82.5%</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Weighted Score</div>
              </div>
            </div>

            {/* Mini 5x5 Heatmap & Threat Distribution Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-2">
              <div className="md:col-span-7 p-3.5 rounded-xl bg-slate-950/70 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-200">5 × 5 Risk Heatmap Matrix</span>
                  <span className="text-[10px] text-slate-500 font-mono">Likelihood × Impact</span>
                </div>
                {/* 5x5 Visual grid */}
                <div className="grid grid-cols-5 gap-1.5 aspect-[5/2.5]">
                  {[
                    { color: '#EF4444', count: 2 }, { color: '#EF4444', count: 1 }, { color: '#F97316', count: 0 }, { color: '#F97316', count: 0 }, { color: '#EF4444', count: 0 },
                    { color: '#F97316', count: 1 }, { color: '#EF4444', count: 1 }, { color: '#F97316', count: 2 }, { color: '#EF4444', count: 0 }, { color: '#EF4444', count: 0 },
                    { color: '#FBBF24', count: 0 }, { color: '#F97316', count: 1 }, { color: '#F97316', count: 2 }, { color: '#F97316', count: 1 }, { color: '#EF4444', count: 0 },
                    { color: '#10B981', count: 1 }, { color: '#FBBF24', count: 2 }, { color: '#FBBF24', count: 1 }, { color: '#F97316', count: 0 }, { color: '#F97316', count: 1 },
                    { color: '#10B981', count: 2 }, { color: '#10B981', count: 1 }, { color: '#FBBF24', count: 1 }, { color: '#FBBF24', count: 1 }, { color: '#F97316', count: 1 },
                  ].map((cell, idx) => (
                    <div
                      key={idx}
                      className="rounded-md flex items-center justify-center text-[10px] font-mono font-bold transition-all border border-white/10"
                      style={{
                        backgroundColor: `${cell.color}20`,
                        color: cell.color,
                      }}
                    >
                      {cell.count > 0 ? cell.count : '·'}
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-5 space-y-3 p-3.5 rounded-xl bg-slate-950/70 border border-white/10">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <Activity className="w-3.5 h-3.5 text-[#4ADE80]" />
                  <span>Audit Trail Stream</span>
                </div>
                <div className="space-y-2 text-[11px] text-slate-400">
                  <div className="flex items-center justify-between py-1 border-b border-white/5">
                    <span className="text-slate-200">ISO 27001 Access Control evaluated</span>
                    <span className="text-emerald-400 font-mono">Compliant</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-white/5">
                    <span className="text-slate-200">Remediation action overdue detected</span>
                    <span className="text-rose-400 font-mono">Overdue</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-200">Executive PDF report generated</span>
                    <span className="text-cyan-400 font-mono">Archived</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Disclaimer Caption */}
            <p className="mt-4 text-center text-[11px] font-mono text-slate-500">
              Synthetic Simulation Data — Organization: PT Nusantara Digital
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
