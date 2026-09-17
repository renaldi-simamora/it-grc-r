'use client';

import { Shield, Database, Server, Cpu, CheckCircle2, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings &amp; Configuration</h1>
        <p className="text-sm text-slate-500 mt-1">
          Technical environment parameters, risk scoring thresholds, and academic simulation metadata
        </p>
      </div>

      <div className="space-y-6">
        {/* Organization Metadata */}
        <Card>
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Target Organization Profile</span>
            </CardTitle>
          </CardHeader>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Organization Name</span>
              <span className="font-bold text-slate-900 text-sm">PT Nusantara Digital</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Data Classification</span>
              <span className="font-bold text-amber-700 text-sm">Synthetic Demo Data (Simulation Only)</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Industry Sector</span>
              <span className="font-medium text-slate-800">Digital Banking &amp; Financial Services (Simulated)</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Audited Framework Scope</span>
              <span className="font-medium text-slate-800">IT Governance, Risk Assessment &amp; Controls Testing</span>
            </div>
          </div>
        </Card>

        {/* Risk Scoring Methodology */}
        <Card>
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              <span>Risk Scoring Formula &amp; Level Mapping</span>
            </CardTitle>
          </CardHeader>
          <div className="p-4 space-y-3 text-xs">
            <p className="text-slate-600">
              The system automatically calculates risk scores upon assessment using the standard two-dimensional model:
            </p>
            <div className="p-3 bg-slate-900 text-white rounded-xl font-mono text-sm">
              risk_score = likelihood (1–5) × impact (1–5)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center font-bold">
              <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
                1 – 4: LOW
              </div>
              <div className="p-2.5 rounded-lg bg-amber-100 text-amber-800 border border-amber-200">
                5 – 9: MEDIUM
              </div>
              <div className="p-2.5 rounded-lg bg-orange-100 text-orange-800 border border-orange-200">
                10 – 16: HIGH
              </div>
              <div className="p-2.5 rounded-lg bg-red-100 text-red-800 border border-red-200">
                17 – 25: CRITICAL
              </div>
            </div>
          </div>
        </Card>

        {/* Architecture & Tech Stack */}
        <Card>
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-600" />
              <span>Technology Stack &amp; Architecture</span>
            </CardTitle>
          </CardHeader>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-slate-900">Frontend Layer:</span>
              <p className="text-slate-600">Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons</p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-slate-900">Backend API:</span>
              <p className="text-slate-600">Node.js, Express.js REST API, TypeScript, Multer, Helmet Security, Rate Limiting</p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-slate-900">Database &amp; Storage:</span>
              <p className="text-slate-600">Supabase PostgreSQL + Supabase Storage with seamless In-Memory Simulation fallback</p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-slate-900">Authentication &amp; RBAC:</span>
              <p className="text-slate-600">Supabase Auth JWT with role authorization middleware (ADMIN &amp; GRC_OFFICER)</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
