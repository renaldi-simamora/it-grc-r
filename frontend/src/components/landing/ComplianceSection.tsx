'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

const domainStats = [
  { domain: 'Access Control', rate: 95, items: '12 / 12 controls', status: 'Compliant' },
  { domain: 'Data Protection', rate: 85, items: '10 / 12 controls', status: 'Satisfactory' },
  { domain: 'Backup & Recovery', rate: 90, items: '8 / 8 controls', status: 'Compliant' },
  { domain: 'Change Management', rate: 75, items: '6 / 8 controls', status: 'Needs Action' },
  { domain: 'Incident Management', rate: 80, items: '7 / 8 controls', status: 'Satisfactory' },
  { domain: 'Asset Management', rate: 92, items: '11 / 12 controls', status: 'Compliant' },
  { domain: 'Documentation', rate: 70, items: '5 / 8 controls', status: 'In Progress' },
];

export function ComplianceSection() {
  return (
    <section id="compliance" className="relative z-10 py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest block mb-2 font-mono">
            Continuous Assurance
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Compliance Adherence Engine
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-2">
            Weighted framework evaluation across 7 IT governance domains reflecting standard audit rules.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Radial Gauge Card */}
          <div className="lg:col-span-5">
            <div className="glass-card p-6 sm:p-8 rounded-2xl text-center flex flex-col items-center justify-between h-full">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-slate-400 block mb-1">
                  Overall Compliance Score
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Formula: (Compliant + 0.5 × Partial) / Applicable × 100%
                </span>
              </div>

              {/* Radial Gauge Visual SVG */}
              <div className="relative my-6 w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                  {/* Track circle */}
                  <circle
                    cx="80"
                    cy="80"
                    r="65"
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="14"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="80"
                    cy="80"
                    r="65"
                    fill="none"
                    stroke="#4ADE80"
                    strokeWidth="14"
                    strokeDasharray="408.4"
                    strokeDashoffset={408.4 * (1 - 0.825)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 shadow-[0_0_20px_rgba(74,222,128,0.5)]"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-4xl font-extrabold text-white font-mono tracking-tight">
                    82.5%
                  </span>
                  <span className="text-[10.5px] font-semibold text-emerald-400 mt-0.5">
                    SATISFACTORY
                  </span>
                </div>
              </div>

              <div className="w-full pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                <span>Evaluation Target: ≥ 80%</span>
                <span className="text-emerald-400 font-mono">PASSED</span>
              </div>
            </div>
          </div>

          {/* Right 7 Domains Progress List */}
          <div className="lg:col-span-7">
            <div className="glass-card p-6 sm:p-8 rounded-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  7 Framework Domains
                </h3>
                <span className="text-xs text-slate-400 font-mono">Adherence %</span>
              </div>

              <div className="space-y-3">
                {domainStats.map((item) => (
                  <div key={item.domain} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{item.domain}</span>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-slate-400 text-[11px]">{item.items}</span>
                        <span className="font-bold text-white">{item.rate}%</span>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-900 border border-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.rate >= 90 ? 'bg-emerald-400' : item.rate >= 75 ? 'bg-amber-400' : 'bg-rose-400'
                        }`}
                        style={{ width: `${item.rate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-right">
                <Link
                  href="/compliance"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:underline"
                >
                  <span>Open Full Compliance Module</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
