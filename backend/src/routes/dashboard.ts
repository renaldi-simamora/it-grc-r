import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase';

const router = Router();

// GET /stats
router.get('/stats', authenticate, async (_req: Request, res: Response) => {
  try {
    const [
      { count: totalAssets },
      { data: risks },
      { data: controls },
      { data: findings },
      { data: assessments },
    ] = await Promise.all([
      supabaseAdmin.from('assets').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('risks').select('risk_level, status'),
      supabaseAdmin.from('controls').select('status'),
      supabaseAdmin.from('findings').select('status, severity'),
      supabaseAdmin.from('compliance_assessments').select('status'),
    ]);

    const risksByLevel = { critical: 0, high: 0, medium: 0, low: 0 } as Record<string, number>;
    for (const r of risks || []) {
      risksByLevel[r.risk_level] = (risksByLevel[r.risk_level] || 0) + 1;
    }

    const controlsByStatus = {} as Record<string, number>;
    for (const c of controls || []) {
      controlsByStatus[c.status] = (controlsByStatus[c.status] || 0) + 1;
    }

    const findingsByStatus = {} as Record<string, number>;
    for (const f of findings || []) {
      findingsByStatus[f.status] = (findingsByStatus[f.status] || 0) + 1;
    }

    const allAssessments = assessments || [];
    const compliant = allAssessments.filter((a) => a.status === 'compliant').length;
    const complianceRate = allAssessments.length > 0 ? Math.round((compliant / allAssessments.length) * 100) : 0;

    return res.json({
      success: true,
      data: {
        total_assets: totalAssets || 0,
        total_risks: (risks || []).length,
        total_controls: (controls || []).length,
        total_findings: (findings || []).length,
        risks_by_level: risksByLevel,
        controls_by_status: controlsByStatus,
        findings_by_status: findingsByStatus,
        compliance_rate: complianceRate,
        total_assessments: allAssessments.length,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /risk-matrix
router.get('/risk-matrix', authenticate, async (_req: Request, res: Response) => {
  try {
    const { data: risks, error } = await supabaseAdmin.from('risks').select('likelihood, impact');
    if (error) return res.status(500).json({ success: false, error: error.message });

    // Build 5x5 matrix
    const matrix: number[][] = Array.from({ length: 5 }, () => Array(5).fill(0));
    for (const r of risks || []) {
      if (r.likelihood >= 1 && r.likelihood <= 5 && r.impact >= 1 && r.impact <= 5) {
        matrix[r.likelihood - 1][r.impact - 1]++;
      }
    }

    return res.json({ success: true, data: { matrix, total_risks: (risks || []).length } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /recent-activity
router.get('/recent-activity', authenticate, async (req: Request, res: Response) => {
  try {
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));

    const { data, error } = await supabaseAdmin
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
