import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { store } from '../lib/store';
import { Finding } from '../types';

const router = Router();

function generateFindingCode(): string {
  const maxNum = store.findings.reduce((max, f) => {
    const match = f.finding_code.match(/FND-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      return num > max ? num : max;
    }
    return max;
  }, 0);
  return `FND-${String(maxNum + 1).padStart(4, '0')}`;
}

// GET / — list findings
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const search = ((req.query.search as string) || '').toLowerCase().trim();
    const severity = req.query.severity as string;
    const status = req.query.status as string;
    const risk_id = req.query.risk_id as string;
    const control_id = req.query.control_id as string;

    let filtered = store.findings.filter((finding) => {
      if (search) {
        const matchesTitle = finding.title.toLowerCase().includes(search);
        const matchesCode = finding.finding_code.toLowerCase().includes(search);
        const matchesDesc = (finding.description || '').toLowerCase().includes(search);
        const matchesOwner = (finding.owner || '').toLowerCase().includes(search);
        if (!matchesTitle && !matchesCode && !matchesDesc && !matchesOwner) return false;
      }
      if (severity && finding.severity !== severity) return false;
      if (status && finding.status !== status) return false;
      if (risk_id && finding.risk_id !== risk_id) return false;
      if (control_id && finding.control_id !== control_id) return false;
      return true;
    });

    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Enrich with linked risk & control
    const enriched = filtered.map((f) => {
      const risk = f.risk_id ? store.risks.find((r) => r.id === f.risk_id) : null;
      const control = f.control_id ? store.controls.find((c) => c.id === f.control_id) : null;
      const remediations = store.remediations.filter((rem) => rem.finding_id === f.id);
      return {
        ...f,
        risk: risk ? { id: risk.id, risk_code: risk.risk_code, title: risk.title } : null,
        control: control ? { id: control.id, control_code: control.control_code, name: control.name } : null,
        remediation_count: remediations.length,
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

// GET /:id — detail with risk, control, remediations
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const finding = store.findings.find((f) => f.id === req.params.id || f.finding_code === req.params.id);
    if (!finding) {
      return res.status(404).json({ success: false, error: 'Finding not found' });
    }

    const risk = finding.risk_id ? store.risks.find((r) => r.id === finding.risk_id) : null;
    const control = finding.control_id ? store.controls.find((c) => c.id === finding.control_id) : null;
    const remediations = store.remediations.filter((rem) => rem.finding_id === finding.id);

    return res.json({
      success: true,
      data: {
        ...finding,
        risk,
        control,
        remediations,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST / — create finding
router.post('/', authenticate, authorize('ADMIN', 'GRC_OFFICER'), async (req: Request, res: Response) => {
  try {
    const { title, description, risk_id, control_id, severity, recommendation, owner, due_date, status } = req.body;

    if (!title || !severity) {
      return res.status(400).json({ success: false, error: 'title and severity are required' });
    }

    const finding_code = req.body.finding_code || generateFindingCode();

    const newFinding: Finding = {
      id: `fnd-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      finding_code,
      title,
      description: description || null,
      risk_id: risk_id || null,
      control_id: control_id || null,
      severity,
      recommendation: recommendation || null,
      owner: owner || null,
      due_date: due_date || null,
      status: status || 'OPEN',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    store.findings.unshift(newFinding);
    store.logActivity(req.userId || null, 'CREATED_FINDING', 'Findings', newFinding.id, {
      finding_code: newFinding.finding_code,
      title: newFinding.title,
      severity: newFinding.severity,
    });

    return res.status(201).json({
      success: true,
      data: newFinding,
      message: 'Finding recorded successfully',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /:id — update finding
router.put('/:id', authenticate, authorize('ADMIN', 'GRC_OFFICER'), async (req: Request, res: Response) => {
  try {
    const index = store.findings.findIndex((f) => f.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Finding not found' });
    }

    const current = store.findings[index];
    const updated: Finding = {
      ...current,
      ...req.body,
      id: current.id,
      finding_code: current.finding_code,
      updated_at: new Date().toISOString(),
    };

    store.findings[index] = updated;
    store.logActivity(req.userId || null, 'UPDATED_FINDING', 'Findings', updated.id, {
      finding_code: updated.finding_code,
      title: updated.title,
      status: updated.status,
    });

    return res.json({
      success: true,
      data: updated,
      message: 'Finding updated successfully',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /:id — delete finding (ADMIN only)
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const index = store.findings.findIndex((f) => f.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Finding not found' });
    }

    const deleted = store.findings.splice(index, 1)[0];
    store.logActivity(req.userId || null, 'DELETED_FINDING', 'Findings', deleted.id, {
      finding_code: deleted.finding_code,
      title: deleted.title,
    });

    return res.json({
      success: true,
      message: `Finding ${deleted.finding_code} deleted successfully`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
