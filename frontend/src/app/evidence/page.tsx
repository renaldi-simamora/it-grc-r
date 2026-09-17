'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, FileText, CheckCircle2, XCircle, Clock, Loader2, Download, Shield } from 'lucide-react';
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
import type { Evidence, Control, ReviewStatus, ApiResponse } from '@/types';

const statusFilterOptions = [
  { value: '', label: 'All Review Statuses' },
  { value: 'PENDING', label: 'Pending Review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];

export default function EvidencePage() {
  const { user } = useAuth();
  const canReview = user?.role === 'ADMIN' || user?.role === 'GRC_OFFICER';

  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [controls, setControls] = useState<Control[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Upload Modal
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    control_id: '',
    file_name: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Review Modal
  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>('APPROVED');
  const [reviewerNotes, setReviewerNotes] = useState('');

  const fetchEvidence = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (search) params.set('search', search);
      if (filterStatus) params.set('review_status', filterStatus);

      const [evRes, ctlRes] = await Promise.all([
        api.get<ApiResponse<Evidence[]>>(`/evidence?${params}`),
        api.get<ApiResponse<Control[]>>('/controls?limit=100'),
      ]);

      setEvidenceList(evRes.data ?? []);
      setTotalPages(evRes.pagination?.totalPages ?? 1);
      setControls(ctlRes.data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load evidence');
    } finally {
      setLoading(false);
    }
  }, [page, search, filterStatus]);

  useEffect(() => {
    fetchEvidence();
  }, [fetchEvidence]);

  useEffect(() => {
    setPage(1);
  }, [search, filterStatus]);

  function openUpload() {
    setUploadForm({
      control_id: controls[0]?.id || '',
      file_name: `Sample_Audit_Evidence_${new Date().getFullYear()}.pdf`,
      description: 'Synthetic evidence document for audit simulation review.',
    });
    setUploadOpen(true);
  }

  function openReview(ev: Evidence) {
    setSelectedEvidence(ev);
    setReviewStatus(ev.review_status === 'PENDING' ? 'APPROVED' : ev.review_status);
    setReviewerNotes(ev.reviewer_notes || '');
    setReviewOpen(true);
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/evidence', uploadForm);
      setUploadOpen(false);
      fetchEvidence();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to upload evidence');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveReview(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedEvidence) return;
    setSubmitting(true);
    try {
      await api.put(`/evidence/${selectedEvidence.id}/review`, {
        review_status: reviewStatus,
        reviewer_notes: reviewerNotes,
      });
      setReviewOpen(false);
      setSelectedEvidence(null);
      fetchEvidence();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to record evidence review');
    } finally {
      setSubmitting(false);
    }
  }

  const columns = [
    {
      key: 'evidence_code',
      title: 'Evidence ID',
      render: (e: Evidence) => (
        <span className="font-mono text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-800 border border-slate-200">
          {e.evidence_code}
        </span>
      ),
    },
    {
      key: 'file_name',
      title: 'Evidence Artifact',
      render: (e: Evidence) => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
          <div>
            <p className="font-semibold text-slate-900 line-clamp-1">{e.file_name}</p>
            {e.description && <p className="text-xs text-slate-500 truncate max-w-sm">{e.description}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'control',
      title: 'Associated Control',
      render: (e: any) => (
        <span className="text-xs font-medium text-slate-700">
          {e.control ? `${e.control.control_code}: ${e.control.name}` : controls.find((c) => c.id === e.control_id)?.name || '—'}
        </span>
      ),
    },
    {
      key: 'uploaded_at',
      title: 'Uploaded Date',
      render: (e: Evidence) => <span className="text-xs text-slate-500">{formatDate(e.uploaded_at)}</span>,
    },
    {
      key: 'review_status',
      title: 'Review Status',
      render: (e: Evidence) => (
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${getStatusColor(e.review_status)}`}>
          {e.review_status}
        </span>
      ),
    },
    {
      key: 'reviewer',
      title: 'Reviewer & Notes',
      render: (e: Evidence) => (
        <div className="text-xs">
          <p className="font-medium text-slate-800">{e.reviewer || '—'}</p>
          {e.reviewer_notes && <p className="text-[11px] text-slate-500 truncate max-w-xs">{e.reviewer_notes}</p>}
        </div>
      ),
    },
    {
      key: 'actions',
      title: '',
      render: (e: Evidence) => (
        <div className="flex items-center gap-1 justify-end">
          {canReview && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => openReview(e)}
              className="text-xs py-1 h-7 border-slate-300 hover:border-blue-500 hover:text-blue-600"
            >
              Review
            </Button>
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Evidence Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Collect, verify, and approve synthetic documentation proving control effectiveness
          </p>
        </div>
        <Button onClick={openUpload} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Upload Synthetic Evidence
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search evidence ID, file name..."
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

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      ) : evidenceList.length === 0 ? (
        <EmptyState
          title="No evidence records found"
          description="Upload synthetic evidence documentation to support your controls."
          icon={<FileText className="w-12 h-12 text-slate-400" />}
          action={
            <Button onClick={openUpload}>
              <Plus className="w-4 h-4 mr-2" />
              Upload Evidence
            </Button>
          }
        />
      ) : (
        <Card padding={false}>
          <Table<Evidence> columns={columns} data={evidenceList} keyExtractor={(e) => e.id} />
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Showing page {page} of {totalPages}
            </p>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </Card>
      )}

      {/* Upload Synthetic Evidence Modal */}
      <Modal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="Upload Synthetic Audit Evidence"
        className="max-w-xl"
      >
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
            <strong>Portfolio Simulation:</strong> Simulated files represent audit artifacts (PDF, XLSX, PNG) supporting controls at PT Nusantara Digital.
          </div>

          <Select
            label="Target Control"
            required
            options={controls.map((c) => ({ value: c.id, label: `${c.control_code} — ${c.name}` }))}
            value={uploadForm.control_id}
            onChange={(e) => setUploadForm({ ...uploadForm, control_id: e.target.value })}
          />

          <Input
            label="Simulated File Name"
            required
            placeholder="e.g. Sample_User_Access_Review_Q1_2026.xlsx"
            value={uploadForm.file_name}
            onChange={(e) => setUploadForm({ ...uploadForm, file_name: e.target.value })}
          />

          <Textarea
            label="Artifact Description &amp; Scope"
            placeholder="Document what this evidence demonstrates (e.g. 100% MFA compliance report)..."
            value={uploadForm.description}
            onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
            rows={3}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setUploadOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Record Evidence
            </Button>
          </div>
        </form>
      </Modal>

      {/* Review Dialog Modal */}
      <Modal
        open={reviewOpen}
        onClose={() => {
          setReviewOpen(false);
          setSelectedEvidence(null);
        }}
        title={`Audit Review: ${selectedEvidence?.evidence_code || ''}`}
        className="max-w-lg"
      >
        {selectedEvidence && (
          <form onSubmit={handleSaveReview} className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <span className="text-xs text-slate-400 uppercase tracking-wider block">Document File</span>
              <p className="font-semibold text-sm text-slate-900">{selectedEvidence.file_name}</p>
              <p className="text-xs text-slate-500">{selectedEvidence.description}</p>
            </div>

            <Select
              label="Review Decision"
              options={[
                { value: 'APPROVED', label: 'APPROVED — Meets Control Criteria' },
                { value: 'REJECTED', label: 'REJECTED — Insufficient Evidence' },
                { value: 'PENDING', label: 'PENDING — Awaiting Additional Documentation' },
              ]}
              value={reviewStatus}
              onChange={(e) => setReviewStatus(e.target.value as ReviewStatus)}
            />

            <Textarea
              label="Reviewer Auditor Notes"
              placeholder="Document observations, exceptions, or audit signoff justification..."
              value={reviewerNotes}
              onChange={(e) => setReviewerNotes(e.target.value)}
              rows={3}
              required
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setReviewOpen(false);
                  setSelectedEvidence(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                Submit Audit Signoff
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
