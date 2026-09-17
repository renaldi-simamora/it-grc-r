import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { store } from '../lib/store';
import { Remediation } from '../types';

const router = Router();

// GET / — list remediations with automatic overdue evaluation
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    store.checkOverdueRemediations();

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const finding_id = req.query.finding_id as string;
    const status = req.query.status as string;
    const owner = req.query.owner as string;
    const search = ((req.query.search as string) || '').toLowerCase().trim();

    let filtered = store.remediations.filter((rem) => {
      if (search) {
        const matchesAction = rem.action.toLowerCase().includes(search);
        const matchesOwner = (rem.owner || '').toLowerCase().includes(search);
        const matchesNotes = (rem.completion_notes || '').toLowerCase().includes(search);
        if (!matchesAction && !matchesOwner && !matchesNotes) return false;
      }
      if (finding_id && rem.finding_id !== finding_id) return false;
      if (status && rem.status !== status) return false;
      if (owner && rem.owner !== owner) return false;
      return true;
    });

    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Enrich with finding info
    const enriched = filtered.map((rem) => {
      const finding = store.findings.find((f) => f.id === rem.finding_id);
      return {
        ...rem,
        finding: finding
          ? { id: finding.id, finding_code: finding.finding_code, title: finding.title, severity: finding.severity }
          : null,
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

// GET /:id — single remediation
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    store.checkOverdueRemediations();

    const rem = store.remediations.find((r) => r.id === req.params.id);
    if (!rem) {
      return res.status(404).json({ success: false, error: 'Remediation not found' });
    }

    const finding = store.findings.find((f) => f.id === rem.finding_id);
    return res.json({
      success: true,
      data: {
        ...rem,
        finding: finding || null,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST / — create remediation plan
router.post('/', authenticate, authorize('ADMIN', 'GRC_OFFICER'), async (req: Request, res: Response) => {
  try {
    const { finding_id, action, owner, due_date, status, completion_notes } = req.body;

    if (!finding_id || !action) {
      return res.status(400).json({ success: false, error: 'finding_id and action are required' });
    }

    const finding = store.findings.find((f) => f.id === finding_id);
    if (!finding) {
      return res.status(404).json({ success: false, error: 'Associated finding not found' });
    }

    const isOverdue = due_date && new Date(due_date).getTime() < Date.now();
    const resolvedStatus = status || (isOverdue ? 'OVERDUE' : 'OPEN');

    const newRem: Remediation = {
      id: `rem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      finding_id,
      action,
      owner: owner || null,
      due_date: due_date || null,
      status: resolvedStatus,
      completion_notes: completion_notes || null,
      completed_at: resolvedStatus === 'COMPLETED' ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    store.remediations.unshift(newRem);
    store.logActivity(req.userId || null, 'CREATED_REMEDIATION', 'Remediation', newRem.id, {
      finding_code: finding.finding_code,
      action: newRem.action,
      owner: newRem.owner,
    });

    return res.status(201).json({
      success: true,
      data: newRem,
      message: 'Remediation plan created successfully',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /:id — update remediation
router.put('/:id', authenticate, authorize('ADMIN', 'GRC_OFFICER'), async (req: Request, res: Response) => {
  try {
    const index = store.remediations.findIndex((r) => r.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Remediation not found' });
    }

    const current = store.remediations[index];
    const updates = { ...req.body };

    if (updates.status === 'COMPLETED' && !current.completed_at) {
      updates.completed_at = new Date().toISOString();
    }

    const updated: Remediation = {
      ...current,
      ...updates,
      id: current.id,
      updated_at: new Date().toISOString(),
    };

    store.remediations[index] = updated;
    store.logActivity(req.userId || null, 'UPDATED_REMEDIATION', 'Remediation', updated.id, {
      action: updated.action,
      status: updated.status,
    });

    return res.json({
      success: true,
      data: updated,
      message: 'Remediation updated successfully',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /:id — delete remediation
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const index = store.remediations.findIndex((r) => r.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Remediation not found' });
    }

    const deleted = store.remediations.splice(index, 1)[0];
    store.logActivity(req.userId || null, 'DELETED_REMEDIATION', 'Remediation', deleted.id, {
      action: deleted.action,
    });

    return res.json({
      success: true,
      message: 'Remediation plan deleted successfully',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
