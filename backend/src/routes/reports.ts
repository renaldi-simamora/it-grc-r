import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { store } from '../lib/store';

const router = Router();

// GET /assessment — comprehensive IT GRC Assessment Report data
router.get('/assessment', authenticate, async (_req: Request, res: Response) => {
  try {
    store.checkOverdueRemediations();

    // 1. Cover & Meta
    const cover = {
      title: 'IT Governance, Risk & Compliance Assessment Report',
      organization: 'PT Nusantara Digital',
      simulation_badge: 'SIMULATION / SYNTHETIC DATA — PERSONAL PORTFOLIO PROJECT',
      disclaimer:
        'This assessment report contains fictional, synthetic simulation data created for academic and personal portfolio demonstration. It does not represent a certified ISO 27001 audit or real organizational evaluation.',
      generated_at: new Date().toISOString(),
      lead_assessor: 'Ahmad Pratama (Lead Auditor)',
      review_period: 'Q1 2026',
    };

    // 2. Executive Summary
    const totalRisks = store.risks.length;
    const criticalRisks = store.risks.filter((r) => r.risk_level === 'CRITICAL').length;
    const highRisks = store.risks.filter((r) => r.risk_level === 'HIGH').length;
    const openFindings = store.findings.filter((f) => f.status === 'OPEN' || f.status === 'IN_PROGRESS').length;
    const overdueRemediations = store.remediations.filter((rem) => rem.status === 'OVERDUE').length;

    const applicableCompliance = store.complianceItems.filter((i) => i.status !== 'NOT_APPLICABLE');
    const compliantCount = store.complianceItems.filter((i) => i.status === 'COMPLIANT').length;
    const partialCount = store.complianceItems.filter((i) => i.status === 'PARTIALLY_COMPLIANT').length;
    const complianceRate =
      applicableCompliance.length > 0
        ? Math.round(((compliantCount + partialCount * 0.5) / applicableCompliance.length) * 100)
        : 0;

    const executiveSummary = {
      total_assets_scoped: store.assets.length,
      total_risks_identified: totalRisks,
      critical_risk_count: criticalRisks,
      high_risk_count: highRisks,
      total_controls_managed: store.controls.length,
      effective_controls_count: store.controls.filter((c) => c.effectiveness === 'EFFECTIVE').length,
      open_findings_count: openFindings,
      overdue_remediations_count: overdueRemediations,
      overall_compliance_score: complianceRate,
      posture_assessment:
        criticalRisks > 0
          ? 'Requires Immediate Executive Attention: High-severity technical gaps in Disaster Recovery and Privileged Access Management require remediation.'
          : 'Moderate Security Posture: Routine baseline controls operational with minor remediation actions pending.',
    };

    // 3. Assessment Scope
    const scope = {
      target_systems: store.assets.map((a) => ({
        asset_code: a.asset_code,
        name: a.name,
        type: a.type,
        criticality: a.criticality,
        owner: a.owner,
      })),
      domains_assessed: [
        'Access Control & IAM',
        'Data Security & Encryption',
        'Disaster Recovery & Backup Resiliency',
        'Container & Infrastructure Security',
        'Incident Response & Audit Logging',
        'Third-Party Vendor Management',
      ],
    };

    // 4. Asset Overview
    const assetSummary = {
      total: store.assets.length,
      by_criticality: {
        CRITICAL: store.assets.filter((a) => a.criticality === 'CRITICAL').length,
        HIGH: store.assets.filter((a) => a.criticality === 'HIGH').length,
        MEDIUM: store.assets.filter((a) => a.criticality === 'MEDIUM').length,
        LOW: store.assets.filter((a) => a.criticality === 'LOW').length,
      },
    };

    // 5. Risk Summary & Top Risks
    const topRisks = store.risks
      .slice()
      .sort((a, b) => b.risk_score - a.risk_score)
      .slice(0, 5)
      .map((r) => {
        const asset = store.assets.find((a) => a.id === r.asset_id);
        return {
          ...r,
          asset_name: asset ? asset.name : 'Unknown Asset',
        };
      });

    // 6. Risk Register
    const riskRegister = store.risks.map((r) => {
      const asset = store.assets.find((a) => a.id === r.asset_id);
      const controls = store.controls.filter((c) => c.risk_id === r.id);
      return {
        ...r,
        asset_name: asset ? asset.name : '—',
        controls_count: controls.length,
      };
    });

    // 7. Control Assessment Overview
    const controlAssessmentSummary = {
      total: store.controls.length,
      by_implementation: {
        IMPLEMENTED: store.controls.filter((c) => c.implementation_status === 'IMPLEMENTED').length,
        PARTIALLY_IMPLEMENTED: store.controls.filter((c) => c.implementation_status === 'PARTIALLY_IMPLEMENTED').length,
        NOT_IMPLEMENTED: store.controls.filter((c) => c.implementation_status === 'NOT_IMPLEMENTED').length,
      },
      by_effectiveness: {
        EFFECTIVE: store.controls.filter((c) => c.effectiveness === 'EFFECTIVE').length,
        PARTIALLY_EFFECTIVE: store.controls.filter((c) => c.effectiveness === 'PARTIALLY_EFFECTIVE').length,
        INEFFECTIVE: store.controls.filter((c) => c.effectiveness === 'INEFFECTIVE').length,
      },
      controls: store.controls,
    };

    // 8. Evidence Summary
    const evidenceSummary = {
      total_collected: store.evidences.length,
      approved_count: store.evidences.filter((e) => e.review_status === 'APPROVED').length,
      pending_count: store.evidences.filter((e) => e.review_status === 'PENDING').length,
      rejected_count: store.evidences.filter((e) => e.review_status === 'REJECTED').length,
      items: store.evidences.slice(0, 10),
    };

    // 9. Findings
    const findings = store.findings.map((f) => {
      const rems = store.remediations.filter((m) => m.finding_id === f.id);
      return {
        ...f,
        remediations: rems,
      };
    });

    // 10. Remediation Status
    const remediationStatus = {
      total: store.remediations.length,
      overdue: store.remediations.filter((r) => r.status === 'OVERDUE').length,
      in_progress: store.remediations.filter((r) => r.status === 'IN_PROGRESS').length,
      completed: store.remediations.filter((r) => r.status === 'COMPLETED' || r.status === 'VERIFIED').length,
      items: store.remediations,
    };

    // 11. Compliance Summary
    const complianceSummary = {
      overall_rate: complianceRate,
      items: store.complianceItems,
    };

    // 12. Recommendations
    const recommendations = [
      'Prioritize execution of the semi-annual Disaster Recovery drill for Customer DB (FND-0001) to satisfy RTO/RPO targets.',
      'Enforce automated secret rotation via HashiCorp Vault across remaining legacy microservices (FND-0002).',
      'Deploy just-in-time Privileged Access Management (PAM) for production Kubernetes administration (FND-0003).',
      'Scale worker nodes and drain pods to apply outstanding Linux kernel security patches on cluster hosts (FND-0004).',
      'Implement secondary clearing partner circuit breaker switch to prevent payment service disruptions (FND-0005).',
    ];

    return res.json({
      success: true,
      data: {
        cover,
        executive_summary: executiveSummary,
        scope,
        asset_summary: assetSummary,
        top_risks: topRisks,
        risk_register: riskRegister,
        control_assessment_summary: controlAssessmentSummary,
        evidence_summary: evidenceSummary,
        findings,
        remediation_status: remediationStatus,
        compliance_summary: complianceSummary,
        recommendations,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
