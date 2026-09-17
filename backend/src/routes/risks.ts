import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { store } from '../lib/store';
import { Risk, RiskLevel } from '../types';

const router = Router();

export function calculateRiskScore(likelihood: number, impact: number): { score: number; level: RiskLevel } {
  const l = Math.min(5, Math.max(1, Math.round(likelihood)));
  const i = Math.min(5, Math.max(1, Math.round(impact)));
  const score = l * i;

  let level: RiskLevel = 'LOW';
  if (score >= 17) {
    level = 'CRITICAL';
  } else if (score >= 10) {
    level = 'HIGH';
  } else if (score >= 5) {
    level = 'MEDIUM';
  } else {
    level = 'LOW';
  }

  return { score, level };
}

function generateRiskCode(): string {
  const maxNum = store.risks.reduce((max, r) => {
    const match = r.risk_code.match(/RSK-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      return num > max ? num : max;
    }
    return max;
  }, 0);
  return `RSK-${String(maxNum + 1).padStart(4, '0')}`;
}

// GET /matrix — 5x5 Risk Heatmap Matrix
router.get('/matrix', authenticate, async (_req: Request, res: Response) => {
  try {
    // 5 rows (impact 5 down to 1), 5 cols (likelihood 1 to 5)
    const grid: { likelihood: number; impact: number; count: number; score: number; level: RiskLevel; risks: any[] }[][] = [];

    for (let impact = 5; impact >= 1; impact--) {
      const row = [];
      for (let likelihood = 1; likelihood <= 5; likelihood++) {
        const { score, level } = calculateRiskScore(likelihood, impact);
        const cellRisks = store.risks.filter((r) => r.likelihood === likelihood && r.impact === impact);
        row.push({
          likelihood,
          impact,
          score,
          level,
          count: cellRisks.length,
          risks: cellRisks.map((r) => ({ id: r.id, risk_code: r.risk_code, title: r.title })),
        });
      }
      grid.push(row);
    }

    return res.json({ success: true, data: grid });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /summary — Risk Register stats summary
router.get('/summary', authenticate, async (_req: Request, res: Response) => {
  try {
    const summary = {
      total: store.risks.length,
      by_level: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 } as Record<string, number>,
      by_status: { OPEN: 0, MITIGATED: 0, ACCEPTED: 0, CLOSED: 0 } as Record<string, number>,
      by_category: {} as Record<string, number>,
    };

    for (const r of store.risks) {
      summary.by_level[r.risk_level] = (summary.by_level[r.risk_level] || 0) + 1;
      summary.by_status[r.status] = (summary.by_status[r.status] || 0) + 1;
      summary.by_category[r.category] = (summary.by_category[r.category] || 0) + 1;
    }

    return res.json({ success: true, data: summary });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET / — list risks with filters, search, pagination
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const search = ((req.query.search as string) || '').toLowerCase().trim();
    const category = req.query.category as string;
    const status = req.query.status as string;
    const risk_level = req.query.risk_level as string;
    const asset_id = req.query.asset_id as string;
    const sort_by = (req.query.sort_by as string) || 'risk_score';
    const sort_order = (req.query.sort_order as string) === 'asc' ? 1 : -1;

    let filtered = store.risks.filter((risk) => {
      if (search) {
        const matchesTitle = risk.title.toLowerCase().includes(search);
        const matchesCode = risk.risk_code.toLowerCase().includes(search);
        const matchesDesc = (risk.description || '').toLowerCase().includes(search);
        const matchesOwner = (risk.owner || '').toLowerCase().includes(search);
        if (!matchesTitle && !matchesCode && !matchesDesc && !matchesOwner) return false;
      }
      if (category && risk.category !== category) return false;
      if (status && risk.status !== status) return false;
      if (risk_level && risk.risk_level !== risk_level) return false;
      if (asset_id && risk.asset_id !== asset_id) return false;
      return true;
    });

    filtered.sort((a: any, b: any) => {
      const valA = a[sort_by] ?? '';
      const valB = b[sort_by] ?? '';
      if (valA < valB) return -1 * sort_order;
      if (valA > valB) return 1 * sort_order;
      return 0;
    });

    // Attach linked asset info for display in risk register
    const enriched = filtered.map((r) => {
      const asset = store.assets.find((a) => a.id === r.asset_id);
      return {
        ...r,
        asset: asset ? { id: asset.id, asset_code: asset.asset_code, name: asset.name, criticality: asset.criticality } : null,
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

// GET /:id — detail view with linked asset, controls, findings, remediations
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const risk = store.risks.find((r) => r.id === req.params.id || r.risk_code === req.params.id);
    if (!risk) {
      return res.status(404).json({ success: false, error: 'Risk not found' });
    }

    const asset = store.assets.find((a) => a.id === risk.asset_id);
    const controls = store.controls.filter((c) => c.risk_id === risk.id);
    const findings = store.findings.filter((f) => f.risk_id === risk.id);
    const findingIds = new Set(findings.map((f) => f.id));
    const remediations = store.remediations.filter((rem) => findingIds.has(rem.finding_id));

    return res.json({
      success: true,
      data: {
        ...risk,
        asset: asset || null,
        controls,
        findings,
        remediations,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST / — create risk (Score & level calculated automatically!)
router.post('/', authenticate, authorize('ADMIN', 'GRC_OFFICER'), async (req: Request, res: Response) => {
  try {
    const { title, asset_id, category, description, likelihood, impact, existing_mitigation, recommendation, status, owner } = req.body;

    if (!title || !asset_id || !category || likelihood === undefined || impact === undefined) {
      return res.status(400).json({
        success: false,
        error: 'title, asset_id, category, likelihood (1-5), and impact (1-5) are required',
      });
    }

    const l = Number(likelihood);
    const i = Number(impact);

    if (l < 1 || l > 5 || i < 1 || i > 5) {
      return res.status(400).json({ success: false, error: 'Likelihood and Impact must be integers between 1 and 5' });
    }

    const { score, level } = calculateRiskScore(l, i);
    const risk_code = req.body.risk_code || generateRiskCode();

    const newRisk: Risk = {
      id: `rsk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      risk_code,
      title,
      asset_id,
      category,
      description: description || null,
      likelihood: l,
      impact: i,
      risk_score: score,
      risk_level: level,
      existing_mitigation: existing_mitigation || null,
      recommendation: recommendation || null,
      status: status || 'OPEN',
      owner: owner || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    store.risks.unshift(newRisk);
    store.logActivity(req.userId || null, 'CREATED_RISK', 'Risks', newRisk.id, {
      risk_code: newRisk.risk_code,
      title: newRisk.title,
      score: newRisk.risk_score,
      level: newRisk.risk_level,
    });

    return res.status(201).json({
      success: true,
      data: newRisk,
      message: 'Risk created successfully',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /:id — update risk
router.put('/:id', authenticate, authorize('ADMIN', 'GRC_OFFICER'), async (req: Request, res: Response) => {
  try {
    const index = store.risks.findIndex((r) => r.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Risk not found' });
    }

    const current = store.risks[index];
    const updates = { ...req.body };

    const l = updates.likelihood !== undefined ? Number(updates.likelihood) : current.likelihood;
    const i = updates.impact !== undefined ? Number(updates.impact) : current.impact;
    const { score, level } = calculateRiskScore(l, i);

    const updated: Risk = {
      ...current,
      ...updates,
      id: current.id,
      risk_code: current.risk_code, // preserve code
      likelihood: l,
      impact: i,
      risk_score: score,
      risk_level: level,
      updated_at: new Date().toISOString(),
    };

    store.risks[index] = updated;
    store.logActivity(req.userId || null, 'UPDATED_RISK', 'Risks', updated.id, {
      risk_code: updated.risk_code,
      title: updated.title,
      score: updated.risk_score,
      level: updated.risk_level,
    });

    return res.json({
      success: true,
      data: updated,
      message: 'Risk updated successfully',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /:id — delete risk (ADMIN only)
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const index = store.risks.findIndex((r) => r.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Risk not found' });
    }

    const deleted = store.risks.splice(index, 1)[0];
    store.logActivity(req.userId || null, 'DELETED_RISK', 'Risks', deleted.id, {
      risk_code: deleted.risk_code,
      title: deleted.title,
    });

    return res.json({
      success: true,
      message: `Risk ${deleted.risk_code} deleted successfully`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
