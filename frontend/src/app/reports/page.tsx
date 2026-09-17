'use client';

import { useState, useEffect, useCallback } from 'react';
import { Printer, Shield, FileText, CheckCircle2, AlertTriangle, Loader2, ExternalLink } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate, getRiskLevelColor, getStatusColor } from '@/utils/helpers';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { ApiResponse } from '@/types';

export default function ReportsPage() {
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get<ApiResponse<any>>('/reports/assessment');
      setReport(res.data ?? null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate assessment report');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
        <p className="text-xs font-semibold text-slate-500">Compiling multi-module GRC Assessment Report...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="p-6 text-center bg-white rounded-xl border border-slate-200">
        <p className="text-rose-600 font-semibold mb-2">{error || 'Could not load report'}</p>
        <Button onClick={fetchReport}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Control Actions Bar (Hidden on Print) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">IT GRC Assessment Report</h1>
          <p className="text-xs text-slate-500">
            Comprehensive audit report generated directly from active database records
          </p>
        </div>
        <Button onClick={handlePrint} className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm">
          <Printer className="w-4 h-4 mr-2" />
          Print / Export to PDF
        </Button>
      </div>

      {/* Printable Report Document Body */}
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200 print:border-none print:shadow-none print:p-0 space-y-10 text-slate-900">
        {/* 1. Cover Header */}
        <section className="border-b-2 border-slate-900 pb-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-600 text-white">
                <Shield className="w-6 h-6" />
              </div>
              <span className="font-mono text-xs font-bold text-slate-500 uppercase tracking-widest">
                GRCTrack Audit Documentation
              </span>
            </div>
            <span className="px-2.5 py-1 rounded bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-black uppercase tracking-wider">
              {report.cover.simulation_badge}
            </span>
          </div>

          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              {report.cover.title}
            </h1>
            <p className="text-base font-semibold text-slate-600 mt-1">
              Organization Under Assessment: {report.cover.organization}
            </p>
          </div>

          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
            <strong>Important Academic Disclaimer:</strong> {report.cover.disclaimer}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2">
            <div>
              <span className="text-slate-400 block font-medium">Evaluation Period</span>
              <span className="font-bold text-slate-800">{report.cover.review_period}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Lead Assessor</span>
              <span className="font-bold text-slate-800">{report.cover.lead_assessor}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Report Timestamp</span>
              <span className="font-bold text-slate-800">{formatDate(report.cover.generated_at)}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Classification</span>
              <span className="font-bold text-slate-800">Simulated Confidential</span>
            </div>
          </div>
        </section>

        {/* 2. Executive Summary */}
        <section className="space-y-4">
          <div className="border-b border-slate-200 pb-2">
            <h2 className="text-xl font-bold text-slate-900">2. Executive Summary</h2>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">{report.executive_summary.posture_assessment}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-xs text-slate-500 uppercase block">Compliance Rating</span>
              <span className="text-2xl font-black font-mono text-blue-600">
                {report.executive_summary.overall_compliance_score}%
              </span>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-xs text-slate-500 uppercase block">Total Risks Scoped</span>
              <span className="text-2xl font-black font-mono text-slate-900">
                {report.executive_summary.total_risks_identified}
              </span>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-xs text-slate-500 uppercase block">Critical Risks</span>
              <span className="text-2xl font-black font-mono text-red-600">
                {report.executive_summary.critical_risk_count}
              </span>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-xs text-slate-500 uppercase block">Open Audit Gaps</span>
              <span className="text-2xl font-black font-mono text-amber-600">
                {report.executive_summary.open_findings_count}
              </span>
            </div>
          </div>
        </section>

        {/* 3. Assessment Scope */}
        <section className="space-y-4">
          <div className="border-b border-slate-200 pb-2">
            <h2 className="text-xl font-bold text-slate-900">3. Assessment Scope &amp; Target Systems</h2>
          </div>
          <p className="text-xs text-slate-600">
            The assessment scope covers the primary infrastructure, core transactional engines, databases, and endpoint devices of PT Nusantara Digital:
          </p>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">Asset Code</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">Asset Name</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">Type</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">Criticality</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report.scope.target_systems.slice(0, 8).map((sys: any) => (
                  <tr key={sys.asset_code}>
                    <td className="px-3 py-2 font-mono font-bold text-slate-800">{sys.asset_code}</td>
                    <td className="px-3 py-2 font-medium text-slate-900">{sys.name}</td>
                    <td className="px-3 py-2 text-slate-600">{sys.type}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusColor(sys.criticality)}`}>
                        {sys.criticality}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-600">{sys.owner || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. Top Risks & Risk Register Highlights */}
        <section className="space-y-4">
          <div className="border-b border-slate-200 pb-2">
            <h2 className="text-xl font-bold text-slate-900">4. Risk Assessment &amp; Risk Register</h2>
          </div>
          <p className="text-xs text-slate-600">
            Risks evaluated using the standard 5 &times; 5 matrix model (Likelihood &times; Impact = Risk Score). Highest severity risks identified:
          </p>

          <div className="space-y-2">
            {report.top_risks.map((r: any) => (
              <div key={r.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{r.risk_code}</span>
                    <span className="font-bold text-slate-900">{r.title}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black ${getRiskLevelColor(r.risk_level)}`}>
                    {r.risk_level} ({r.risk_score} pts)
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">{r.description}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Target: {r.asset_name}</span>
                  <span>Owner: {r.owner || 'Unassigned'}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Control Assessment & Evidence */}
        <section className="space-y-4">
          <div className="border-b border-slate-200 pb-2">
            <h2 className="text-xl font-bold text-slate-900">5. Control Implementation &amp; Evidence Audit</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">Total Controls</span>
              <span className="text-lg font-bold text-slate-900 font-mono">
                {report.control_assessment_summary.total}
              </span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-emerald-700 block">Implemented Controls</span>
              <span className="text-lg font-bold text-emerald-800 font-mono">
                {report.control_assessment_summary.by_implementation.IMPLEMENTED}
              </span>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
              <span className="text-blue-700 block">Synthetic Evidences Collected</span>
              <span className="text-lg font-bold text-blue-800 font-mono">
                {report.evidence_summary.total_collected}
              </span>
            </div>
          </div>
        </section>

        {/* 6. Findings & Gaps */}
        <section className="space-y-4">
          <div className="border-b border-slate-200 pb-2">
            <h2 className="text-xl font-bold text-slate-900">6. Audit Findings &amp; Deficiencies</h2>
          </div>
          <div className="space-y-2">
            {report.findings.slice(0, 5).map((f: any) => (
              <div key={f.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{f.finding_code}</span>
                    <span className="font-bold text-slate-900">{f.title}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getRiskLevelColor(f.severity)}`}>
                    {f.severity}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">{f.description}</p>
                <p className="text-blue-700 text-[11px] font-medium">Rec: {f.recommendation}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 7. Recommendations */}
        <section className="space-y-4">
          <div className="border-b border-slate-200 pb-2">
            <h2 className="text-xl font-bold text-slate-900">7. Key Remediation Recommendations</h2>
          </div>
          <ol className="list-decimal pl-5 space-y-1.5 text-xs text-slate-700">
            {report.recommendations.map((rec: string, idx: number) => (
              <li key={idx} className="leading-relaxed">
                {rec}
              </li>
            ))}
          </ol>
        </section>

        {/* Report Footer / Signature Area */}
        <div className="pt-8 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
          <div>
            <p className="font-bold text-slate-900">Ahmad Pratama</p>
            <p className="text-[11px]">Lead IT GRC Assessor — PT Nusantara Digital (Simulation)</p>
          </div>
          <div className="text-right">
            <p className="font-mono">Page 1 of 1 • Internal Portfolio Simulation</p>
          </div>
        </div>
      </div>
    </div>
  );
}
