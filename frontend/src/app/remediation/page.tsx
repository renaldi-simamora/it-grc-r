'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, CheckCircle2, Clock, AlertTriangle, Loader2, Wrench } from 'lucide-react';
import { api } from '@/lib/api';
import { getStatusColor, formatDate } from '@/utils/helpers';
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
import type { Remediation, Finding, RemediationStatus, ApiResponse } from '@/types';

const statusFilterOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'OVERDUE', label: 'Overdue' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'VERIFIED', label: 'Verified' },
];

const emptyForm = {
  finding_id: '',
  action: '',
  owner: '',
  due_date: '',
  status: 'OPEN' as RemediationStatus,
  completion_notes: '',
};

export default function RemediationPage() {
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'GRC_OFFICER';

  const [remediations, setRemediations] = useState<Remediation[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modals
  const [formOpen, setFormOpen] = useState(false);
  const [selectedRem, setSelectedRem] = useState<Remediation | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const isEditing = !!selectedRem && formOpen;

  const fetchRemediations = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (search) params.set('search', search);
      if (filterStatus) params.set('status', filterStatus);

      const [remRes, findRes] = await Promise.all([
        api.get<ApiResponse<Remediation[]>>(`/remediations?${params}`),
        api.get<ApiResponse<Finding[]>>('/findings?limit=100'),
      ]);

      setRemediations(remRes.data ?? []);
      setTotalPages(remRes.pagination?.totalPages ?? 1);
      setFindings(findRes.data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load remediations');
    } finally {
      setLoading(false);
    }
  }, [page, search, filterStatus]);

  useEffect(() => {
    fetchRemediations();
  }, [fetchRemediations]);

  useEffect(() => {
    setPage(1);
  }, [search, filterStatus]);

  function openCreate() {
    setSelectedRem(null);
    setForm({
      ...emptyForm,
      finding_id: findings[0]?.id || '',
    });
    setFormOpen(true);
  }

  function openEdit(rem: Remediation) {
    setSelectedRem(rem);
    setForm({
      finding_id: rem.finding_id,
      action: rem.action,
      owner: rem.owner ?? '',
      due_date: rem.due_date ? rem.due_date.split('T')[0] : '',
      status: rem.status,
      completion_notes: rem.completion_notes ?? '',
    });
    setFormOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = {
        ...form,
        owner: form.owner || null,
        due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
        completion_notes: form.completion_notes || null,
      };

      if (isEditing) {
        await api.put(`/remediations/${selectedRem!.id}`, body);
      } else {
        await api.post('/remediations', body);
      }
      setFormOpen(false);
      setSelectedRem(null);
      fetchRemediations();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to save remediation action');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(rem: Remediation) {
    if (!window.confirm(`Delete remediation "${rem.action}"?`)) return;
    try {
      await api.delete(`/remediations/${rem.id}`);
      fetchRemediations();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete remediation');
    }
  }

  const columns = [
    {
      key: 'action',
      title: 'Remediation Action',
      render: (r: Remediation) => (
        <div>
          <p className="font-semibold text-slate-900 line-clamp-1">{r.action}</p>
          {r.completion_notes && (
            <p className="text-xs text-slate-500 truncate max-w-sm mt-0.5">Notes: {r.completion_notes}</p>
          )}
        </div>
      ),
    },
    {
      key: 'finding',
      title: 'Target Finding Gap',
      render: (r: any) => (
        <span className="text-xs font-medium text-slate-700">
          {r.finding ? `${r.finding.finding_code}: ${r.finding.title}` : findings.find((f) => f.id === r.finding_id)?.title || '—'}
        </span>
      ),
    },
    {
      key: 'owner',
      title: 'Responsible Owner',
      render: (r: Remediation) => <span className="text-xs text-slate-700">{r.owner || '—'}</span>,
    },
    {
      key: 'due_date',
      title: 'Due Date',
      render: (r: Remediation) => (
        <div className="flex items-center gap-1.5 text-xs">
          {r.status === 'OVERDUE' && <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
          <span className={r.status === 'OVERDUE' ? 'text-rose-600 font-bold' : 'text-slate-600'}>
            {r.due_date ? formatDate(r.due_date) : 'No due date'}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (r: Remediation) => (
        <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold ${getStatusColor(r.status)}`}>
          {r.status.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'actions',
      title: '',
      render: (r: Remediation) => (
        <div className="flex items-center gap-1 justify-end">
          {canEdit && (
            <button
              onClick={() => openEdit(r)}
              className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50"
              title="Edit Remediation"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {user?.role === 'ADMIN' && (
            <button
              onClick={() => handleDelete(r)}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
              title="Delete Remediation"
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Remediation Action Tracking</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage corrective action plans, assigned milestones, and overdue resolution timelines
          </p>
        </div>
        {canEdit && (
          <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Remediation Plan
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search action, owner, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            options={statusFilterOptions}
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
      ) : remediations.length === 0 ? (
        <EmptyState
          title="No remediations found"
          description="Create a corrective action plan for open findings."
          icon={<Wrench className="w-12 h-12 text-slate-400" />}
          action={
            canEdit ? (
              <Button onClick={openCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Add Action
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Card padding={false}>
          <Table<Remediation> columns={columns} data={remediations} keyExtractor={(r) => r.id} />
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
        title={isEditing ? 'Update Remediation Action' : 'Create Remediation Plan'}
        className="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Associated Audit Finding / Gap"
            required
            options={findings.map((f) => ({ value: f.id, label: `${f.finding_code}: ${f.title} (${f.severity})` }))}
            value={form.finding_id}
            onChange={(e) => setForm({ ...form, finding_id: e.target.value })}
          />

          <Textarea
            label="Corrective Remediation Action"
            required
            placeholder="Document the exact technical or process steps required to close this finding..."
            value={form.action}
            onChange={(e) => setForm({ ...form, action: e.target.value })}
            rows={2}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Assigned Owner"
              placeholder="e.g. Budi Santoso"
              value={form.owner}
              onChange={(e) => setForm({ ...form, owner: e.target.value })}
            />
            <Input
              label="Target Due Date"
              type="date"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            />
            <Select
              label="Current Status"
              options={[
                { value: 'OPEN', label: 'OPEN' },
                { value: 'IN_PROGRESS', label: 'IN PROGRESS' },
                { value: 'COMPLETED', label: 'COMPLETED' },
                { value: 'OVERDUE', label: 'OVERDUE' },
                { value: 'VERIFIED', label: 'VERIFIED' },
              ]}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as RemediationStatus })}
            />
          </div>

          <Textarea
            label="Completion Notes / Evidence Verification"
            placeholder="Document progress updates, test results, or verification comments..."
            value={form.completion_notes}
            onChange={(e) => setForm({ ...form, completion_notes: e.target.value })}
            rows={2}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {isEditing ? 'Save Changes' : 'Create Remediation'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
