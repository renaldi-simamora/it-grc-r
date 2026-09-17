'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Loader2, Server } from 'lucide-react';
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
import type { Asset, AssetType, CriticalityLevel, AssetStatus, ApiResponse } from '@/types';

const typeOptions = [
  { value: 'Application', label: 'Application' },
  { value: 'Database', label: 'Database' },
  { value: 'Server', label: 'Server' },
  { value: 'Network', label: 'Network' },
  { value: 'Endpoint', label: 'Endpoint' },
  { value: 'Cloud Service', label: 'Cloud Service' },
  { value: 'Other', label: 'Other' },
];

const criticalityOptions = [
  { value: 'CRITICAL', label: 'Critical' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

const statusOptions = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'RETIRED', label: 'Retired' },
];

const emptyForm = {
  name: '',
  type: 'Application' as AssetType,
  description: '',
  owner: '',
  department: '',
  criticality: 'MEDIUM' as CriticalityLevel,
  status: 'ACTIVE' as AssetStatus,
};

export default function AssetsPage() {
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'GRC_OFFICER';
  const canDelete = user?.role === 'ADMIN';

  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCriticality, setFilterCriticality] = useState('');

  // Modals
  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState<Asset | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const isEditing = !!selected && formOpen;

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (search) params.set('search', search);
      if (filterType) params.set('type', filterType);
      if (filterStatus) params.set('status', filterStatus);
      if (filterCriticality) params.set('criticality', filterCriticality);

      const res = await api.get<ApiResponse<Asset[]>>(`/assets?${params}`);
      setAssets(res.data ?? []);
      setTotalPages(res.pagination?.totalPages ?? 1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load assets');
    } finally {
      setLoading(false);
    }
  }, [page, search, filterType, filterStatus, filterCriticality]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  useEffect(() => {
    setPage(1);
  }, [search, filterType, filterStatus, filterCriticality]);

  function openCreate() {
    setSelected(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEdit(asset: Asset) {
    setSelected(asset);
    setForm({
      name: asset.name,
      type: asset.type,
      description: asset.description ?? '',
      owner: asset.owner ?? '',
      department: asset.department ?? '',
      criticality: asset.criticality,
      status: asset.status,
    });
    setFormOpen(true);
  }

  function openView(asset: Asset) {
    setSelected(asset);
    setViewOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = {
        ...form,
        description: form.description || null,
        owner: form.owner || null,
        department: form.department || null,
      };
      if (isEditing) {
        await api.put(`/assets/${selected!.id}`, body);
      } else {
        await api.post('/assets', body);
      }
      setFormOpen(false);
      setSelected(null);
      fetchAssets();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to save asset');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(asset: Asset) {
    if (!window.confirm(`Delete asset "${asset.asset_code} — ${asset.name}"?`)) return;
    try {
      await api.delete(`/assets/${asset.id}`);
      fetchAssets();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete asset');
    }
  }

  const columns = [
    {
      key: 'asset_code',
      title: 'Code',
      render: (a: Asset) => (
        <span className="font-mono text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-800 border border-slate-200">
          {a.asset_code}
        </span>
      ),
    },
    {
      key: 'name',
      title: 'Asset Name',
      render: (a: Asset) => (
        <div>
          <p className="font-semibold text-slate-900">{a.name}</p>
          {a.description && <p className="text-xs text-slate-500 truncate max-w-sm">{a.description}</p>}
        </div>
      ),
    },
    {
      key: 'type',
      title: 'Type',
      render: (a: Asset) => <span className="text-xs font-medium text-slate-700">{a.type}</span>,
    },
    {
      key: 'owner',
      title: 'Owner & Dept',
      render: (a: Asset) => (
        <div>
          <p className="text-xs font-medium text-slate-800">{a.owner || '—'}</p>
          <p className="text-[11px] text-slate-400">{a.department || '—'}</p>
        </div>
      ),
    },
    {
      key: 'criticality',
      title: 'Criticality',
      render: (a: Asset) => (
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${getStatusColor(a.criticality)}`}>
          {a.criticality}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (a: Asset) => (
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${getStatusColor(a.status)}`}>
          {a.status}
        </span>
      ),
    },
    {
      key: 'updated_at',
      title: 'Last Updated',
      render: (a: Asset) => <span className="text-xs text-slate-500">{formatDate(a.updated_at)}</span>,
    },
    {
      key: 'actions',
      title: '',
      render: (a: Asset) => (
        <div className="flex items-center gap-1 justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openView(a);
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
                openEdit(a);
              }}
              className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50"
              title="Edit Asset"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(a);
              }}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
              title="Delete Asset"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const updateField = (field: string, value: any) =>
    setForm((f) => ({ ...f, [field]: value }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">IT Asset Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Inventory of IT hardware, applications, databases, and network components at PT Nusantara Digital
          </p>
        </div>
        {canEdit && (
          <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Add New Asset
          </Button>
        )}
      </div>

      {/* Filters Card */}
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
            options={[{ value: '', label: 'All Asset Types' }, ...typeOptions]}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          />
          <Select
            options={[{ value: '', label: 'All Criticalities' }, ...criticalityOptions]}
            value={filterCriticality}
            onChange={(e) => setFilterCriticality(e.target.value)}
          />
          <Select
            options={[{ value: '', label: 'All Statuses' }, ...statusOptions]}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          />
        </div>
      </Card>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-rose-600 mb-2">{error}</p>
            <button onClick={fetchAssets} className="text-blue-600 hover:underline text-sm font-semibold">
              Retry
            </button>
          </div>
        </div>
      ) : assets.length === 0 ? (
        <EmptyState
          title="No assets found"
          description="Try clearing your filters or create your first asset."
          icon={<Server className="w-12 h-12 text-slate-400" />}
          action={
            canEdit ? (
              <Button onClick={openCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Add Asset
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Card padding={false}>
          <Table<Asset> columns={columns} data={assets} keyExtractor={(a) => a.id} />
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
        title={isEditing ? `Edit Asset: ${selected?.asset_code}` : 'Add New IT Asset'}
        className="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Asset Name"
              required
              placeholder="e.g. Customer Master DB"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
            />
            <Select
              label="Asset Type"
              options={typeOptions}
              value={form.type}
              onChange={(e) => updateField('type', e.target.value)}
            />
            <Input
              label="Owner / Custodian"
              placeholder="e.g. Budi Santoso"
              value={form.owner}
              onChange={(e) => updateField('owner', e.target.value)}
            />
            <Input
              label="Department"
              placeholder="e.g. Data Infrastructure"
              value={form.department}
              onChange={(e) => updateField('department', e.target.value)}
            />
            <Select
              label="Criticality Rating"
              options={criticalityOptions}
              value={form.criticality}
              onChange={(e) => updateField('criticality', e.target.value)}
            />
            <Select
              label="Operational Status"
              options={statusOptions}
              value={form.status}
              onChange={(e) => updateField('status', e.target.value)}
            />
          </div>
          <Textarea
            label="Description & Scope"
            placeholder="Functional description and data sensitivity classification..."
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            rows={3}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {isEditing ? 'Save Changes' : 'Create Asset'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Details Modal */}
      <Modal
        open={viewOpen}
        onClose={() => {
          setViewOpen(false);
          setSelected(null);
        }}
        title={`Asset Details — ${selected?.asset_code || ''}`}
        className="max-w-2xl"
      >
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Asset Code</p>
                <p className="font-mono text-sm font-bold text-slate-900 mt-0.5">{selected.asset_code}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</p>
                <p className="text-sm font-medium text-slate-900 mt-0.5">{selected.type}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Owner</p>
                <p className="text-sm font-medium text-slate-900 mt-0.5">{selected.owner || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</p>
                <p className="text-sm font-medium text-slate-900 mt-0.5">{selected.department || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Criticality</p>
                <div className="mt-0.5">
                  <Badge className={getStatusColor(selected.criticality)}>{selected.criticality}</Badge>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</p>
                <div className="mt-0.5">
                  <Badge className={getStatusColor(selected.status)}>{selected.status}</Badge>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Description</p>
              <div className="p-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-800">
                {selected.description || 'No description provided.'}
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-100 pt-3">
              <span>Created: {formatDate(selected.created_at)}</span>
              <span>Updated: {formatDate(selected.updated_at)}</span>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setViewOpen(false);
                  setSelected(null);
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
