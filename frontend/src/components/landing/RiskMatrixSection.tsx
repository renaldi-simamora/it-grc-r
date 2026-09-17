'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';

export function RiskMatrixSection() {
  return (
    <section id="risk-matrix" className="relative z-10 py-16 sm:py-20 border-t border-white/[0.06] bg-[#050912]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Explanation Column */}
          <div className="lg:col-span-5 space-y-5">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest block font-mono">
              Quantitative Methodology
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-[1.15]">
              5 × 5 Inherent Risk Scoring Engine
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Every IT asset threat scenario is evaluated using standard ISO 31000 risk parameters. The inherent risk score is automatically computed:
            </p>

            {/* Formula Block */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 font-mono text-xs space-y-2">
              <div className="text-emerald-400 font-bold text-sm">
                Score (S) = Likelihood (L) × Impact (I)
              </div>
              <p className="text-slate-400 text-[11px]">
                Where Likelihood ∈ [1..5] and Impact ∈ [1..5], yielding scores from 1 to 25.
              </p>
            </div>

            {/* Score Ranges Table */}
            <div className="space-y-2 pt-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <span className="font-bold text-rose-300">Critical Risk</span>
                <span className="font-mono text-rose-400">Score 17 – 25</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <span className="font-bold text-amber-300">High Risk</span>
                <span className="font-mono text-amber-400">Score 10 – 16</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <span className="font-bold text-yellow-300">Medium Risk</span>
                <span className="font-mono text-yellow-400">Score 5 – 9</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <span className="font-bold text-emerald-300">Low Risk</span>
                <span className="font-mono text-emerald-400">Score 1 – 4</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/risks"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#4ADE80] hover:underline"
              >
                <span>View Full Risk Register in Sandbox</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Interactive Matrix Grid */}
          <div className="lg:col-span-7">
            <div className="glass-card p-6 sm:p-8 rounded-2xl">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                <div>
                  <h3 className="text-base font-bold text-white">Live Threat Heatmap Distribution</h3>
                  <p className="text-xs text-slate-400">21 Assessed Synthetic Threat Scenarios</p>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                  PT Nusantara Digital
                </span>
              </div>

              {/* 5x5 Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="w-10 p-1 text-[11px] font-mono font-bold text-slate-500 text-right"></th>
                      {[1, 2, 3, 4, 5].map((l) => (
                        <th key={l} className="p-1 text-xs font-bold text-slate-400 text-center font-mono">
                          L{l}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { impact: 5, row: [{ count: 2, score: 5 }, { count: 1, score: 10 }, { count: 0, score: 15 }, { count: 0, score: 20 }, { count: 0, score: 25 }] },
                      { impact: 4, row: [{ count: 1, score: 4 }, { count: 1, score: 8 }, { count: 2, score: 12 }, { count: 0, score: 16 }, { count: 0, score: 20 }] },
                      { impact: 3, row: [{ count: 0, score: 3 }, { count: 1, score: 6 }, { count: 2, score: 9 }, { count: 1, score: 12 }, { count: 0, score: 15 }] },
                      { impact: 2, row: [{ count: 1, score: 2 }, { count: 2, score: 4 }, { count: 1, score: 6 }, { count: 0, score: 8 }, { count: 1, score: 10 }] },
                      { impact: 1, row: [{ count: 2, score: 1 }, { count: 1, score: 2 }, { count: 1, score: 3 }, { count: 1, score: 4 }, { count: 1, score: 5 }] },
                    ].map((r) => (
                      <tr key={r.impact}>
                        <td className="p-1 text-xs font-bold text-slate-400 text-right pr-2 font-mono">
                          I{r.impact}
                        </td>
                        {r.row.map((cell, idx) => {
                          const score = (idx + 1) * r.impact;
                          let bg = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
                          if (score >= 17) bg = 'bg-rose-500/25 text-rose-300 border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.3)]';
                          else if (score >= 10) bg = 'bg-amber-500/25 text-amber-300 border-amber-500/50';
                          else if (score >= 5) bg = 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';

                          return (
                            <td key={idx} className="p-1">
                              <div
                                className={`w-full aspect-square rounded-xl flex flex-col items-center justify-center border font-mono transition-all ${bg}`}
                              >
                                <span className="text-sm font-extrabold">{cell.count > 0 ? cell.count : '·'}</span>
                                <span className="text-[9px] opacity-60">S{score}</span>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
