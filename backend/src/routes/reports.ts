import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase';

const router = Router();

// GET /risk-register
router.get('/risk-register', authenticate, async (_req: Request, res: Response) => {
  try {
    const { data: risks, error } = await supabaseAdmin
      .from('risks')
      .select('*')
      .order('risk_score', { ascending: false });

    if (error) return res.status(500).json({ success: false, error: error.message });

    // Enrich with linked controls count
    const enriched = await Promise.all(
      (risks || []).map(async (risk) => {
        const { count } = await supabaseAdmin
          .from('risk_controls')
          .select('*', { count: 'exact', head: true })
          .eq('risk_id', risk.id);
        return { ...risk, controls_count: count || 0 };
      }),
    );

    return res.json({ success: true, data: enriched });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /compliance-status
router.get('/compliance-status', authenticate, async (_req: Request, res: Response) => {
  try {
    const { data: frameworks, error } = await supabaseAdmin.from('compliance_frameworks').select('*');
    if (error) return res.status(500).json({ success: false, error: error.message });

    const result = await Promise.all(
      (frameworks || []).map(async (fw) => {
        const { data: reqs } = await supabaseAdmin
          .from('compliance_requirements')
          .select('id')
          .eq('framework_id', fw.id);

        const reqIds = (reqs || []).map((r: any) => r.id);
        if (reqIds.length === 0) {
          return { ...fw, total_requirements: 0, assessments: {}, compliance_rate: 0 };
        }

        const { data: assessments } = await supabaseAdmin
          .from('compliance_assessments')
          .select('status')
          .in('requirement_id', reqIds);

        const stats = {} as Record<string, number>;
        for (const a of assessments || []) {
          stats[a.status] = (stats[a.status] || 0) + 1;
        }

        const total = (assessments || []).length;
        const compliant = stats['compliant'] || 0;

        return {
          ...fw,
          total_requirements: reqIds.length,
          assessments: stats,
          compliance_rate: total > 0 ? Math.round((compliant / total) * 100) : 0,
        };
      }),
    );

    return res.json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /control-effectiveness
router.get('/control-effectiveness', authenticate, async (_req: Request, res: Response) => {
  try {
    const { data: controls, error } = await supabaseAdmin.from('controls').select('id, control_code, title, status, effectiveness');
    if (error) return res.status(500).json({ success: false, error: error.message });

    const summary = {
      total: (controls || []).length,
      by_effectiveness: {} as Record<string, number>,
      by_status: {} as Record<string, number>,
    };

    for (const c of controls || []) {
      const eff = c.effectiveness || 'not_assessed';
      summary.by_effectiveness[eff] = (summary.by_effectiveness[eff] || 0) + 1;
      summary.by_status[c.status] = (summary.by_status[c.status] || 0) + 1;
    }

    return res.json({ success: true, data: { controls, summary } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /executive-summary
router.get('/executive-summary', authenticate, async (_req: Request, res: Response) => {
  try {
    const [
      { count: totalAssets },
      { data: risks },
      { data: controls },
      { data: findings },
      { data: remediations },
      { data: assessments },
    ] = await Promise.all([
      supabaseAdmin.from('assets').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('risks').select('risk_level, status'),
      supabaseAdmin.from('controls').select('status, effectiveness'),
      supabaseAdmin.from('findings').select('status, severity'),
      supabaseAdmin.from('remediation_plans').select('status'),
      supabaseAdmin.from('compliance_assessments').select('status'),
    ]);

    const openRisks = (risks || []).filter((r) => !['closed', 'accepted'].includes(r.status)).length;
    const criticalRisks = (risks || []).filter((r) => r.risk_level === 'critical').length;
    const highRisks = (risks || []).filter((r) => r.risk_level === 'high').length;

    const activeControls = (controls || []).filter((c) => c.status === 'active').length;
    const effectiveControls = (controls || []).filter((c) => c.effectiveness === 'effective').length;

    const openFindings = (findings || []).filter((f) => ['open', 'in_progress'].includes(f.status)).length;
    const criticalFindings = (findings || []).filter((f) => f.severity === 'critical' && f.status !== 'closed').length;

    const overdueRemediations = (remediations || []).filter((r) => r.status === 'overdue').length;

    const totalAssessments = (assessments || []).length;
    const compliantCount = (assessments || []).filter((a) => a.status === 'compliant').length;

    return res.json({
      success: true,
      data: {
        total_assets: totalAssets || 0,
        risk_posture: {
          total: (risks || []).length,
          open: openRisks,
          critical: criticalRisks,
          high: highRisks,
        },
        control_health: {
          total: (controls || []).length,
          active: activeControls,
          effective: effectiveControls,
        },
        findings_overview: {
          total: (findings || []).length,
          open: openFindings,
          critical: criticalFindings,
        },
        remediation_status: {
          total: (remediations || []).length,
          overdue: overdueRemediations,
        },
        compliance_rate: totalAssessments > 0 ? Math.round((compliantCount / totalAssessments) * 100) : 0,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
