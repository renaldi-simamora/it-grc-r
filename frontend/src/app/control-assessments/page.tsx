'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, ClipboardCheck, Loader2, CheckCircle2, AlertCircle, FileText, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { getStatusColor, formatDate } from '@/utils/helpers';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Textarea';
import type { Control, ControlAssessment, AssessmentStatus, ApiResponse, Evidence } from '@/types';

const defaultChecklistTemplate = [
  { title: 'Technical control implementation active and operational', status: 'COMPLIANT' as AssessmentStatus, notes: 'Automated monitoring active.' },
  { title: 'Standard operating procedure documented and approved', status: 'COMPLIANT' as AssessmentStatus, notes: 'SOP published in wiki.' },
  { title: 'Periodic monitoring and log verification completed', status: 'PARTIALLY_COMPLIANT' as AssessmentStatus, notes: 'Log review completed for 80% of nodes.' },
  { title: 'Supporting synthetic audit evidence attached and verified', status: 'NON_COMPLIANT' as AssessmentStatus, notes: 'Awaiting updated review signoff.' },
];

export default function ControlAssessmentsPage() {
  const { user } = useAuth();
  const canAssess = user?.role === 'ADMIN' || user?.role === 'GRC_OFFICER';

  const [assessments, setAssessments] = useState<ControlAssessment[]>([]);
  const [controls, setControls] = useState<Control[]>([]);
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Assessment Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedControlId, setSelectedControlId] = useState('');
  const [notes, setNotes] = useState('');
  const [checklist, setChecklist] = useState(defaultChecklistTemplate);
  const [submitting, setSubmitting] = useState(false);

  // View details modal
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [activeAssessment, setActiveAssessment] = useState<any | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [assessRes, controlsRes, evRes] = await Promise.all([
        api.get<ApiResponse<ControlAssessment[]>>('/control-assessments'),
        api.get<ApiResponse<Control[]>>('/controls?limit=100'),
        api.get<ApiResponse<Evidence[]>>('/evidence?limit=100'),
      ]);
      setAssessments(assessRes.data ?? []);
      setControls(controlsRes.data ?? []);
      setEvidences(evRes.data ?? []);
      if (controlsRes.data && controlsRes.data.length > 0) {
        setSelectedControlId(controlsRes.data[0].id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load assessments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Live checklist calculation
  const applicable = checklist.filter((i) => i.status !== 'NOT_APPLICABLE');
  const points = applicable.reduce((acc, curr) => {
    if (curr.status === 'COMPLIANT') return acc + 1.0;
    if (curr.status === 'PARTIALLY_COMPLIANT') return acc + 0.5;
    return acc;
  }, 0);
  const liveScore = applicable.length > 0 ? Math.round((points / applicable.length) * 100) : 100;
  const liveStatus: AssessmentStatus =
    liveScore >= 90 ? 'COMPLIANT' : liveScore >= 50 ? 'PARTIALLY_COMPLIANT' : 'NON_COMPLIANT';

  const updateChecklistItem = (index: number, field: string, value: any) => {
    setChecklist((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleStartAssessment = () => {
    setNotes('');
    setChecklist(defaultChecklistTemplate);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/control-assessments', {
        control_id: selectedControlId,
        notes,
        checklist_items: checklist,
      });
      setModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to record control assessment');
    } finally {
      setSubmitting(false);
    }
  };

  const openView = async (ca: ControlAssessment) => {
    try {
      const res = await api.get<ApiResponse<any>>(`/control-assessments/${ca.id}`);
      setActiveAssessment(res.data);
      setViewModalOpen(true);
    } catch {
      setActiveAssessment(ca);
      setViewModalOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Control Assessment &amp; Testing</h1>
          <p className="text-sm text-slate-500 mt-1">
            Conduct audit checklist evaluations to calculate control compliance scores and effectiveness
          </p>
        </div>
        {canAssess && (
          <Button onClick={handleStartAssessment} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Perform Control Assessment
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      ) : assessments.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <ClipboardCheck className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-900">No control assessments executed yet</p>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Run an assessment to evaluate control design, operating effectiveness, and compliance status.
            </p>
            {canAssess && (
              <Button onClick={handleStartAssessment} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Start Assessment
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessments.map((a) => (
            <Card key={a.id} className="hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      {a.control?.control_code || 'CTL'}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1.5 line-clamp-1">
                      {a.control?.name || 'Control Assessment'}
                    </h3>
                  </div>
                  <Badge className={getStatusColor(a.status)}>{a.status.replace('_', ' ')}</Badge>
                </div>

                {/* Score bar */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-500">Calculated Compliance</span>
                    <span className="font-bold text-slate-900 font-mono">{a.score}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        a.score >= 90 ? 'bg-emerald-500' : a.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${a.score}%` }}
                    />
                  </div>
                </div>

                {a.notes && <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">{a.notes}</p>}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>Assessed: {formatDate(a.created_at)}</span>
                  <button
                    onClick={() => openView(a)}
                    className="flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700"
                  >
                    <span>Checklist</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Perform Assessment Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Execute Control Compliance Assessment"
        className="max-w-3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <Select
            label="Select Control to Assess"
            required
            options={controls.map((c) => ({ value: c.id, label: `${c.control_code} — ${c.name}` }))}
            value={selectedControlId}
            onChange={(e) => setSelectedControlId(e.target.value)}
          />

          {/* Real-time score calculator preview banner */}
          <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider block">Live Assessment Score</span>
              <p className="text-2xl font-bold font-mono text-white mt-0.5">
                {liveScore}%{' '}
                <span className="text-xs font-normal text-slate-300">
                  ({points} pts / {applicable.length} items)
                </span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Resulting Status</span>
              <Badge className={getStatusColor(liveStatus)}>{liveStatus.replace('_', ' ')}</Badge>
            </div>
          </div>

          {/* Checklist Items */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Audit Checklist Criteria &amp; Verification
            </label>
            {checklist.map((item, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-900">{item.title}</span>
                  <div className="flex items-center gap-2">
                    <select
                      className="text-xs font-semibold rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-slate-800 focus:ring-2 focus:ring-blue-500"
                      value={item.status}
                      onChange={(e) => updateChecklistItem(idx, 'status', e.target.value)}
                    >
                      <option value="COMPLIANT">COMPLIANT (1.0 pt)</option>
                      <option value="PARTIALLY_COMPLIANT">PARTIALLY COMPLIANT (0.5 pt)</option>
                      <option value="NON_COMPLIANT">NON-COMPLIANT (0.0 pt)</option>
                      <option value="NOT_APPLICABLE">NOT APPLICABLE (Excluded)</option>
                    </select>
                  </div>
                </div>
                <Input
                  placeholder="Auditor observation notes..."
                  value={item.notes}
                  onChange={(e) => updateChecklistItem(idx, 'notes', e.target.value)}
                  className="text-xs bg-white"
                />
              </div>
            ))}
          </div>

          <Textarea
            label="Overall Assessment Notes &amp; Findings Summary"
            placeholder="Document key gaps identified or compliance justification..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Finalize &amp; Record Assessment
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Details Modal */}
      <Modal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setActiveAssessment(null);
        }}
        title={`Assessment Checklist: ${activeAssessment?.control?.control_code || ''}`}
        className="max-w-2xl"
      >
        {activeAssessment && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 text-sm">{activeAssessment.control?.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">Assessed on {formatDate(activeAssessment.created_at)}</p>
              </div>
              <div className="text-right">
                <span className="font-mono text-xl font-bold text-slate-900 block">{activeAssessment.score}%</span>
                <Badge className={getStatusColor(activeAssessment.status)}>{activeAssessment.status}</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Checklist Items</p>
              {(activeAssessment.checklist_items || []).map((chk: any) => (
                <div key={chk.id} className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{chk.title}</span>
                    <Badge className={getStatusColor(chk.status)}>{chk.status}</Badge>
                  </div>
                  {chk.notes && <p className="text-slate-500">{chk.notes}</p>}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setViewModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
