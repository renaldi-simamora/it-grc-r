export type UserRole = 'ADMIN' | 'GRC_OFFICER';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export type AssetType = 'Application' | 'Database' | 'Server' | 'Network' | 'Endpoint' | 'Cloud Service' | 'Other';
export type CriticalityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AssetStatus = 'ACTIVE' | 'INACTIVE' | 'RETIRED';

export interface Asset {
  id: string;
  asset_code: string;
  name: string;
  type: AssetType;
  description: string | null;
  owner: string | null;
  department: string | null;
  criticality: CriticalityLevel;
  status: AssetStatus;
  created_at: string;
  updated_at: string;
}

export type RiskCategory =
  | 'Access Control'
  | 'Data Security'
  | 'Availability'
  | 'Infrastructure'
  | 'Application Security'
  | 'Compliance'
  | 'Operational'
  | 'Third Party'
  | 'Other';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RiskStatus = 'OPEN' | 'MITIGATED' | 'ACCEPTED' | 'CLOSED';

export interface Risk {
  id: string;
  risk_code: string;
  title: string;
  asset_id: string;
  category: RiskCategory | string;
  description: string | null;
  likelihood: number; // 1-5
  impact: number; // 1-5
  risk_score: number; // likelihood * impact (1-25)
  risk_level: RiskLevel;
  existing_mitigation: string | null;
  recommendation: string | null;
  status: RiskStatus;
  owner: string | null;
  created_at: string;
  updated_at: string;
  asset?: Asset | null;
}

export type ControlFrequency =
  | 'Continuous'
  | 'Daily'
  | 'Weekly'
  | 'Monthly'
  | 'Quarterly'
  | 'Semi-Annual'
  | 'Annual'
  | 'Ad Hoc';

export type ImplementationStatus =
  | 'IMPLEMENTED'
  | 'PARTIALLY_IMPLEMENTED'
  | 'NOT_IMPLEMENTED'
  | 'NOT_APPLICABLE';

export type ControlEffectiveness =
  | 'EFFECTIVE'
  | 'PARTIALLY_EFFECTIVE'
  | 'INEFFECTIVE'
  | 'NOT_ASSESSED';

export interface Control {
  id: string;
  control_code: string;
  name: string;
  description: string | null;
  risk_id: string;
  owner: string | null;
  frequency: ControlFrequency;
  implementation_status: ImplementationStatus;
  effectiveness: ControlEffectiveness;
  created_at: string;
  updated_at: string;
  risk?: Risk | null;
}

export type AssessmentStatus = 'COMPLIANT' | 'PARTIALLY_COMPLIANT' | 'NON_COMPLIANT' | 'NOT_APPLICABLE';

export interface ControlAssessment {
  id: string;
  control_id: string;
  assessor_id: string | null;
  status: AssessmentStatus;
  score: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  checklist_items?: ControlChecklistItem[];
  control?: Control;
}

export interface ControlChecklistItem {
  id: string;
  assessment_id: string;
  title: string;
  status: AssessmentStatus;
  notes: string | null;
  evidence_id: string | null;
  evidence?: Evidence;
}

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Evidence {
  id: string;
  evidence_code: string;
  control_id: string;
  file_name: string;
  file_path: string;
  description: string | null;
  uploaded_by: string | null;
  review_status: ReviewStatus;
  uploaded_at: string;
  reviewed_at: string | null;
  reviewer: string | null;
  reviewer_notes: string | null;
  control?: Control;
}

export type FindingSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type FindingStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'VERIFIED' | 'CLOSED';

export interface Finding {
  id: string;
  finding_code: string;
  title: string;
  description: string | null;
  risk_id: string | null;
  control_id: string | null;
  severity: FindingSeverity;
  recommendation: string | null;
  owner: string | null;
  due_date: string | null;
  status: FindingStatus;
  created_at: string;
  updated_at: string;
  risk?: Risk | null;
  control?: Control | null;
  remediations?: Remediation[];
}

export type RemediationStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'VERIFIED';

export interface Remediation {
  id: string;
  finding_id: string;
  action: string;
  owner: string | null;
  due_date: string | null;
  status: RemediationStatus;
  completion_notes: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  finding?: Finding;
}

export type ComplianceCategory =
  | 'Access Control'
  | 'Data Protection'
  | 'Backup & Recovery'
  | 'Change Management'
  | 'Incident Management'
  | 'Asset Management'
  | 'Documentation';

export interface ComplianceItem {
  id: string;
  title: string;
  description: string;
  category: ComplianceCategory;
  status: AssessmentStatus;
  notes: string | null;
  responsible_owner: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  module: string;
  reference_id: string | null;
  details: Record<string, any> | null;
  created_at: string;
  user_name?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  pagination?: Pagination;
  message?: string;
  error?: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  user: UserProfile;
}
