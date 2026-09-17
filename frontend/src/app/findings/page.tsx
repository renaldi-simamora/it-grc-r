'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Loader2, AlertCircle, Wrench } from 'lucide-react';
import { api } from '@/lib/api';
import { getRiskLevelColor, getStatusColor, formatDate } from '@/utils/helpers';
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
import type { Finding, Risk, Control, FindingSeverity, FindingStatus, ApiResponse } from '@/types';

const severityOptions = [
  { value: 'CRITICAL', label: 'Critical' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

const statusOptions = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'VERIFIED', label: 'Verified' },
  { value: 'CLOSED', label: 'Closed' },
];

const emptyForm = {
  title: '',
  description: '',
  risk_id: '',
  control_id: '',
  severity: 'HIGH' as FindingSeverity,
  recommendation: '',
  owner: '',
  due_date: '',
  status: 'OPEN' as FindingStatus,
};

export default function FindingsPage() {
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'GRC_OFFICER';
  const canDelete = user?.role === 'ADMIN';

  const [findings, setFindings] = useState<Finding[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [controls, setControls] = useState<Control[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modals
  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState<any | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const isEditing = !!selectedFinding && formOpen;

  const fetchFindings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (search) params.set('search', search);
      if (filterSeverity) params.set('severity', filterSeverity);
      if (filterStatus) params.set('status', filterStatus);

      const [findRes, risksRes, ctlRes] = await Promise.all([
        api.get<ApiResponse<Finding[]>>(`/findings?${params}`),
        api.get<ApiResponse<Risk[]>>('/risks?limit=100'),
        api.get<ApiResponse<Control[]>>('/controls?limit=100'),
      ]);

      setFindings(findRes.data ?? []);
      setTotalPages(findRes.pagination?.totalPages ?? 1);
      setRisks(risksRes.data ?? []);
      setControls(ctlRes.data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load findings');
    } finally {
      setLoading(false);
    }
  }, [page, search, filterSeverity, filterStatus]);

  useEffect(() => {
    fetchFindings();
  }, [fetchFindings]);

  useEffect(() => {
    setPage(1);
  }, [search, filterSeverity, filterStatus]);

  function openCreate() {
    setSelectedFinding(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEdit(f: Finding) {
    setSelectedFinding(f);
    setForm({
      title: f.title,
      description: f.description ?? '',
      risk_id: f.risk_id ?? '',
      control_id: f.control_id ?? '',
      severity: f.severity,
      recommendation: f.recommendation ?? '',
      owner: f.owner ?? '',
      due_date: f.due_date ? f.due_date.split('T')[0] : '',
      status: f.status,
    });
    setFormOpen(true);
  }

  async function openView(f: Finding) {
    try {
      const res = await api.get<ApiResponse<any>>(`/findings/${f.id}`);
      setSelectedFinding(res.data);
      setViewOpen(true);
    } catch {
      setSelectedFinding(f);
      setViewOpen(true);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = {
        ...form,
        risk_id: form.risk_id || null,
        control_id: form.control_id || null,
        description: form.description || null,
        recommendation: form.recommendation || null,
        owner: form.owner || null,
        due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
      };

      if (isEditing) {
        await api.put(`/findings/${selectedFinding!.id}`, body);
      } else {
        await api.post('/findings', body);
      }
      setFormOpen(false);
      setSelectedFinding(null);
      fetchFindings();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to save finding');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(f: Finding) {
    if (!window.confirm(`Delete finding "${f.finding_code} — ${f.title}"?`)) return;
    try {
      await api.delete(`/findings/${f.id}`);
      fetchFindings();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete finding');
    }
  }

  const columns = [
    {
      key: 'finding_code',
      title: 'Finding ID',
      render: (f: Finding) => (
        <span className="font-mono text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-800 border border-slate-200">
          {f.finding_code}
        </span>
      ),
    },
    {
      key: 'title',
      title: 'Finding / Control Gap',
      render: (f: Finding) => (
        <div>
          <p className="font-semibold text-slate-900 line-clamp-1">{f.title}</p>
          {f.description && <p className="text-xs text-slate-500 truncate max-w-sm">{f.description}</p>}
        </div>
      ),
    },
    {
      key: 'severity',
      title: 'Severity',
      render: (f: Finding) => (
        <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold ${getRiskLevelColor(f.severity)}`}>
          {f.severity}
        </span>
      ),
    },
    {
      key: 'due_date',
      title: 'Due Date',
      render: (f: Finding) => (
        <span className="text-xs text-slate-600 font-medium">
          {f.due_date ? formatDate(f.due_date) : 'No deadline'}
        </span>
      ),
    },
    {
      key: 'owner',
      title: 'Owner',
      render: (f: Finding) => <span className="text-xs text-slate-700">{f.owner || '—'}</span>,
    },
    {
      key: 'status',
      title: 'Status',
      render: (f: Finding) => (
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${getStatusColor(f.status)}`}>
          {f.status.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'actions',
      title: '',
      render: (f: Finding) => (
        <div className="flex items-center gap-1 justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openView(f);
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
                openEdit(f);
              }}
              className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50"
              title="Edit Finding"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(f);
              }}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
              title="Delete Finding"
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Findings &amp; Gap Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track control deficiencies, vulnerability audit findings, and non-conformities
          </p>
        </div>
        {canEdit && (
          <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Log Finding
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search finding code, title, owner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            options={[{ value: '', label: 'All Severities' }, ...severityOptions]}
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
          />
          <Select
            options={[{ value: '', label: 'All Statuses' }, ...statusOptions]}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          />
        </div>
      </Card>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      ) : findings.length === 0 ? (
        <EmptyState
          title="No findings logged"
          description="Log control gaps or audit non-conformities identified during assessments."
          icon={<AlertCircle className="w-12 h-12 text-slate-400" />}
          action={
            canEdit ? (
              <Button onClick={openCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Log Finding
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Card padding={false}>
          <Table<Finding> columns={columns} data={findings} keyExtractor={(f) => f.id} />
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Showing page {page} of {totalPages}
            </p>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </Card>
      )}

      {/* Create / Edit Modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={isEditing ? `Edit Finding: ${selectedFinding?.finding_code}` : 'Log New Audit Finding / Gap'}
        className="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Finding Title"
            required
            placeholder="e.g. Disaster Recovery Cold Storage Restoration Drill Overdue"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Related Mitigating Control"
              options={[{ value: '', label: 'None / General Gap' }, ...controls.map((c) => ({ value: c.id, label: `${c.control_code} — ${c.name}` }))]}
              value={form.control_id}
              onChange={(e) => setForm({ ...form, control_id: e.target.value })}
            />
            <Select
              label="Related Risk Threat"
              options={[{ value: '', label: 'None / Operational' }, ...risks.map((r) => ({ value: r.id, label: `${r.risk_code}: ${r.title}` }))]}
              value={form.risk_id}
              onChange={(e) => setForm({ ...form, risk_id: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Severity"
              options={severityOptions}
              value={form.severity}
              onChange={(e) => setForm({ ...form, severity: e.target.value as FindingSeverity })}
            />
            <Select
              label="Status"
              options={statusOptions}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as FindingStatus })}
            />
            <Input
              label="Target Due Date"
              type="date"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            />
          </div>

          <Input
            label="Responsible Owner"
            placeholder="e.g. Budi Santoso"
            value={form.owner}
            onChange={(e) => setForm({ ...form, owner: e.target.value })}
          />

          <Textarea
            label="Finding Description &amp; Audit Evidence Observed"
            placeholder="Detailed description of the observed gap..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
          />

          <Textarea
            label="Auditor Recommendation"
            placeholder="Recommended remediation steps..."
            value={form.recommendation}
            onChange={(e) => setForm({ ...form, recommendation: e.target.value })}
            rows={2}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {isEditing ? 'Save Changes' : 'Log Finding'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Details Modal */}
      <Modal
        open={viewOpen}
        onClose={() => {
          setViewOpen(false);
          setSelectedFinding(null);
        }}
        title={`Finding Details: ${selectedFinding?.finding_code || ''}`}
        className="max-w-2xl"
      >
        {selectedFinding && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-400 font-mono">
                  {selectedFinding.finding_code}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{selectedFinding.title}</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Owner: <strong>{selectedFinding.owner || 'Unassigned'}</strong> • Due:{' '}
                  <strong>{selectedFinding.due_date ? formatDate(selectedFinding.due_date) : 'None'}</strong>
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold ${getRiskLevelColor(selectedFinding.severity)}`}>
                  {selectedFinding.severity}
                </span>
                <Badge className={getStatusColor(selectedFinding.status)}>{selectedFinding.status}</Badge>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Gap Description</p>
              <p className="text-sm text-slate-800 p-3 bg-slate-50 rounded-lg border border-slate-200">
                {selectedFinding.description || 'No description recorded.'}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Recommendation</p>
              <p className="text-sm text-slate-800 p-3 bg-slate-50 rounded-lg border border-slate-200">
                {selectedFinding.recommendation || 'No recommendation documented.'}
              </p>
            </div>

            {selectedFinding.remediations && selectedFinding.remediations.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Remediation Actions ({selectedFinding.remediations.length})
                </p>
                <div className="space-y-2">
                  {selectedFinding.remediations.map((rem: any) => (
                    <div key={rem.id} className="p-3 bg-white border border-slate-200 rounded-lg text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="font-semibold text-slate-900">{rem.action}</p>
                          <p className="text-[11px] text-slate-400">Owner: {rem.owner || '—'} • Due: {formatDate(rem.due_date)}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(rem.status)}>{rem.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setViewOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
