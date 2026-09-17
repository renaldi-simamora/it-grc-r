import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { store } from '../lib/store';
import { Control } from '../types';

const router = Router();

function generateControlCode(): string {
  const maxNum = store.controls.reduce((max, c) => {
    const match = c.control_code.match(/CTL-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      return num > max ? num : max;
    }
    return max;
  }, 0);
  return `CTL-${String(maxNum + 1).padStart(4, '0')}`;
}

// GET / — list controls with filtering, pagination
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const search = ((req.query.search as string) || '').toLowerCase().trim();
    const risk_id = req.query.risk_id as string;
    const implementation_status = req.query.implementation_status as string;
    const effectiveness = req.query.effectiveness as string;
    const frequency = req.query.frequency as string;
    const sort_by = (req.query.sort_by as string) || 'control_code';
    const sort_order = (req.query.sort_order as string) === 'desc' ? -1 : 1;

    let filtered = store.controls.filter((control) => {
      if (search) {
        const matchesName = control.name.toLowerCase().includes(search);
        const matchesCode = control.control_code.toLowerCase().includes(search);
        const matchesDesc = (control.description || '').toLowerCase().includes(search);
        const matchesOwner = (control.owner || '').toLowerCase().includes(search);
        if (!matchesName && !matchesCode && !matchesDesc && !matchesOwner) return false;
      }
      if (risk_id && control.risk_id !== risk_id) return false;
      if (implementation_status && control.implementation_status !== implementation_status) return false;
      if (effectiveness && control.effectiveness !== effectiveness) return false;
      if (frequency && control.frequency !== frequency) return false;
      return true;
    });

    filtered.sort((a: any, b: any) => {
      const valA = a[sort_by] ?? '';
      const valB = b[sort_by] ?? '';
      if (valA < valB) return -1 * sort_order;
      if (valA > valB) return 1 * sort_order;
      return 0;
    });

    // Enrich with linked risk title and evidence count
    const enriched = filtered.map((c) => {
      const risk = store.risks.find((r) => r.id === c.risk_id);
      const evidenceCount = store.evidences.filter((e) => e.control_id === c.id).length;
      return {
        ...c,
        risk: risk ? { id: risk.id, risk_code: risk.risk_code, title: risk.title, risk_level: risk.risk_level } : null,
        evidence_count: evidenceCount,
      };
    });

    const total = enriched.length;
    const offset = (page - 1) * limit;
    const paginated = enriched.slice(offset, offset + limit);

    return res.json({
      success: true,
      data: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /:id — single control detail with assessments, evidences, checklist
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const control = store.controls.find((c) => c.id === req.params.id || c.control_code === req.params.id);
    if (!control) {
      return res.status(404).json({ success: false, error: 'Control not found' });
    }

    const risk = store.risks.find((r) => r.id === control.risk_id);
    const evidences = store.evidences.filter((e) => e.control_id === control.id);
    const assessments = store.controlAssessments.filter((ca) => ca.control_id === control.id);
    const findings = store.findings.filter((f) => f.control_id === control.id);

    // Get checklist items for latest assessment
    const latestAssessment = assessments[0];
    const checklistItems = latestAssessment
      ? store.checklistItems.filter((chk) => chk.assessment_id === latestAssessment.id)
      : [];

    return res.json({
      success: true,
      data: {
        ...control,
        risk: risk || null,
        evidences,
        assessments,
        checklist_items: checklistItems,
        findings,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST / — create control
router.post('/', authenticate, authorize('ADMIN', 'GRC_OFFICER'), async (req: Request, res: Response) => {
  try {
    const { name, description, risk_id, owner, frequency, implementation_status, effectiveness } = req.body;

    if (!name || !risk_id) {
      return res.status(400).json({ success: false, error: 'name and risk_id are required' });
    }

    // Verify risk exists
    const riskExists = store.risks.some((r) => r.id === risk_id);
    if (!riskExists) {
      return res.status(400).json({ success: false, error: 'Associated risk_id does not exist' });
    }

    const control_code = req.body.control_code || generateControlCode();

    const newControl: Control = {
      id: `ctl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      control_code,
      name,
      description: description || null,
      risk_id,
      owner: owner || null,
      frequency: frequency || 'Monthly',
      implementation_status: implementation_status || 'NOT_IMPLEMENTED',
      effectiveness: effectiveness || 'NOT_ASSESSED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    store.controls.unshift(newControl);
    store.logActivity(req.userId || null, 'CREATED_CONTROL', 'Controls', newControl.id, {
      control_code: newControl.control_code,
      name: newControl.name,
    });

    return res.status(201).json({
      success: true,
      data: newControl,
      message: 'Control created successfully',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /:id — update control
router.put('/:id', authenticate, authorize('ADMIN', 'GRC_OFFICER'), async (req: Request, res: Response) => {
  try {
    const index = store.controls.findIndex((c) => c.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Control not found' });
    }

    const current = store.controls[index];
    const updated: Control = {
      ...current,
      ...req.body,
      id: current.id,
      control_code: current.control_code, // preserve code
      updated_at: new Date().toISOString(),
    };

    store.controls[index] = updated;
    store.logActivity(req.userId || null, 'UPDATED_CONTROL', 'Controls', updated.id, {
      control_code: updated.control_code,
      name: updated.name,
    });

    return res.json({
      success: true,
      data: updated,
      message: 'Control updated successfully',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /:id — delete control (ADMIN only)
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const index = store.controls.findIndex((c) => c.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Control not found' });
    }

    const deleted = store.controls.splice(index, 1)[0];
    store.logActivity(req.userId || null, 'DELETED_CONTROL', 'Controls', deleted.id, {
      control_code: deleted.control_code,
      name: deleted.name,
    });

    return res.json({
      success: true,
      message: `Control ${deleted.control_code} deleted successfully`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
