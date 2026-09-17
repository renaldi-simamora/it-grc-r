'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Loader2, ShieldCheck, ClipboardCheck } from 'lucide-react';
import Link from 'next/link';
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
import type { Control, Risk, ControlFrequency, ImplementationStatus, ControlEffectiveness, ApiResponse } from '@/types';

const frequencyOptions = [
  { value: 'Continuous', label: 'Continuous' },
  { value: 'Daily', label: 'Daily' },
  { value: 'Weekly', label: 'Weekly' },
  { value: 'Monthly', label: 'Monthly' },
  { value: 'Quarterly', label: 'Quarterly' },
  { value: 'Semi-Annual', label: 'Semi-Annual' },
  { value: 'Annual', label: 'Annual' },
  { value: 'Ad Hoc', label: 'Ad Hoc' },
];

const implementationOptions = [
  { value: 'IMPLEMENTED', label: 'Implemented' },
  { value: 'PARTIALLY_IMPLEMENTED', label: 'Partially Implemented' },
  { value: 'NOT_IMPLEMENTED', label: 'Not Implemented' },
  { value: 'NOT_APPLICABLE', label: 'Not Applicable' },
];

const effectivenessOptions = [
  { value: 'EFFECTIVE', label: 'Effective' },
  { value: 'PARTIALLY_EFFECTIVE', label: 'Partially Effective' },
  { value: 'INEFFECTIVE', label: 'Ineffective' },
  { value: 'NOT_ASSESSED', label: 'Not Assessed' },
];

const emptyForm = {
  name: '',
  description: '',
  risk_id: '',
  owner: '',
  frequency: 'Monthly' as ControlFrequency,
  implementation_status: 'NOT_IMPLEMENTED' as ImplementationStatus,
  effectiveness: 'NOT_ASSESSED' as ControlEffectiveness,
};

export default function ControlsPage() {
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'GRC_OFFICER';
  const canDelete = user?.role === 'ADMIN';

  const [controls, setControls] = useState<Control[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [filterImplementation, setFilterImplementation] = useState('');
  const [filterEffectiveness, setFilterEffectiveness] = useState('');
  const [filterFrequency, setFilterFrequency] = useState('');

  // Modals
  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedControl, setSelectedControl] = useState<any | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const isEditing = !!selectedControl && formOpen;

  const fetchControls = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (search) params.set('search', search);
      if (filterImplementation) params.set('implementation_status', filterImplementation);
      if (filterEffectiveness) params.set('effectiveness', filterEffectiveness);
      if (filterFrequency) params.set('frequency', filterFrequency);

      const [controlsRes, risksRes] = await Promise.all([
        api.get<ApiResponse<Control[]>>(`/controls?${params}`),
        api.get<ApiResponse<Risk[]>>('/risks?limit=100'),
      ]);

      setControls(controlsRes.data ?? []);
      setTotalPages(controlsRes.pagination?.totalPages ?? 1);
      setRisks(risksRes.data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load controls');
    } finally {
      setLoading(false);
    }
  }, [page, search, filterImplementation, filterEffectiveness, filterFrequency]);

  useEffect(() => {
    fetchControls();
  }, [fetchControls]);

  useEffect(() => {
    setPage(1);
  }, [search, filterImplementation, filterEffectiveness, filterFrequency]);

  function openCreate() {
    setSelectedControl(null);
    setForm({
      ...emptyForm,
      risk_id: risks[0]?.id || '',
    });
    setFormOpen(true);
  }

  function openEdit(ctl: Control) {
    setSelectedControl(ctl);
    setForm({
      name: ctl.name,
      description: ctl.description ?? '',
      risk_id: ctl.risk_id,
      owner: ctl.owner ?? '',
      frequency: ctl.frequency,
      implementation_status: ctl.implementation_status,
      effectiveness: ctl.effectiveness,
    });
    setFormOpen(true);
  }

  async function openView(ctl: Control) {
    try {
      const res = await api.get<ApiResponse<any>>(`/controls/${ctl.id}`);
      setSelectedControl(res.data);
      setViewOpen(true);
    } catch {
      setSelectedControl(ctl);
      setViewOpen(true);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = {
        ...form,
        description: form.description || null,
        owner: form.owner || null,
      };

      if (isEditing) {
        await api.put(`/controls/${selectedControl!.id}`, body);
      } else {
        await api.post('/controls', body);
      }
      setFormOpen(false);
      setSelectedControl(null);
      fetchControls();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to save control');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(ctl: Control) {
    if (!window.confirm(`Delete control "${ctl.control_code} — ${ctl.name}"?`)) return;
    try {
      await api.delete(`/controls/${ctl.id}`);
      fetchControls();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete control');
    }
  }

  const columns = [
    {
      key: 'control_code',
      title: 'Control ID',
      render: (c: Control) => (
        <span className="font-mono text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-800 border border-slate-200">
          {c.control_code}
        </span>
      ),
    },
    {
      key: 'name',
      title: 'Control Name',
      render: (c: Control) => (
        <div>
          <p className="font-semibold text-slate-900 line-clamp-1">{c.name}</p>
          {c.description && <p className="text-xs text-slate-500 truncate max-w-sm">{c.description}</p>}
        </div>
      ),
    },
    {
      key: 'risk',
      title: 'Mitigated Risk',
      render: (c: any) => (
        <span className="text-xs font-medium text-slate-700">
          {c.risk ? `${c.risk.risk_code}: ${c.risk.title}` : risks.find((r) => r.id === c.risk_id)?.title || '—'}
        </span>
      ),
    },
    {
      key: 'frequency',
      title: 'Frequency',
      render: (c: Control) => <span className="text-xs text-slate-600">{c.frequency}</span>,
    },
    {
      key: 'implementation_status',
      title: 'Implementation',
      render: (c: Control) => (
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${getStatusColor(c.implementation_status)}`}>
          {c.implementation_status.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'effectiveness',
      title: 'Effectiveness',
      render: (c: Control) => (
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${getStatusColor(c.effectiveness)}`}>
          {c.effectiveness.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'owner',
      title: 'Owner',
      render: (c: Control) => <span className="text-xs text-slate-700">{c.owner || '—'}</span>,
    },
    {
      key: 'actions',
      title: '',
      render: (c: Control) => (
        <div className="flex items-center gap-1 justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openView(c);
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
                openEdit(c);
              }}
              className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50"
              title="Edit Control"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(c);
              }}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
              title="Delete Control"
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Control Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Maintain preventive, detective, and corrective security controls mitigating enterprise risks
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/control-assessments">
            <Button variant="outline" className="text-xs font-semibold">
              <ClipboardCheck className="w-4 h-4 mr-1.5 text-blue-600" />
              Assess Controls
            </Button>
          </Link>
          {canEdit && (
            <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Control
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search code, name, owner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            options={[{ value: '', label: 'All Implementation' }, ...implementationOptions]}
            value={filterImplementation}
            onChange={(e) => setFilterImplementation(e.target.value)}
          />
          <Select
            options={[{ value: '', label: 'All Effectiveness' }, ...effectivenessOptions]}
            value={filterEffectiveness}
            onChange={(e) => setFilterEffectiveness(e.target.value)}
          />
          <Select
            options={[{ value: '', label: 'All Frequencies' }, ...frequencyOptions]}
            value={filterFrequency}
            onChange={(e) => setFilterFrequency(e.target.value)}
          />
        </div>
      </Card>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-rose-600 mb-2">{error}</p>
            <button onClick={fetchControls} className="text-blue-600 hover:underline text-sm font-semibold">
              Retry
            </button>
          </div>
        </div>
      ) : controls.length === 0 ? (
        <EmptyState
          title="No controls found"
          description="Register your first control to mitigate documented risks."
          icon={<ShieldCheck className="w-12 h-12 text-slate-400" />}
          action={
            canEdit ? (
              <Button onClick={openCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Add Control
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Card padding={false}>
          <Table<Control> columns={columns} data={controls} keyExtractor={(c) => c.id} />
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
        title={isEditing ? `Edit Control: ${selectedControl?.control_code}` : 'Register New Mitigating Control'}
        className="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Control Name"
            required
            placeholder="e.g. Automated Database Credential Vault & Rotation"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <Select
            label="Associated Risk"
            required
            options={risks.map((r) => ({ value: r.id, label: `${r.risk_code}: ${r.title} (${r.risk_level})` }))}
            value={form.risk_id}
            onChange={(e) => setForm({ ...form, risk_id: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Evaluation Frequency"
              options={frequencyOptions}
              value={form.frequency}
              onChange={(e) => setForm({ ...form, frequency: e.target.value as ControlFrequency })}
            />
            <Select
              label="Implementation Status"
              options={implementationOptions}
              value={form.implementation_status}
              onChange={(e) => setForm({ ...form, implementation_status: e.target.value as ImplementationStatus })}
            />
            <Select
              label="Effectiveness"
              options={effectivenessOptions}
              value={form.effectiveness}
              onChange={(e) => setForm({ ...form, effectiveness: e.target.value as ControlEffectiveness })}
            />
          </div>

          <Input
            label="Control Owner / Custodian"
            placeholder="e.g. Budi Santoso"
            value={form.owner}
            onChange={(e) => setForm({ ...form, owner: e.target.value })}
          />

          <Textarea
            label="Control Description & Implementation Method"
            placeholder="Describe the technical or procedural safeguards applied to satisfy this control..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {isEditing ? 'Save Changes' : 'Register Control'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        open={viewOpen}
        onClose={() => {
          setViewOpen(false);
          setSelectedControl(null);
        }}
        title={`Control Details — ${selectedControl?.control_code || ''}`}
        className="max-w-2xl"
      >
        {selectedControl && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-400 font-mono">
                  {selectedControl.control_code}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{selectedControl.name}</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Owner: <strong>{selectedControl.owner || 'Unassigned'}</strong> • Frequency:{' '}
                  <strong>{selectedControl.frequency}</strong>
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge className={getStatusColor(selectedControl.implementation_status)}>
                  {selectedControl.implementation_status}
                </Badge>
                <Badge className={getStatusColor(selectedControl.effectiveness)}>
                  {selectedControl.effectiveness}
                </Badge>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Description</p>
              <p className="text-sm text-slate-800 p-3 bg-slate-50 rounded-lg border border-slate-200">
                {selectedControl.description || 'No description recorded.'}
              </p>
            </div>

            {selectedControl.risk && (
              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-xs">
                <span className="font-semibold text-amber-900 block mb-0.5">Mitigated Threat Scenario:</span>
                <p className="text-amber-800">
                  <span className="font-mono font-bold mr-1.5">{selectedControl.risk.risk_code}</span>
                  {selectedControl.risk.title}
                </p>
              </div>
            )}

            <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-100 pt-3">
              <span>Created: {formatDate(selectedControl.created_at)}</span>
              <Button
                variant="outline"
                onClick={() => {
                  setViewOpen(false);
                  setSelectedControl(null);
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
