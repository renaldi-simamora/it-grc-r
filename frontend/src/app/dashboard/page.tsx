'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Server,
  AlertTriangle,
  ShieldCheck,
  Search,
  Activity,
  CheckCircle2,
  Clock,
  Wrench,
  Loader2,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatDateTime, getRiskLevelColor, getStatusColor } from '@/utils/helpers';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { ActivityLog, ApiResponse } from '@/types';

interface DashboardData {
  total_assets: number;
  total_risks: number;
  critical_risks: number;
  high_risks: number;
  medium_risks: number;
  low_risks: number;
  risks_by_level: Record<string, number>;
  risks_by_category: Record<string, number>;

  total_controls: number;
  compliant_controls: number;
  partially_compliant_controls: number;
  non_compliant_controls: number;
  controls_by_status: Record<string, number>;

  total_findings: number;
  open_findings: number;
  resolved_findings: number;
  findings_by_severity: Record<string, number>;
  findings_by_status: Record<string, number>;

  total_remediations: number;
  overdue_remediation: number;
  remediations_by_status: Record<string, number>;

  overall_compliance_percentage: number;
  recent_activity: ActivityLog[];
}

interface MatrixCell {
  likelihood: number;
  impact: number;
  count: number;
}

function getMatrixCellStyling(likelihood: number, impact: number, count: number): string {
  const score = likelihood * impact;
  if (score >= 17) {
    return 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/35 hover:shadow-[0_0_15px_rgba(244,63,94,0.4)]';
  }
  if (score >= 10) {
    return 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/35 hover:shadow-[0_0_15px_rgba(245,158,11,0.4)]';
  }
  if (score >= 5) {
    return 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/30 hover:bg-yellow-500/30';
  }
  return 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 hover:shadow-[0_0_15px_rgba(74,222,128,0.3)]';
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [matrix, setMatrix] = useState<MatrixCell[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, matrixRes] = await Promise.all([
        api.get<ApiResponse<DashboardData>>('/dashboard/summary'),
        api.get<ApiResponse<MatrixCell[]>>('/dashboard/risk-matrix'),
      ]);
      setStats(statsRes.data ?? null);
      setMatrix(matrixRes.data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(74,222,128,0.25)]">
          <Loader2 className="w-6 h-6 animate-spin text-[#4ADE80]" />
        </div>
        <p className="text-xs font-semibold text-slate-300">Querying live simulated GRC telemetry...</p>
        <p className="text-[11px] text-slate-500 font-mono mt-0.5">PT Nusantara Digital Ledger</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center p-8 bg-[#090F1A] rounded-2xl border border-white/10 shadow-2xl max-w-sm">
          <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-3" />
          <p className="text-rose-400 font-semibold text-sm mb-3">{error || 'Failed to load dashboard'}</p>
          <button
            onClick={fetchDashboard}
            className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 text-xs font-bold transition-colors cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  // Lookup map for 5x5 heatmap matrix
  const matrixMap = new Map<string, number>();
  matrix.forEach((c) => matrixMap.set(`${c.likelihood}-${c.impact}`, c.count));

  const statCards = [
    {
      title: 'Total IT Assets',
      value: stats.total_assets,
      subtitle: 'Hardware, DB, Cloud & Apps',
      icon: Server,
      color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.15)]',
      href: '/assets',
    },
    {
      title: 'Active IT Risks',
      value: stats.total_risks,
      subtitle: `${stats.critical_risks} Critical • ${stats.high_risks} High`,
      icon: AlertTriangle,
      color: 'text-rose-400 border-rose-500/30 bg-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.15)]',
      href: '/risks',
    },
    {
      title: 'Mitigating Controls',
      value: stats.total_controls,
      subtitle: `${stats.compliant_controls} Implemented`,
      icon: ShieldCheck,
      color: 'text-[#4ADE80] border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_15px_rgba(74,222,128,0.15)]',
      href: '/controls',
    },
    {
      title: 'Open Findings & Gaps',
      value: stats.open_findings,
      subtitle: `${stats.overdue_remediation} Overdue Actions`,
      icon: Search,
      color: 'text-amber-400 border-amber-500/30 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
      href: '/findings',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Executive GRC Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10.5px] font-semibold uppercase tracking-wider">
              Live Ledger
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time IT governance posture, threat scoring, control health, and remediation metrics for PT Nusantara Digital
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/reports">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/12 text-slate-200 hover:text-white text-xs font-semibold shadow-sm transition-all cursor-pointer">
              <span>View Executive Report</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#4ADE80]" />
            </button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link key={card.title} href={card.href}>
            <div className="glass-card glass-card-hover p-5 h-full rounded-2xl relative overflow-hidden group cursor-pointer">
              {/* Top Shimmer */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{card.title}</p>
                  <p className="text-3xl font-extrabold text-white font-mono tracking-tight">{card.value}</p>
                  <p className="text-xs text-slate-400 font-medium">{card.subtitle}</p>
                </div>
                <div className={`p-3 rounded-xl border ${card.color}`}>
                  <card.icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Main Visuals Row: 5x5 Matrix & Compliance Posture */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 5x5 Risk Heatmap Matrix */}
        <div className="lg:col-span-7">
          <div className="glass-card p-6 rounded-2xl h-full flex flex-col justify-between">
            <div className="flex flex-row items-center justify-between pb-3 mb-3 border-b border-white/[0.08]">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">5 × 5 Risk Heatmap Matrix</h3>
                <p className="text-xs text-slate-400">Threat distribution: Likelihood (1–5) × Impact (1–5)</p>
              </div>
              <Link href="/risks" className="text-xs font-semibold text-[#4ADE80] hover:underline flex items-center gap-1">
                <span>View Register</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="pt-2">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="w-12 p-1 text-[11px] font-bold text-slate-500 text-right uppercase"></th>
                      {[1, 2, 3, 4, 5].map((l) => (
                        <th key={l} className="p-1 text-xs font-bold text-slate-400 text-center font-mono">
                          L{l}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[5, 4, 3, 2, 1].map((impact) => (
                      <tr key={impact}>
                        <td className="p-1 text-xs font-bold text-slate-400 text-right pr-2 font-mono">
                          I{impact}
                        </td>
                        {[1, 2, 3, 4, 5].map((likelihood) => {
                          const count = matrixMap.get(`${likelihood}-${impact}`) || 0;
                          return (
                            <td key={likelihood} className="p-1">
                              <Link
                                href={`/risks?likelihood=${likelihood}&impact=${impact}`}
                                className={`w-full aspect-square rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${getMatrixCellStyling(
                                  likelihood,
                                  impact,
                                  count
                                )}`}
                                title={`Likelihood: ${likelihood}, Impact: ${impact} (Score: ${likelihood * impact}) — ${count} risk(s). Click to view in Register.`}
                              >
                                <span className="text-sm font-extrabold font-mono">{count > 0 ? count : '—'}</span>
                                {count > 0 && <span className="text-[9px] opacity-75 font-mono">rsk</span>}
                              </Link>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Matrix Legend */}
              <div className="mt-4 pt-3 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
                  <span>Critical (17–25)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
                  <span>High (10–16)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <span>Medium (5–9)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(74,222,128,0.8)]" />
                  <span>Low (1–4)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Compliance & Control Health */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex flex-row items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Compliance Score</h3>
                <p className="text-xs text-slate-400">7 IT Governance Framework Domains</p>
              </div>
              <Link href="/compliance" className="text-xs font-semibold text-[#4ADE80] hover:underline flex items-center gap-1">
                <span>Assess</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="pt-4 space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-4xl font-extrabold text-white font-mono tracking-tight">
                    {stats.overall_compliance_percentage}%
                  </span>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Weighted Assessment Score</p>
                </div>
                <Badge variant={stats.overall_compliance_percentage >= 80 ? 'success' : 'warning'}>
                  {stats.overall_compliance_percentage >= 80 ? 'SATISFACTORY' : 'ATTENTION'}
                </Badge>
              </div>

              {/* Glowing Progress Bar */}
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-white/10 p-[1px]">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-[#4ADE80] rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(74,222,128,0.5)]"
                  style={{ width: `${stats.overall_compliance_percentage}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-white/[0.03] rounded-xl border border-white/10 text-center">
                  <span className="text-[10.5px] text-slate-400 block uppercase font-semibold">Total Controls</span>
                  <span className="text-xl font-bold font-mono text-white mt-0.5 block">{stats.total_controls}</span>
                </div>
                <div className="p-3 bg-white/[0.03] rounded-xl border border-white/10 text-center">
                  <span className="text-[10.5px] text-slate-400 block uppercase font-semibold">Remediations</span>
                  <span className="text-xl font-bold font-mono text-white mt-0.5 block">{stats.total_remediations}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Level Distribution Breakdown */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-sm font-bold text-white tracking-tight pb-3 border-b border-white/[0.08] mb-4">
              Risks by Severity Level
            </h3>
            <div className="grid grid-cols-4 gap-2.5 text-center">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25">
                <p className="text-lg font-bold text-rose-300 font-mono">{stats.critical_risks}</p>
                <p className="text-[10px] font-bold text-rose-400 uppercase">Critical</p>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25">
                <p className="text-lg font-bold text-amber-300 font-mono">{stats.high_risks}</p>
                <p className="text-[10px] font-bold text-amber-400 uppercase">High</p>
              </div>
              <div className="p-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/25">
                <p className="text-lg font-bold text-yellow-300 font-mono">{stats.medium_risks}</p>
                <p className="text-[10px] font-bold text-yellow-400 uppercase">Med</p>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                <p className="text-lg font-bold text-emerald-300 font-mono">{stats.low_risks}</p>
                <p className="text-[10px] font-bold text-emerald-400 uppercase">Low</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown & Recent Audit Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risks by Category */}
        <div className="lg:col-span-5">
          <div className="glass-card p-6 rounded-2xl h-full flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight pb-3 border-b border-white/[0.08] mb-3">
                Threat Scenario Categories
              </h3>
              <div className="space-y-3">
                {Object.entries(stats.risks_by_category).map(([cat, count]) => (
                  <div key={cat} className="flex items-center justify-between text-xs py-1 border-b border-white/[0.04] last:border-0">
                    <span className="font-medium text-slate-300 truncate max-w-[200px]">{cat}</span>
                    <div className="flex items-center gap-2.5">
                      <span className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden inline-block border border-white/5">
                        <span
                          className="h-full bg-[#4ADE80] block rounded-full"
                          style={{ width: `${Math.min(100, (count / stats.total_risks) * 100 * 2)}%` }}
                        />
                      </span>
                      <span className="font-mono font-bold text-white w-4 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live Activity Logs Audit Stream */}
        <div className="lg:col-span-7">
          <div className="glass-card p-6 rounded-2xl h-full flex flex-col justify-between">
            <div>
              <div className="flex flex-row items-center justify-between pb-3 border-b border-white/[0.08] mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#4ADE80]" />
                  <h3 className="text-sm font-bold text-white tracking-tight">Recent Audit Trail Activity</h3>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">Live Events</span>
              </div>

              <div className="divide-y divide-white/[0.05]">
                {stats.recent_activity.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No recent activity logged</p>
                ) : (
                  stats.recent_activity.slice(0, 6).map((log) => (
                    <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-white/[0.06] text-slate-300 border border-white/10 uppercase shrink-0">
                          {log.module}
                        </span>
                        <div className="truncate">
                          <p className="font-semibold text-slate-200 truncate">{log.action.replace(/_/g, ' ')}</p>
                          <p className="text-[10px] text-slate-400">By: {log.user_name || 'System Auditor'}</p>
                        </div>
                      </div>
                      <span className="text-[10.5px] text-slate-400 font-mono shrink-0 ml-2">
                        {formatDateTime(log.created_at)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
