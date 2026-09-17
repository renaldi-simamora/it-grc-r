'use client';

import { useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatDateTime, getRiskLevelColor, getStatusColor } from '@/utils/helpers';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
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

function getMatrixCellBg(likelihood: number, impact: number): string {
  const score = likelihood * impact;
  if (score >= 17) return 'bg-red-500 text-white font-bold hover:bg-red-600';
  if (score >= 10) return 'bg-orange-500 text-white font-bold hover:bg-orange-600';
  if (score >= 5) return 'bg-amber-300 text-amber-950 font-bold hover:bg-amber-400';
  return 'bg-emerald-300 text-emerald-950 font-bold hover:bg-emerald-400';
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
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
        <p className="text-xs font-semibold text-slate-500">Querying live GRC database...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
          <p className="text-rose-600 font-semibold mb-2">{error || 'Failed to load dashboard'}</p>
          <button onClick={fetchDashboard} className="text-blue-600 hover:underline text-xs font-bold">
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
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      href: '/assets',
    },
    {
      title: 'Active IT Risks',
      value: stats.total_risks,
      subtitle: `${stats.critical_risks} Critical • ${stats.high_risks} High`,
      icon: AlertTriangle,
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      href: '/risks',
    },
    {
      title: 'Mitigating Controls',
      value: stats.total_controls,
      subtitle: `${stats.compliant_controls} Implemented`,
      icon: ShieldCheck,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      href: '/controls',
    },
    {
      title: 'Open Findings & Gaps',
      value: stats.open_findings,
      subtitle: `${stats.overdue_remediation} Overdue Actions`,
      icon: Search,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      href: '/findings',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Executive GRC Dashboard</h1>
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold uppercase">
              Live Database
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time IT governance posture, threat scoring, control health, and remediation metrics for PT Nusantara Digital
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/reports">
            <button className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 shadow-sm transition-all">
              <span>View Executive Report</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link key={card.title} href={card.href}>
            <Card className="hover:border-blue-500 hover:shadow-md transition-all cursor-pointer h-full">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.title}</p>
                  <p className="text-3xl font-black text-slate-900 font-mono tracking-tight">{card.value}</p>
                  <p className="text-xs text-slate-500 font-medium">{card.subtitle}</p>
                </div>
                <div className={`p-3.5 rounded-xl border ${card.color}`}>
                  <card.icon className="w-6 h-6" />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main Visuals Row: 5x5 Matrix & Compliance Posture */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 5x5 Risk Heatmap Matrix */}
        <div className="lg:col-span-7">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">5 × 5 Risk Heatmap Matrix</CardTitle>
                <p className="text-xs text-slate-400">Threat distribution: Likelihood (1–5) × Impact (1–5)</p>
              </div>
              <Link href="/risks" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                View Register →
              </Link>
            </CardHeader>

            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="w-16 p-1 text-[11px] font-bold text-slate-400 text-right uppercase"></th>
                      {[1, 2, 3, 4, 5].map((l) => (
                        <th key={l} className="p-1 text-xs font-bold text-slate-600 text-center">
                          L{l}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[5, 4, 3, 2, 1].map((impact) => (
                      <tr key={impact}>
                        <td className="p-1 text-xs font-bold text-slate-600 text-right pr-2">
                          I{impact}
                        </td>
                        {[1, 2, 3, 4, 5].map((likelihood) => {
                          const count = matrixMap.get(`${likelihood}-${impact}`) || 0;
                          return (
                            <td key={likelihood} className="p-1">
                              <div
                                className={`w-full aspect-square rounded-lg flex flex-col items-center justify-center transition-all ${getMatrixCellBg(
                                  likelihood,
                                  impact
                                )}`}
                                title={`Likelihood: ${likelihood}, Impact: ${impact} (Score: ${likelihood * impact}) — ${count} risk(s)`}
                              >
                                <span className="text-sm font-black">{count > 0 ? count : ''}</span>
                                {count > 0 && <span className="text-[9px] opacity-75 font-mono">rsk</span>}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Matrix Legend */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-red-500 inline-block" />
                  <span>Critical (17–25)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-orange-500 inline-block" />
                  <span>High (10–16)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-amber-300 inline-block" />
                  <span>Medium (5–9)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-300 inline-block" />
                  <span>Low (1–4)</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Overall Compliance & Control Health */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">Overall Compliance Score</CardTitle>
                <p className="text-xs text-slate-400">7 IT Governance Framework Domains</p>
              </div>
              <Link href="/compliance" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                Assess →
              </Link>
            </CardHeader>

            <div className="p-4 space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-4xl font-black text-slate-900 font-mono tracking-tight">
                    {stats.overall_compliance_percentage}%
                  </span>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Weighted Assessment Score</p>
                </div>
                <Badge
                  className={
                    stats.overall_compliance_percentage >= 80
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }
                >
                  {stats.overall_compliance_percentage >= 80 ? 'SATISFACTORY' : 'REQUIRES ATTENTION'}
                </Badge>
              </div>

              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${stats.overall_compliance_percentage}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-xs text-slate-500 block uppercase">Total Controls</span>
                  <span className="text-xl font-bold font-mono text-slate-900">{stats.total_controls}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-xs text-slate-500 block uppercase">Active Remediations</span>
                  <span className="text-xl font-bold font-mono text-slate-900">{stats.total_remediations}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Risk Level Distribution Breakdown */}
          <Card>
            <CardHeader className="pb-2 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900">Risks by Severity Level</CardTitle>
            </CardHeader>
            <div className="p-4 grid grid-cols-4 gap-2 text-center">
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200">
                <p className="text-xl font-bold text-red-700 font-mono">{stats.critical_risks}</p>
                <p className="text-[10px] font-bold text-red-600 uppercase">Critical</p>
              </div>
              <div className="p-2.5 rounded-lg bg-orange-50 border border-orange-200">
                <p className="text-xl font-bold text-orange-700 font-mono">{stats.high_risks}</p>
                <p className="text-[10px] font-bold text-orange-600 uppercase">High</p>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-xl font-bold text-amber-700 font-mono">{stats.medium_risks}</p>
                <p className="text-[10px] font-bold text-amber-600 uppercase">Medium</p>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                <p className="text-xl font-bold text-emerald-700 font-mono">{stats.low_risks}</p>
                <p className="text-[10px] font-bold text-emerald-600 uppercase">Low</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Category Breakdown & Recent Audit Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risks by Category */}
        <div className="lg:col-span-5">
          <Card className="h-full">
            <CardHeader className="pb-2 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900">Threat Scenario Categories</CardTitle>
            </CardHeader>
            <div className="p-4 space-y-2.5">
              {Object.entries(stats.risks_by_category).map(([cat, count]) => (
                <div key={cat} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                  <span className="font-medium text-slate-700">{cat}</span>
                  <div className="flex items-center gap-2">
                    <span className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden inline-block">
                      <span
                        className="h-full bg-blue-500 block"
                        style={{ width: `${Math.min(100, (count / stats.total_risks) * 100 * 2)}%` }}
                      />
                    </span>
                    <span className="font-mono font-bold text-slate-900 w-4 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Live Activity Logs Audit Stream */}
        <div className="lg:col-span-7">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <CardTitle className="text-sm font-bold text-slate-900">Recent Audit Trail Activity</CardTitle>
              </div>
              <span className="text-xs text-slate-400">Live system events</span>
            </CardHeader>

            <div className="p-4 divide-y divide-slate-100">
              {stats.recent_activity.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No recent activity logged</p>
              ) : (
                stats.recent_activity.slice(0, 6).map((log) => (
                  <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {log.module}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-900">{log.action.replace(/_/g, ' ')}</p>
                        <p className="text-[11px] text-slate-500">By: {log.user_name || 'System'}</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">{formatDateTime(log.created_at)}</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
