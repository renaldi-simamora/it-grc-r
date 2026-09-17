'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/[0.08] bg-[#03060B] pt-14 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* ======================================================== */}
        {/* MANDATORY PORTFOLIO DISCLAIMER BOX (Wajib Tampil Jelas)  */}
        {/* ======================================================== */}
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200/90 text-xs leading-relaxed space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Portfolio Simulation &amp; Academic Notice</span>
          </div>
          <p>
            <strong>PORTFOLIO SIMULATION:</strong> GRCTrack is a personal portfolio project designed to demonstrate an IT Governance, Risk &amp; Compliance workflow. All organizations (PT Nusantara Digital), assets, risks, controls, evidence, findings, assessments, and reports are fictional and use synthetic data. This project does not represent an official audit, certification, regulatory assessment, or real organizational compliance result.
          </p>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-white/[0.06]">
          {/* Brand Info */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(74,222,128,0.25)]">
                <ShieldCheck className="w-5 h-5 text-[#4ADE80]" />
              </div>
              <span className="font-bold text-lg text-white">GRCTrack</span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              IT Governance, Risk &amp; Compliance Management System — Portfolio project demonstrating modern fullstack B2B enterprise architecture.
            </p>
          </div>

          {/* Column 1: Modules */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Core Modules</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/assets" className="hover:text-white transition-colors">Asset Inventory</Link></li>
              <li><Link href="/risks" className="hover:text-white transition-colors">Risk Register &amp; Matrix</Link></li>
              <li><Link href="/controls" className="hover:text-white transition-colors">Control Framework</Link></li>
              <li><Link href="/control-assessments" className="hover:text-white transition-colors">Control Assessment</Link></li>
            </ul>
          </div>

          {/* Column 2: Audit & Reports */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Audit &amp; Reporting</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/evidence" className="hover:text-white transition-colors">Evidence Vault</Link></li>
              <li><Link href="/findings" className="hover:text-white transition-colors">Audit Findings &amp; Gaps</Link></li>
              <li><Link href="/remediation" className="hover:text-white transition-colors">Remediation Action Plans</Link></li>
              <li><Link href="/reports" className="hover:text-white transition-colors">Executive PDF Reports</Link></li>
            </ul>
          </div>

          {/* Column 3: Architecture */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Architecture</h4>
            <ul className="space-y-2 text-xs text-slate-400 font-mono">
              <li><span>Next.js 16 (App Router)</span></li>
              <li><span>React 19 &amp; TypeScript</span></li>
              <li><span>Tailwind CSS v4</span></li>
              <li><span>Node.js / Express backend</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} GRCTrack — Portfolio System. Synthetic Entity: PT Nusantara Digital.</p>
          <div className="flex gap-4 font-mono text-[11px]">
            <Link href="/login" className="hover:text-slate-300 transition-colors">Demo Login</Link>
            <Link href="/dashboard" className="hover:text-slate-300 transition-colors">Live Dashboard</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
