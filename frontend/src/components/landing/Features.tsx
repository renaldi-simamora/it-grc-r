'use client';

import React from 'react';
import {
  Server,
  AlertTriangle,
  Shield,
  ClipboardCheck,
  FileCheck2,
  Search,
  Wrench,
  CheckSquare,
} from 'lucide-react';

const coreFeatures = [
  {
    icon: Server,
    title: 'Asset Inventory',
    desc: 'Catalog applications, databases, cloud instances, and endpoints with business criticality (Critical, High, Medium, Low) and departmental ownership.',
    tag: 'AST-0001 to AST-0012',
  },
  {
    icon: AlertTriangle,
    title: 'Risk Register',
    desc: 'Formal 5×5 threat scoring model calculating Inherent Risk = Likelihood × Impact (1–25). Automated classification from Low to Critical.',
    tag: '21 Synthetic Scenarios',
  },
  {
    icon: Shield,
    title: 'Control Management',
    desc: 'Mitigation repository mapped to ISO/IEC 27001 Annex A, NIST CSF, and CIS Controls with implementation frequency and status tracking.',
    tag: '16 Controls Active',
  },
  {
    icon: ClipboardCheck,
    title: 'Control Assessment',
    desc: 'Multi-criteria audit evaluations measuring control effectiveness. Automated compliance score weighting with assessor notes.',
    tag: 'Audit Engine',
  },
  {
    icon: FileCheck2,
    title: 'Evidence Vault',
    desc: 'Simulated artifact storage linked directly to controls. Complete approval lifecycle: Pending Review, Approved, or Rejected with review logs.',
    tag: 'Artifact Audit Trail',
  },
  {
    icon: Search,
    title: 'Findings & Gaps',
    desc: 'Deficiency logging with severity ranking, root-cause analysis, risk associations, and formal audit recommendations.',
    tag: 'Gap Analysis',
  },
  {
    icon: Wrench,
    title: 'Remediation Tracking',
    desc: 'Corrective Action Plans (CAP) with designated owners, target deadlines, and automated visual alerts for overdue actions.',
    tag: 'Overdue Detection',
  },
  {
    icon: CheckSquare,
    title: 'Compliance Engine',
    desc: 'Continuous framework monitoring across 7 IT governance domains calculating adherence percentages and applicable control coverage.',
    tag: 'Weighted Formula',
  },
];

export function Features() {
  return (
    <section id="features" className="relative z-10 py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest block mb-2 font-mono">
            Enterprise Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            8 Core GRC Modules
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-2">
            Engineered to reflect enterprise-grade governance standards and internal audit methodologies.
          </p>
        </div>

        {/* Grid 4 Columns on Desktop, 2 on Tablet, 1 on Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {coreFeatures.map((feat) => (
            <div
              key={feat.title}
              className="glass-card glass-card-hover p-5 sm:p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden group"
            >
              {/* Top border shimmer */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-[#4ADE80]">
                    <feat.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/5">
                    {feat.tag}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white tracking-tight mb-2">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {feat.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>Synthetic Model</span>
                <span className="text-emerald-400 group-hover:translate-x-0.5 transition-transform">Explore →</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
