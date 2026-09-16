'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Loader2, Server } from 'lucide-react';
import { api } from '@/lib/api';
import { cn, getStatusColor, formatDate } from '@/utils/helpers';
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
import type { Asset, ApiResponse } from '@/types';

const typeOptions = [
  { value: 'server', label: 'Server' },
  { value: 'application', label: 'Application' },
  { value: 'database', label: 'Database' },
  { value: 'network_device', label: 'Network Device' },
  { value: 'endpoint', label: 'Endpoint' },
  { value: 'cloud_service', label: 'Cloud Service' },
  { value: 'other', label: 'Other' },
];

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'decommissioned', label: 'Decommissioned' },
  { value: 'under_review', label: 'Under Review' },
];

const criticalityOptions = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const classificationOptions = [
  { value: 'public', label: 'Public' },
  { value: 'internal', label: 'Internal' },
  { value: 'confidential', label: 'Confidential' },
  { value: 'restricted', label: 'Restricted' },
];

const emptyForm = {
  name: '',
  type: 'server' as Asset['type'],
  description: '',
  owner: '',
  department: '',
  location: '',
  status: 'active' as Asset['status'],
  criticality: 'medium' as Asset['criticality'],
  classification: 'internal' as Asset['classification'],
};

export default function AssetsPage() {
  const { user } = useAuth();
  const canEdit = user?.role === 'admin' || user?.role === 'analyst';

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
      const params = new URLSearchParams({ page: String(page), limit: '20' });
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

  useEffect(() => { fetchAssets(); }, [fetchAssets]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [search, filterType, filterStatus, filterCriticality]);

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
      location: asset.location ?? '',
      status: asset.status,
      criticality: asset.criticality,
      classification: asset.classification,
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
        location: form.location || null,
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
    if (!window.confirm(`Delete asset "${asset.name}"?`)) return;
    try {
      await api.delete(`/assets/${asset.id}`);
      fetchAssets();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete asset');
    }
  }

  const columns = [
    {
      key: 'name',
      title: 'Name',
      render: (a: Asset) => (
        <div>
          <p className="font-medium text-gray-900">{a.name}</p>
          {a.description && <p className="text-xs text-gray-500 truncate max-w-xs">{a.description}</p>}
        </div>
      ),
    },
    {
      key: 'type',
      title: 'Type',
      render: (a: Asset) => <span className="capitalize">{a.type.replace('_', ' ')}</span>,
    },
    {
      key: 'owner',
      title: 'Owner',
      render: (a: Asset) => <span>{a.owner ?? '—'}</span>,
    },
    {
      key: 'status',
      title: 'Status',
      render: (a: Asset) => (
        <Badge className={getStatusColor(a.status)}>
          {a.status.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'criticality',
      title: 'Criticality',
      render: (a: Asset) => (
        <Badge className={getStatusColor(a.criticality)}>
          {a.criticality}
        </Badge>
      ),
    },
    {
      key: 'classification',
      title: 'Classification',
      render: (a: Asset) => <span className="capitalize">{a.classification}</span>,
    },
    {
      key: 'updated_at',
      title: 'Updated',
      render: (a: Asset) => <span className="text-gray-500">{formatDate(a.updated_at)}</span>,
    },
    {
      key: 'actions',
      title: '',
      render: (a: Asset) => (
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); openView(a); }} className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50" title="View">
            <Eye className="w-4 h-4" />
          </button>
          {canEdit && (
            <>
              <button onClick={(e) => { e.stopPropagation(); openEdit(a); }} className="p-1.5 text-gray-400 hover:text-yellow-600 rounded-lg hover:bg-yellow-50" title="Edit">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(a); }} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50" title="Delete">
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const updateField = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">IT Assets</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track your organization&apos;s IT assets</p>
        </div>
        {canEdit && (
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add Asset
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            options={typeOptions}
            placeholder="All Types"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          />
          <Select
            options={statusOptions}
            placeholder="All Statuses"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          />
          <Select
            options={criticalityOptions}
            placeholder="All Criticalities"
            value={filterCriticality}
            onChange={(e) => setFilterCriticality(e.target.value)}
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
            <p className="text-red-600 mb-2">{error}</p>
            <button onClick={fetchAssets} className="text-blue-600 hover:underline text-sm">Retry</button>
          </div>
        </div>
      ) : assets.length === 0 ? (
        <EmptyState
          title="No assets found"
          description="Get started by adding your first IT asset."
          icon={<Server className="w-12 h-12" />}
          action={canEdit ? <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Add Asset</Button> : undefined}
        />
      ) : (
        <Card padding={false}>
          <Table<Asset>
            columns={columns}
            data={assets}
            keyExtractor={(a) => a.id}
          />
          <div className="px-6 pb-4">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={isEditing ? 'Edit Asset' : 'Add Asset'} className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Name"
              required
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
            />
            <Select
              label="Type"
              options={typeOptions}
              value={form.type}
              onChange={(e) => updateField('type', e.target.value)}
            />
            <Input
              label="Owner"
              value={form.owner}
              onChange={(e) => updateField('owner', e.target.value)}
            />
            <Input
              label="Department"
              value={form.department}
              onChange={(e) => updateField('department', e.target.value)}
            />
            <Input
              label="Location"
              value={form.location}
              onChange={(e) => updateField('location', e.target.value)}
            />
            <Select
              label="Status"
              options={statusOptions}
              value={form.status}
              onChange={(e) => updateField('status', e.target.value)}
            />
            <Select
              label="Criticality"
              options={criticalityOptions}
              value={form.criticality}
              onChange={(e) => updateField('criticality', e.target.value)}
            />
            <Select
              label="Classification"
              options={classificationOptions}
              value={form.classification}
              onChange={(e) => updateField('classification', e.target.value)}
            />
          </div>
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>{isEditing ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal open={viewOpen} onClose={() => { setViewOpen(false); setSelected(null); }} title="Asset Details" className="max-w-2xl">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Detail label="Name" value={selected.name} />
              <Detail label="Type" value={selected.type.replace('_', ' ')} />
              <Detail label="Owner" value={selected.owner} />
              <Detail label="Department" value={selected.department} />
              <Detail label="Location" value={selected.location} />
              <Detail label="Status">
                <Badge className={getStatusColor(selected.status)}>{selected.status.replace('_', ' ')}</Badge>
              </Detail>
              <Detail label="Criticality">
                <Badge className={getStatusColor(selected.criticality)}>{selected.criticality}</Badge>
              </Detail>
              <Detail label="Classification" value={selected.classification} />
              <Detail label="Created" value={formatDate(selected.created_at)} />
              <Detail label="Updated" value={formatDate(selected.updated_at)} />
            </div>
            {selected.description && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Description</p>
                <p className="text-sm text-gray-900">{selected.description}</p>
              </div>
            )}
            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => { setViewOpen(false); setSelected(null); }}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Detail({ label, value, children }: { label: string; value?: string | null; children?: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      {children ?? <p className="text-sm text-gray-900 capitalize">{value || '—'}</p>}
    </div>
  );
}
