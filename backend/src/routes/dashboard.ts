import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { store } from '../lib/store';

const router = Router();

// GET /stats or GET /summary — real live calculated metrics
router.get(['/stats', '/summary'], authenticate, async (_req: Request, res: Response) => {
  try {
    store.checkOverdueRemediations();

    const totalAssets = store.assets.length;
    const totalRisks = store.risks.length;

    // Risks by level
    const risksByLevel = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    const risksByCategory: Record<string, number> = {};
    for (const r of store.risks) {
      if (r.risk_level in risksByLevel) {
        risksByLevel[r.risk_level as keyof typeof risksByLevel]++;
      }
      risksByCategory[r.category] = (risksByCategory[r.category] || 0) + 1;
    }

    // Controls by implementation status & effectiveness
    const controlsByStatus: Record<string, number> = {
      IMPLEMENTED: 0,
      PARTIALLY_IMPLEMENTED: 0,
      NOT_IMPLEMENTED: 0,
      NOT_APPLICABLE: 0,
    };
    for (const c of store.controls) {
      if (c.implementation_status in controlsByStatus) {
        controlsByStatus[c.implementation_status]++;
      }
    }

    // Findings by severity & status
    const findingsBySeverity: Record<string, number> = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    const findingsByStatus: Record<string, number> = { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0, VERIFIED: 0, CLOSED: 0 };
    for (const f of store.findings) {
      if (f.severity in findingsBySeverity) {
        findingsBySeverity[f.severity]++;
      }
      if (f.status in findingsByStatus) {
        findingsByStatus[f.status]++;
      }
    }

    // Remediations
    const remediationsByStatus: Record<string, number> = {
      OPEN: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      OVERDUE: 0,
      VERIFIED: 0,
    };
    for (const rem of store.remediations) {
      if (rem.status in remediationsByStatus) {
        remediationsByStatus[rem.status]++;
      }
    }

    // Compliance calculation
    const applicableCompliance = store.complianceItems.filter((i) => i.status !== 'NOT_APPLICABLE');
    const compliantCount = store.complianceItems.filter((i) => i.status === 'COMPLIANT').length;
    const partialCount = store.complianceItems.filter((i) => i.status === 'PARTIALLY_COMPLIANT').length;
    const complianceRate =
      applicableCompliance.length > 0
        ? Math.round(((compliantCount + partialCount * 0.5) / applicableCompliance.length) * 100)
        : 0;

    // Recent activity logs
    const recentActivity = store.activityLogs.slice(0, 10);

    return res.json({
      success: true,
      data: {
        total_assets: totalAssets,
        total_risks: totalRisks,
        critical_risks: risksByLevel.CRITICAL,
        high_risks: risksByLevel.HIGH,
        medium_risks: risksByLevel.MEDIUM,
        low_risks: risksByLevel.LOW,
        risks_by_level: risksByLevel,
        risks_by_category: risksByCategory,

        total_controls: store.controls.length,
        compliant_controls: controlsByStatus.IMPLEMENTED,
        partially_compliant_controls: controlsByStatus.PARTIALLY_IMPLEMENTED,
        non_compliant_controls: controlsByStatus.NOT_IMPLEMENTED,
        controls_by_status: controlsByStatus,

        total_findings: store.findings.length,
        open_findings: findingsByStatus.OPEN + findingsByStatus.IN_PROGRESS,
        resolved_findings: findingsByStatus.RESOLVED + findingsByStatus.VERIFIED + findingsByStatus.CLOSED,
        findings_by_severity: findingsBySeverity,
        findings_by_status: findingsByStatus,

        total_remediations: store.remediations.length,
        overdue_remediation: remediationsByStatus.OVERDUE,
        remediations_by_status: remediationsByStatus,

        overall_compliance_percentage: complianceRate,
        recent_activity: recentActivity,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /recent-activity — full list of recent activity logs
router.get('/recent-activity', authenticate, async (req: Request, res: Response) => {
  try {
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    return res.json({
      success: true,
      data: store.activityLogs.slice(0, limit),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /risk-matrix — 5x5 heatmap counts
router.get('/risk-matrix', authenticate, async (_req: Request, res: Response) => {
  try {
    const cells: { likelihood: number; impact: number; count: number }[] = [];
    for (let l = 1; l <= 5; l++) {
      for (let i = 1; i <= 5; i++) {
        const count = store.risks.filter((r) => r.likelihood === l && r.impact === i).length;
        cells.push({ likelihood: l, impact: i, count });
      }
    }
    return res.json({ success: true, data: cells });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
