'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Loader2,
  Server,
  AlertTriangle,
  ShieldCheck,
  Search,
  Activity,
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatDateTime } from '@/utils/helpers';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { AuditLog, ApiResponse } from '@/types';

interface DashboardStats {
  total_assets: number;
  total_risks: number;
  risks_by_level: { critical: number; high: number; medium: number; low: number };
  total_controls: number;
  active_controls: number;
  total_findings: number;
  open_findings: number;
  compliance_rate: number;
}

interface RiskMatrixCell {
  likelihood: number;
  impact: number;
  count: number;
}

function getRiskCellColor(likelihood: number, impact: number): string {
  const score = likelihood * impact;
  if (score >= 16) return 'bg-red-500 text-white';
  if (score >= 10) return 'bg-orange-400 text-white';
  if (score >= 5) return 'bg-yellow-300 text-gray-900';
  return 'bg-green-300 text-gray-900';
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [matrix, setMatrix] = useState<RiskMatrixCell[]>([]);
  const [activity, setActivity] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, matrixRes, activityRes] = await Promise.all([
        api.get<ApiResponse<DashboardStats>>('/dashboard/stats'),
        api.get<ApiResponse<RiskMatrixCell[]>>('/dashboard/risk-matrix'),
        api.get<ApiResponse<AuditLog[]>>('/dashboard/recent-activity'),
      ]);
      setStats(statsRes.data ?? null);
      setMatrix(matrixRes.data ?? []);
      setActivity(activityRes.data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <button onClick={fetchData} className="text-blue-600 hover:underline text-sm">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const s = stats!;

  // Build 5x5 matrix lookup
  const matrixMap = new Map<string, number>();
  matrix.forEach((c) => matrixMap.set(`${c.likelihood}-${c.impact}`, c.count));

  const statCards = [
    { label: 'Total Assets', value: s.total_assets, icon: Server, color: 'text-blue-600 bg-blue-100' },
    { label: 'Open Risks', value: s.total_risks, icon: AlertTriangle, color: 'text-red-600 bg-red-100' },
    { label: 'Active Controls', value: s.active_controls, icon: ShieldCheck, color: 'text-green-600 bg-green-100' },
    { label: 'Open Findings', value: s.open_findings, icon: Search, color: 'text-orange-600 bg-orange-100' },
  ];

  const riskLevels = [
    { label: 'Critical', value: s.risks_by_level.critical, bg: 'bg-red-50 border-red-200', text: 'text-red-700' },
    { label: 'High', value: s.risks_by_level.high, bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700' },
    { label: 'Medium', value: s.risks_by_level.medium, bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700' },
    { label: 'Low', value: s.risks_by_level.low, bg: 'bg-green-50 border-green-200', text: 'text-green-700' },
  ];

  return (
    <div className="space-y-6">
      {/* Simulation banner */}
      <p className="text-xs text-gray-400 text-center uppercase tracking-widest">
        Simulation Data — PT Nusantara Digital — For Portfolio/Academic Purposes Only
      </p>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your GRC posture</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c) => (
          <Card key={c.label}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${c.color}`}>
                <c.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{c.value}</p>
                <p className="text-sm text-gray-500">{c.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Risk Level Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Level Distribution</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {riskLevels.map((r) => (
            <div key={r.label} className={`rounded-lg border p-4 text-center ${r.bg}`}>
              <p className={`text-2xl font-bold ${r.text}`}>{r.value}</p>
              <p className={`text-sm font-medium ${r.text}`}>{r.label}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Matrix */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Matrix</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-xs text-gray-500 w-20"></th>
                  {[1, 2, 3, 4, 5].map((l) => (
                    <th key={l} className="p-2 text-xs text-gray-500 text-center font-medium">{l}</th>
                  ))}
                </tr>
                <tr>
                  <th className="p-0"></th>
                  <th colSpan={5} className="text-xs text-gray-400 text-center pb-1 font-normal">
                    Likelihood →
                  </th>
                </tr>
              </thead>
              <tbody>
                {[5, 4, 3, 2, 1].map((impact) => (
                  <tr key={impact}>
                    <td className="p-2 text-xs text-gray-500 text-right font-medium">
                      {impact === 3 && <span className="block text-gray-400 text-[10px]">Impact ↑</span>}
                      {impact}
                    </td>
                    {[1, 2, 3, 4, 5].map((likelihood) => {
                      const count = matrixMap.get(`${likelihood}-${impact}`) || 0;
                      return (
                        <td key={likelihood} className="p-1">
                          <div
                            className={`w-full aspect-square rounded flex items-center justify-center text-sm font-semibold ${getRiskCellColor(likelihood, impact)}`}
                          >
                            {count || ''}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Compliance Status */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance Status</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Overall Compliance</span>
                <span className="text-sm font-semibold text-gray-900">
                  {Math.round(s.compliance_rate)}%
                </span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{ width: `${s.compliance_rate}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-900">{s.total_controls}</p>
                <p className="text-xs text-gray-500">Total Controls</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-lg font-bold text-green-700">{s.active_controls}</p>
                <p className="text-xs text-gray-500">Active</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-lg font-bold text-orange-700">{s.total_findings}</p>
                <p className="text-xs text-gray-500">Findings</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-gray-400" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        {activity.length === 0 ? (
          <p className="text-sm text-gray-400">No recent activity</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {activity.slice(0, 10).map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <Badge variant="info">{log.action}</Badge>
                  <span className="text-sm text-gray-700 truncate">{log.entity_type}</span>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {formatDateTime(log.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
