'use client';

import React from 'react';
import {
  Server,
  AlertTriangle,
  Shield,
  ClipboardCheck,
  FileText,
  Search,
  Wrench,
  CheckSquare,
  BarChart3,
  ChevronRight,
} from 'lucide-react';

const workflowSteps = [
  { step: '01', title: 'Asset', desc: 'Catalog hardware, DB, cloud & apps', icon: Server },
  { step: '02', title: 'Risk', desc: '5×5 Threat Scoring (L × I)', icon: AlertTriangle },
  { step: '03', title: 'Control', desc: 'ISO 27001 & NIST mapping', icon: Shield },
  { step: '04', title: 'Assessment', desc: 'Multi-item checklist audit', icon: ClipboardCheck },
  { step: '05', title: 'Evidence', desc: 'Secure artifact verification', icon: FileText },
  { step: '06', title: 'Finding', desc: 'Log gaps & non-conformities', icon: Search },
  { step: '07', title: 'Remediation', desc: 'Corrective plans & overdue check', icon: Wrench },
  { step: '08', title: 'Compliance', desc: 'Domain adherence percentage', icon: CheckSquare },
  { step: '09', title: 'Reports', desc: 'Formal executive audit reports', icon: BarChart3 },
];

export function GRCWorkflow() {
  return (
    <section id="workflow" className="relative z-10 py-14 border-y border-white/[0.06] bg-[#050912]/70 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest block mb-2 font-mono">
            Structured IT Governance Lifecycle
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            From Risk Identification to Remediation
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            A cohesive 9-step governance pipeline simulating enterprise operational resilience.
          </p>
        </div>

        {/* 9-Step Horizontal Pipeline (Scrollable on mobile, grid on desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-3">
          {workflowSteps.map((item, idx) => (
            <div
              key={item.step}
              className="relative p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.08] hover:border-emerald-500/30 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold text-emerald-400/80 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    {item.step}
                  </span>
                  <item.icon className="w-4 h-4 text-slate-400 group-hover:text-[#4ADE80] transition-colors" />
                </div>
                <h3 className="text-xs font-bold text-white tracking-tight mb-1">
                  {item.title}
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              {idx < workflowSteps.length - 1 && (
                <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
