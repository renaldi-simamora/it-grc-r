export type UserRole = 'admin' | 'analyst' | 'auditor' | 'viewer';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  department: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: string;
  name: string;
  type: 'server' | 'application' | 'database' | 'network_device' | 'endpoint' | 'cloud_service' | 'other';
  description: string | null;
  owner: string | null;
  department: string | null;
  location: string | null;
  status: 'active' | 'inactive' | 'decommissioned' | 'under_review';
  criticality: 'critical' | 'high' | 'medium' | 'low';
  classification: 'public' | 'internal' | 'confidential' | 'restricted';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Risk {
  id: string;
  risk_code: string;
  title: string;
  description: string | null;
  category: 'operational' | 'security' | 'compliance' | 'strategic' | 'financial' | 'reputational';
  source: string | null;
  asset_id: string | null;
  status: 'identified' | 'assessed' | 'mitigated' | 'accepted' | 'closed';
  likelihood: number; // 1-5
  impact: number; // 1-5
  risk_score: number; // likelihood * impact
  risk_level: 'critical' | 'high' | 'medium' | 'low';
  risk_owner: string | null;
  treatment: 'mitigate' | 'accept' | 'transfer' | 'avoid' | null;
  residual_likelihood: number | null;
  residual_impact: number | null;
  residual_score: number | null;
  residual_level: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Control {
  id: string;
  control_code: string;
  title: string;
  description: string | null;
  type: 'preventive' | 'detective' | 'corrective' | 'compensating';
  category: 'technical' | 'administrative' | 'physical';
  frequency: 'continuous' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'ad_hoc';
  status: 'active' | 'inactive' | 'planned' | 'under_review';
  owner: string | null;
  effectiveness: 'effective' | 'partially_effective' | 'ineffective' | 'not_assessed' | null;
  framework_ref: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface RiskControl {
  id: string;
  risk_id: string;
  control_id: string;
  created_at: string;
}

export interface ControlAssessment {
  id: string;
  control_id: string;
  assessment_date: string;
  assessor_id: string;
  design_effectiveness: 'effective' | 'partially_effective' | 'ineffective';
  operating_effectiveness: 'effective' | 'partially_effective' | 'ineffective';
  overall_effectiveness: 'effective' | 'partially_effective' | 'ineffective';
  notes: string | null;
  next_assessment_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Evidence {
  id: string;
  control_assessment_id: string | null;
  control_id: string | null;
  title: string;
  description: string | null;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_by: string;
  review_status: 'pending' | 'approved' | 'rejected';
  reviewed_by: string | null;
  review_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface Finding {
  id: string;
  finding_code: string;
  title: string;
  description: string | null;
  type: 'nonconformity' | 'observation' | 'opportunity_for_improvement';
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'remediated' | 'closed' | 'accepted';
  source: 'control_assessment' | 'audit' | 'incident' | 'self_assessment' | 'other';
  control_id: string | null;
  risk_id: string | null;
  asset_id: string | null;
  control_assessment_id: string | null;
  identified_by: string;
  identified_date: string;
  due_date: string | null;
  closed_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface RemediationPlan {
  id: string;
  finding_id: string;
  title: string;
  description: string | null;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'planned' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
  assigned_to: string | null;
  start_date: string | null;
  target_date: string | null;
  completion_date: string | null;
  progress_pct: number;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ComplianceFramework {
  id: string;
  name: string;
  version: string | null;
  description: string | null;
  status: 'active' | 'inactive' | 'draft';
  created_at: string;
  updated_at: string;
}

export interface ComplianceRequirement {
  id: string;
  framework_id: string;
  requirement_code: string;
  title: string;
  description: string | null;
  category: string | null;
  created_at: string;
}

export interface ComplianceAssessment {
  id: string;
  requirement_id: string;
  control_id: string | null;
  status: 'compliant' | 'partially_compliant' | 'non_compliant' | 'not_applicable' | 'not_assessed';
  evidence_notes: string | null;
  assessed_by: string;
  assessed_date: string;
  next_review_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: UserProfile;
}
