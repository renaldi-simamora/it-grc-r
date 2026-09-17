'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckSquare, ShieldCheck, AlertCircle, Loader2, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';
import { api } from '@/lib/api';
import { getStatusColor, formatDate } from '@/utils/helpers';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import type { ComplianceItem, ComplianceCategory, AssessmentStatus, ApiResponse } from '@/types';

export default function CompliancePage() {
  const { user } = useAuth();
  const canUpdate = user?.role === 'ADMIN' || user?.role === 'GRC_OFFICER';

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Item Edit Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ComplianceItem | null>(null);
  const [status, setStatus] = useState<AssessmentStatus>('COMPLIANT');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCompliance = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const url = selectedCategory ? `/compliance?category=${encodeURIComponent(selectedCategory)}` : '/compliance';
      const res = await api.get<ApiResponse<any>>(url);
      setData(res.data ?? null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load compliance data');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchCompliance();
  }, [fetchCompliance]);

  function openEdit(item: ComplianceItem) {
    setSelectedItem(item);
    setStatus(item.status);
    setNotes(item.notes || '');
    setEditModalOpen(true);
  }

  async function handleSaveItem(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedItem) return;
    setSubmitting(true);
    try {
      await api.put(`/compliance/${selectedItem.id}`, {
        status,
        notes,
      });
      setEditModalOpen(false);
      fetchCompliance();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update compliance item');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">IT Compliance Assessment</h1>
          <p className="text-sm text-slate-500 mt-1">
            Simulated framework monitoring across 7 enterprise IT governance security domains
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-800 uppercase tracking-wide">
            Internal Simulation
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      ) : (
        data && (
          <div className="space-y-6">
            {/* Top Overview Card */}
            <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl shadow-xl border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-wider font-bold text-blue-400">
                  PT Nusantara Digital • Compliance Posture
                </span>
                <h2 className="text-3xl font-black tracking-tight text-white">
                  {data.overall_compliance_rate}% Compliance Rating
                </h2>
                <p className="text-xs text-slate-300 max-w-xl">
                  Evaluated across {data.total_items} security requirements ({data.applicable_items} applicable).
                  Formula: (Completed Applicable Controls / Total Applicable Controls) × 100%.
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center bg-slate-800/80 px-4 py-3 rounded-xl border border-slate-700/60">
                  <span className="text-xs text-slate-400 block uppercase">Compliant</span>
                  <span className="text-2xl font-bold font-mono text-emerald-400">{data.compliant_items}</span>
                </div>
                <div className="text-center bg-slate-800/80 px-4 py-3 rounded-xl border border-slate-700/60">
                  <span className="text-xs text-slate-400 block uppercase">Incomplete</span>
                  <span className="text-2xl font-bold font-mono text-rose-400">
                    {data.incomplete_items?.length || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Category Cards Grid */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3">
                Domain Compliance Breakdown
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(data.category_breakdown || {}).map(([catName, stats]: [string, any]) => (
                  <Card
                    key={catName}
                    className={`cursor-pointer hover:border-blue-500 transition-all ${
                      selectedCategory === catName ? 'ring-2 ring-blue-500 bg-blue-50/20' : ''
                    }`}
                    onClick={() => setSelectedCategory(selectedCategory === catName ? '' : catName)}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{catName}</h4>
                        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          {stats.rate}%
                        </span>
                      </div>

                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            stats.rate >= 90 ? 'bg-emerald-500' : stats.rate >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${stats.rate}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>{stats.compliant} Compliant</span>
                        <span>{stats.non_compliant + stats.partially_compliant} Gaps</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Checklist Table */}
            <Card padding={false}>
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {selectedCategory ? `${selectedCategory} Checklist` : 'All Compliance Requirements'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Showing {data.items.length} criteria items
                  </p>
                </div>
                {selectedCategory && (
                  <Button variant="outline" size="sm" onClick={() => setSelectedCategory('')}>
                    Show All Categories
                  </Button>
                )}
              </div>

              <div className="divide-y divide-slate-100">
                {data.items.map((item: ComplianceItem) => (
                  <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50">
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{item.title}</span>
                        <span className="text-xs text-slate-400 font-mono">[{item.category}]</span>
                      </div>
                      <p className="text-xs text-slate-600">{item.description}</p>
                      {item.notes && (
                        <p className="text-[11px] text-blue-700 bg-blue-50 px-2.5 py-1 rounded inline-block mt-1">
                          Auditor Note: {item.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-semibold ${getStatusColor(item.status)}`}>
                        {item.status.replace('_', ' ')}
                      </span>
                      {canUpdate && (
                        <Button variant="outline" size="sm" onClick={() => openEdit(item)} className="text-xs h-7">
                          Update
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )
      )}

      {/* Update Modal */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Update Compliance Assessment Status"
        className="max-w-lg"
      >
        {selectedItem && (
          <form onSubmit={handleSaveItem} className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="font-bold text-sm text-slate-900">{selectedItem.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{selectedItem.category}</p>
            </div>

            <Select
              label="Evaluation Status"
              options={[
                { value: 'COMPLIANT', label: 'COMPLIANT' },
                { value: 'PARTIALLY_COMPLIANT', label: 'PARTIALLY COMPLIANT' },
                { value: 'NON_COMPLIANT', label: 'NON COMPLIANT' },
                { value: 'NOT_APPLICABLE', label: 'NOT APPLICABLE' },
              ]}
              value={status}
              onChange={(e) => setStatus(e.target.value as AssessmentStatus)}
            />

            <Textarea
              label="Auditor Justification &amp; Notes"
              placeholder="Record supporting evidence reference or reason for partial compliance..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                Save Assessment
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
