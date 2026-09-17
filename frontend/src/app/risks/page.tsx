'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Loader2, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { getRiskLevelColor, getStatusColor, calculateRiskScore, formatDate } from '@/utils/helpers';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { Textarea } from '@/components/ui/Textarea';
import { Table } from '@/components/ui/Table';
import type { Risk, Asset, RiskLevel, RiskStatus, RiskCategory, ApiResponse } from '@/types';

const categoryOptions = [
  { value: 'Access Control', label: 'Access Control' },
  { value: 'Data Security', label: 'Data Security' },
  { value: 'Availability', label: 'Availability' },
  { value: 'Infrastructure', label: 'Infrastructure' },
  { value: 'Application Security', label: 'Application Security' },
  { value: 'Compliance', label: 'Compliance' },
  { value: 'Operational', label: 'Operational' },
  { value: 'Third Party', label: 'Third Party' },
  { value: 'Other', label: 'Other' },
];

const levelOptions = [
  { value: 'CRITICAL', label: 'Critical (17-25)' },
  { value: 'HIGH', label: 'High (10-16)' },
  { value: 'MEDIUM', label: 'Medium (5-9)' },
  { value: 'LOW', label: 'Low (1-4)' },
];

const statusOptions = [
  { value: 'OPEN', label: 'Open' },
  { value: 'MITIGATED', label: 'Mitigated' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'CLOSED', label: 'Closed' },
];

const likelihoodScale = [
  { value: '1', label: '1 — Rare' },
  { value: '2', label: '2 — Unlikely' },
  { value: '3', label: '3 — Possible' },
  { value: '4', label: '4 — Likely' },
  { value: '5', label: '5 — Almost Certain' },
];

const impactScale = [
  { value: '1', label: '1 — Insignificant' },
  { value: '2', label: '2 — Minor' },
  { value: '3', label: '3 — Moderate' },
  { value: '4', label: '4 — Major' },
  { value: '5', label: '5 — Severe' },
];

const emptyForm = {
  title: '',
  asset_id: '',
  category: 'Access Control' as RiskCategory,
  description: '',
  likelihood: 3,
  impact: 3,
  existing_mitigation: '',
  recommendation: '',
  status: 'OPEN' as RiskStatus,
  owner: '',
};

export default function RisksPage() {
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'GRC_OFFICER';
  const canDelete = user?.role === 'ADMIN';

  const [risks, setRisks] = useState<Risk[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modals
  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<any | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  // Live calculated score in form preview
  const liveCalculation = calculateRiskScore(form.likelihood, form.impact);

  const isEditing = !!selectedRisk && formOpen;

  const fetchRisks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (search) params.set('search', search);
      if (filterCategory) params.set('category', filterCategory);
      if (filterLevel) params.set('risk_level', filterLevel);
      if (filterStatus) params.set('status', filterStatus);

      const [risksRes, assetsRes] = await Promise.all([
        api.get<ApiResponse<Risk[]>>(`/risks?${params}`),
        api.get<ApiResponse<Asset[]>>('/assets?limit=100'),
      ]);

      setRisks(risksRes.data ?? []);
      setTotalPages(risksRes.pagination?.totalPages ?? 1);
      setAssets(assetsRes.data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load risks');
    } finally {
      setLoading(false);
    }
  }, [page, search, filterCategory, filterLevel, filterStatus]);

  useEffect(() => {
    fetchRisks();
  }, [fetchRisks]);

  useEffect(() => {
    setPage(1);
  }, [search, filterCategory, filterLevel, filterStatus]);

  function openCreate() {
    setSelectedRisk(null);
    setForm({
      ...emptyForm,
      asset_id: assets[0]?.id || '',
    });
    setFormOpen(true);
  }

  function openEdit(risk: Risk) {
    setSelectedRisk(risk);
    setForm({
      title: risk.title,
      asset_id: risk.asset_id,
      category: risk.category as RiskCategory,
      description: risk.description ?? '',
      likelihood: risk.likelihood,
      impact: risk.impact,
      existing_mitigation: risk.existing_mitigation ?? '',
      recommendation: risk.recommendation ?? '',
      status: risk.status,
      owner: risk.owner ?? '',
    });
    setFormOpen(true);
  }

  async function openView(risk: Risk) {
    try {
      const res = await api.get<ApiResponse<any>>(`/risks/${risk.id}`);
      setSelectedRisk(res.data);
      setViewOpen(true);
    } catch {
      setSelectedRisk(risk);
      setViewOpen(true);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = {
        ...form,
        likelihood: Number(form.likelihood),
        impact: Number(form.impact),
        description: form.description || null,
        existing_mitigation: form.existing_mitigation || null,
        recommendation: form.recommendation || null,
        owner: form.owner || null,
      };

      if (isEditing) {
        await api.put(`/risks/${selectedRisk!.id}`, body);
      } else {
        await api.post('/risks', body);
      }
      setFormOpen(false);
      setSelectedRisk(null);
      fetchRisks();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to save risk assessment');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(risk: Risk) {
    if (!window.confirm(`Delete risk "${risk.risk_code} — ${risk.title}"?`)) return;
    try {
      await api.delete(`/risks/${risk.id}`);
      fetchRisks();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete risk');
    }
  }

  const columns = [
    {
      key: 'risk_code',
      title: 'Risk ID',
      render: (r: Risk) => (
        <span className="font-mono text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-800 border border-slate-200">
          {r.risk_code}
        </span>
      ),
    },
    {
      key: 'title',
      title: 'Risk Description',
      render: (r: Risk) => (
        <div>
          <p className="font-semibold text-slate-900 line-clamp-1">{r.title}</p>
          <p className="text-xs text-slate-400 mt-0.5">{r.category}</p>
        </div>
      ),
    },
    {
      key: 'asset',
      title: 'Associated Asset',
      render: (r: Risk) => (
        <span className="text-xs font-medium text-slate-700">
          {r.asset ? r.asset.name : assets.find((a) => a.id === r.asset_id)?.name || '—'}
        </span>
      ),
    },
    {
      key: 'scoring',
      title: 'L × I = Score',
      render: (r: Risk) => (
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span className="text-slate-600 font-semibold">{r.likelihood}</span>
          <span className="text-slate-400">×</span>
          <span className="text-slate-600 font-semibold">{r.impact}</span>
          <span className="text-slate-400">=</span>
          <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
            {r.risk_score}
          </span>
        </div>
      ),
    },
    {
      key: 'risk_level',
      title: 'Level',
      render: (r: Risk) => (
        <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold ${getRiskLevelColor(r.risk_level)}`}>
          {r.risk_level}
        </span>
      ),
    },
    {
      key: 'owner',
      title: 'Risk Owner',
      render: (r: Risk) => <span className="text-xs text-slate-700">{r.owner || '—'}</span>,
    },
    {
      key: 'status',
      title: 'Status',
      render: (r: Risk) => (
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${getStatusColor(r.status)}`}>
          {r.status}
        </span>
      ),
    },
    {
      key: 'actions',
      title: '',
      render: (r: Risk) => (
        <div className="flex items-center gap-1 justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openView(r);
            }}
            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          {canEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEdit(r);
              }}
              className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50"
              title="Edit Assessment"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(r);
              }}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
              title="Delete Risk"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Risk Assessment &amp; Risk Register</h1>
          <p className="text-sm text-slate-500 mt-1">
            Evaluate, score, and track threat scenarios linked to organizational assets
          </p>
        </div>
        {canEdit && (
          <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Assess New Risk
          </Button>
        )}
      </div>

      {/* Filters Card */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search risk, code, owner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            options={[{ value: '', label: 'All Categories' }, ...categoryOptions]}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          />
          <Select
            options={[{ value: '', label: 'All Risk Levels' }, ...levelOptions]}
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
          />
          <Select
            options={[{ value: '', label: 'All Statuses' }, ...statusOptions]}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          />
        </div>
      </Card>

      {/* Content Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-rose-600 mb-2">{error}</p>
            <button onClick={fetchRisks} className="text-blue-600 hover:underline text-sm font-semibold">
              Retry
            </button>
          </div>
        </div>
      ) : risks.length === 0 ? (
        <EmptyState
          title="No risks recorded"
          description="Assess and log your first risk scenario."
          icon={<AlertTriangle className="w-12 h-12 text-slate-400" />}
          action={
            canEdit ? (
              <Button onClick={openCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Assess Risk
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Card padding={false}>
          <Table<Risk> columns={columns} data={risks} keyExtractor={(r) => r.id} />
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Showing page {page} of {totalPages}
            </p>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </Card>
      )}

      {/* Create / Edit Risk Assessment Modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={isEditing ? `Edit Risk Assessment: ${selectedRisk?.risk_code}` : 'Perform New Risk Assessment'}
        className="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <Input
              label="Risk Title"
              required
              placeholder="e.g. Unauthorized Database Access via Stale Credentials"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Target IT Asset"
                required
                options={assets.map((a) => ({ value: a.id, label: `${a.asset_code} — ${a.name}` }))}
                value={form.asset_id}
                onChange={(e) => setForm({ ...form, asset_id: e.target.value })}
              />
              <Select
                label="Risk Category"
                options={categoryOptions}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as RiskCategory })}
              />
            </div>

            {/* Matrix Scoring Panel (Automatic calculation with live feedback) */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Risk Scoring Methodology (5 × 5 Matrix)
                </span>
                <span className="text-[11px] text-slate-500">System Auto-Calculation</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Likelihood (1–5)"
                  options={likelihoodScale}
                  value={String(form.likelihood)}
                  onChange={(e) => setForm({ ...form, likelihood: Number(e.target.value) })}
                />
                <Select
                  label="Impact (1–5)"
                  options={impactScale}
                  value={String(form.impact)}
                  onChange={(e) => setForm({ ...form, impact: Number(e.target.value) })}
                />
              </div>

              {/* Automatic live score and level badge preview */}
              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-xs text-slate-500">Calculated Score Formula:</span>
                  <p className="font-mono text-sm font-bold text-slate-900 mt-0.5">
                    {form.likelihood} (Likelihood) × {form.impact} (Impact) ={' '}
                    <span className="text-blue-600 text-base">{liveCalculation.score}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block mb-1">Assigned Level:</span>
                  <span
                    className={`inline-block px-3 py-1 rounded-md text-xs font-black tracking-wider ${getRiskLevelColor(
                      liveCalculation.level
                    )}`}
                  >
                    {liveCalculation.level}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Risk Owner / Assigned Custodian"
                placeholder="e.g. Budi Santoso"
                value={form.owner}
                onChange={(e) => setForm({ ...form, owner: e.target.value })}
              />
              <Select
                label="Current Risk Status"
                options={statusOptions}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as RiskStatus })}
              />
            </div>

            <Textarea
              label="Risk Threat Scenario Description"
              placeholder="Describe the vulnerability, threat actor, and potential organizational consequences..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Textarea
                label="Existing Mitigation Controls"
                placeholder="Controls currently in place..."
                value={form.existing_mitigation}
                onChange={(e) => setForm({ ...form, existing_mitigation: e.target.value })}
                rows={2}
              />
              <Textarea
                label="Audit Recommendations"
                placeholder="Recommended technical or procedural treatments..."
                value={form.recommendation}
                onChange={(e) => setForm({ ...form, recommendation: e.target.value })}
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {isEditing ? 'Update Risk' : 'Save Risk Assessment'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Detailed Risk 360-Degree View Modal */}
      <Modal
        open={viewOpen}
        onClose={() => {
          setViewOpen(false);
          setSelectedRisk(null);
        }}
        title={`Risk 360° Overview — ${selectedRisk?.risk_code || ''}`}
        className="max-w-3xl"
      >
        {selectedRisk && (
          <div className="space-y-5">
            {/* Top Score Banner */}
            <div className="p-4 bg-slate-900 text-white rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-400 font-mono">
                  {selectedRisk.risk_code} • {selectedRisk.category}
                </span>
                <h3 className="text-base font-bold text-white mt-1">{selectedRisk.title}</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Target Asset:{' '}
                  <strong>{selectedRisk.asset?.name || selectedRisk.asset_name || 'N/A'}</strong>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
                  <span className="text-[10px] text-slate-400 block uppercase">Score</span>
                  <span className="font-mono text-lg font-bold text-white">{selectedRisk.risk_score}</span>
                </div>
                <div className="text-center px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
                  <span className="text-[10px] text-slate-400 block uppercase">Level</span>
                  <span className={`inline-block text-xs font-bold ${getRiskLevelColor(selectedRisk.risk_level)} px-2 py-0.5 rounded`}>
                    {selectedRisk.risk_level}
                  </span>
                </div>
              </div>
            </div>

            {/* Description & Treatment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</p>
                  <p className="text-sm text-slate-800 mt-1 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    {selectedRisk.description || 'No description recorded.'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Existing Controls</p>
                  <p className="text-sm text-slate-800 mt-1 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    {selectedRisk.existing_mitigation || 'None documented.'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recommendations</p>
                  <p className="text-sm text-slate-800 mt-1 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    {selectedRisk.recommendation || 'None documented.'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block">Owner</span>
                    <span className="font-semibold text-slate-900 mt-0.5 block">{selectedRisk.owner || '—'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block">Status</span>
                    <span className="font-semibold text-slate-900 mt-0.5 block">{selectedRisk.status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Associated Controls & Findings */}
            {selectedRisk.controls && selectedRisk.controls.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Linked Mitigating Controls ({selectedRisk.controls.length})
                </p>
                <div className="space-y-2">
                  {selectedRisk.controls.map((ctl: any) => (
                    <div key={ctl.id} className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                        <div>
                          <span className="font-mono font-bold text-slate-900 mr-2">{ctl.control_code}</span>
                          <span className="font-medium text-slate-800">{ctl.name}</span>
                        </div>
                      </div>
                      <Badge className={getStatusColor(ctl.implementation_status)}>
                        {ctl.implementation_status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-100 pt-3">
              <span>Logged: {formatDate(selectedRisk.created_at)}</span>
              <Button
                variant="outline"
                onClick={() => {
                  setViewOpen(false);
                  setSelectedRisk(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
