import {
  UserProfile,
  Asset,
  Risk,
  Control,
  ControlAssessment,
  ControlChecklistItem,
  Evidence,
  Finding,
  Remediation,
  ComplianceItem,
  ActivityLog,
  Pagination,
} from '../types';
import {
  DEMO_PROFILES,
  DEMO_ASSETS,
  DEMO_RISKS,
  DEMO_CONTROLS,
  DEMO_EVIDENCES,
  DEMO_FINDINGS,
  DEMO_REMEDIATIONS,
  DEMO_COMPLIANCE_ITEMS,
  DEMO_ACTIVITY_LOGS,
} from '../seeds/demoData';

class GRCDataStore {
  public profiles: UserProfile[] = [];
  public assets: Asset[] = [];
  public risks: Risk[] = [];
  public controls: Control[] = [];
  public controlAssessments: ControlAssessment[] = [];
  public checklistItems: ControlChecklistItem[] = [];
  public evidences: Evidence[] = [];
  public findings: Finding[] = [];
  public remediations: Remediation[] = [];
  public complianceItems: ComplianceItem[] = [];
  public activityLogs: ActivityLog[] = [];

  constructor() {
    this.resetToDefaults();
  }

  public resetToDefaults() {
    this.profiles = JSON.parse(JSON.stringify(DEMO_PROFILES));
    this.assets = JSON.parse(JSON.stringify(DEMO_ASSETS));
    this.risks = JSON.parse(JSON.stringify(DEMO_RISKS));
    this.controls = JSON.parse(JSON.stringify(DEMO_CONTROLS));
    this.evidences = JSON.parse(JSON.stringify(DEMO_EVIDENCES));
    this.findings = JSON.parse(JSON.stringify(DEMO_FINDINGS));
    this.remediations = JSON.parse(JSON.stringify(DEMO_REMEDIATIONS));
    this.complianceItems = JSON.parse(JSON.stringify(DEMO_COMPLIANCE_ITEMS));
    this.activityLogs = JSON.parse(JSON.stringify(DEMO_ACTIVITY_LOGS));

    // Generate sample assessments for controls
    this.controlAssessments = [
      {
        id: 'ca010000-0000-0000-0000-000000000001',
        control_id: 'c0060000-0000-0000-0000-000000000006',
        assessor_id: '11111111-1111-1111-1111-111111111111',
        status: 'COMPLIANT',
        score: 100,
        notes: 'MFA verified for 100% of internal workforce.',
        created_at: '2026-02-01T10:00:00.000Z',
        updated_at: '2026-02-01T10:00:00.000Z',
      },
      {
        id: 'ca020000-0000-0000-0000-000000000002',
        control_id: 'c0050000-0000-0000-0000-000000000005',
        assessor_id: '11111111-1111-1111-1111-111111111111',
        status: 'NON_COMPLIANT',
        score: 25,
        notes: 'Backup restoration test is overdue by over 14 months.',
        created_at: '2026-02-05T10:00:00.000Z',
        updated_at: '2026-02-05T10:00:00.000Z',
      },
    ];

    this.checklistItems = [
      {
        id: 'chk-0001',
        assessment_id: 'ca010000-0000-0000-0000-000000000001',
        title: 'MFA enabled for all cloud admin accounts',
        status: 'COMPLIANT',
        notes: 'Verified via Okta identity directory export.',
        evidence_id: 'e0010000-0000-0000-0000-000000000001',
      },
      {
        id: 'chk-0002',
        assessment_id: 'ca010000-0000-0000-0000-000000000001',
        title: 'MFA recovery codes generated and vaulted securely',
        status: 'COMPLIANT',
        notes: 'Stored in 1Password enterprise vault.',
        evidence_id: null,
      },
      {
        id: 'chk-0003',
        assessment_id: 'ca020000-0000-0000-0000-000000000002',
        title: 'Semi-annual automated database restore executed',
        status: 'NON_COMPLIANT',
        notes: 'Last restore log was from November 2024.',
        evidence_id: 'e0050000-0000-0000-0000-000000000005',
      },
    ];

    this.checkOverdueRemediations();
  }

  // Automatically mark overdue remediations
  public checkOverdueRemediations() {
    const now = new Date().getTime();
    for (const rem of this.remediations) {
      if (rem.status !== 'COMPLETED' && rem.status !== 'VERIFIED' && rem.due_date) {
        if (new Date(rem.due_date).getTime() < now) {
          rem.status = 'OVERDUE';
        }
      }
    }
  }

  // Activity logger helper
  public logActivity(
    userId: string | null,
    action: string,
    module: string,
    referenceId: string | null,
    details: Record<string, any> | null
  ) {
    const user = this.profiles.find((p) => p.id === userId);
    const newLog: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      action,
      module,
      reference_id: referenceId,
      details,
      created_at: new Date().toISOString(),
      user_name: user ? user.full_name : 'System / GRC User',
    };
    this.activityLogs.unshift(newLog);
  }
}

export const store = new GRCDataStore();
