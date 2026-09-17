-- ==========================================================
-- GRCTrack Database Schema (PostgreSQL for Supabase)
-- Organization: PT Nusantara Digital (Academic/Portfolio Simulation)
-- ==========================================================

-- Drop existing tables/types if needed for clean re-run
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS remediations CASCADE;
DROP TABLE IF EXISTS findings CASCADE;
DROP TABLE IF EXISTS control_checklist_items CASCADE;
DROP TABLE IF EXISTS evidences CASCADE;
DROP TABLE IF EXISTS control_assessments CASCADE;
DROP TABLE IF EXISTS controls CASCADE;
DROP TABLE IF EXISTS risks CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS compliance_items CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS asset_type CASCADE;
DROP TYPE IF EXISTS criticality_level CASCADE;
DROP TYPE IF EXISTS asset_status CASCADE;
DROP TYPE IF EXISTS risk_level CASCADE;
DROP TYPE IF EXISTS risk_status CASCADE;
DROP TYPE IF EXISTS control_frequency CASCADE;
DROP TYPE IF EXISTS implementation_status CASCADE;
DROP TYPE IF EXISTS control_effectiveness CASCADE;
DROP TYPE IF EXISTS assessment_status CASCADE;
DROP TYPE IF EXISTS review_status CASCADE;
DROP TYPE IF EXISTS finding_severity CASCADE;
DROP TYPE IF EXISTS finding_status CASCADE;
DROP TYPE IF EXISTS remediation_status CASCADE;

-- 1. Profiles & Roles
CREATE TYPE user_role AS ENUM ('ADMIN', 'GRC_OFFICER');

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'GRC_OFFICER',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Assets
CREATE TYPE asset_type AS ENUM ('Application', 'Database', 'Server', 'Network', 'Endpoint', 'Cloud Service', 'Other');
CREATE TYPE criticality_level AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE asset_status AS ENUM ('ACTIVE', 'INACTIVE', 'RETIRED');

CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type asset_type NOT NULL,
  description TEXT,
  owner TEXT,
  department TEXT,
  criticality criticality_level NOT NULL DEFAULT 'MEDIUM',
  status asset_status NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Risks
CREATE TYPE risk_level AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE risk_status AS ENUM ('OPEN', 'MITIGATED', 'ACCEPTED', 'CLOSED');

CREATE TABLE risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  description TEXT,
  likelihood INTEGER NOT NULL CHECK (likelihood >= 1 AND likelihood <= 5),
  impact INTEGER NOT NULL CHECK (impact >= 1 AND impact <= 5),
  risk_score INTEGER NOT NULL CHECK (risk_score >= 1 AND risk_score <= 25),
  risk_level risk_level NOT NULL,
  existing_mitigation TEXT,
  recommendation TEXT,
  status risk_status NOT NULL DEFAULT 'OPEN',
  owner TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Controls
CREATE TYPE control_frequency AS ENUM (
  'Continuous', 'Daily', 'Weekly', 'Monthly', 'Quarterly', 'Semi-Annual', 'Annual', 'Ad Hoc'
);
CREATE TYPE implementation_status AS ENUM (
  'IMPLEMENTED', 'PARTIALLY_IMPLEMENTED', 'NOT_IMPLEMENTED', 'NOT_APPLICABLE'
);
CREATE TYPE control_effectiveness AS ENUM (
  'EFFECTIVE', 'PARTIALLY_EFFECTIVE', 'INEFFECTIVE', 'NOT_ASSESSED'
);

CREATE TABLE controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  control_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  risk_id UUID NOT NULL REFERENCES risks(id) ON DELETE CASCADE,
  owner TEXT,
  frequency control_frequency NOT NULL DEFAULT 'Monthly',
  implementation_status implementation_status NOT NULL DEFAULT 'NOT_IMPLEMENTED',
  effectiveness control_effectiveness NOT NULL DEFAULT 'NOT_ASSESSED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Control Assessments
CREATE TYPE assessment_status AS ENUM ('COMPLIANT', 'PARTIALLY_COMPLIANT', 'NON_COMPLIANT', 'NOT_APPLICABLE');

CREATE TABLE control_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  control_id UUID NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
  assessor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status assessment_status NOT NULL DEFAULT 'NON_COMPLIANT',
  score FLOAT NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Evidences
CREATE TYPE review_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE evidences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evidence_code TEXT UNIQUE NOT NULL,
  control_id UUID NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  description TEXT,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  review_status review_status NOT NULL DEFAULT 'PENDING',
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewer TEXT,
  reviewer_notes TEXT
);

-- 7. Control Checklist Items
CREATE TABLE control_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES control_assessments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status assessment_status NOT NULL DEFAULT 'NON_COMPLIANT',
  notes TEXT,
  evidence_id UUID REFERENCES evidences(id) ON DELETE SET NULL
);

-- 8. Findings (Gaps)
CREATE TYPE finding_severity AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE finding_status AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'VERIFIED', 'CLOSED');

CREATE TABLE findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  risk_id UUID REFERENCES risks(id) ON DELETE SET NULL,
  control_id UUID REFERENCES controls(id) ON DELETE SET NULL,
  severity finding_severity NOT NULL DEFAULT 'MEDIUM',
  recommendation TEXT,
  owner TEXT,
  due_date TIMESTAMPTZ,
  status finding_status NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Remediations
CREATE TYPE remediation_status AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'VERIFIED');

CREATE TABLE remediations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_id UUID NOT NULL REFERENCES findings(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  owner TEXT,
  due_date TIMESTAMPTZ,
  status remediation_status NOT NULL DEFAULT 'OPEN',
  completion_notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Compliance Items
CREATE TABLE compliance_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  status assessment_status NOT NULL DEFAULT 'NON_COMPLIANT',
  notes TEXT,
  responsible_owner TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Activity Logs
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  reference_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance & query filtering
CREATE INDEX idx_assets_type ON assets(type);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_criticality ON assets(criticality);

CREATE INDEX idx_risks_asset ON risks(asset_id);
CREATE INDEX idx_risks_level ON risks(risk_level);
CREATE INDEX idx_risks_status ON risks(status);
CREATE INDEX idx_risks_category ON risks(category);

CREATE INDEX idx_controls_risk ON controls(risk_id);
CREATE INDEX idx_controls_status ON controls(implementation_status);
CREATE INDEX idx_controls_effectiveness ON controls(effectiveness);

CREATE INDEX idx_evidences_control ON evidences(control_id);
CREATE INDEX idx_evidences_status ON evidences(review_status);

CREATE INDEX idx_findings_risk ON findings(risk_id);
CREATE INDEX idx_findings_control ON findings(control_id);
CREATE INDEX idx_findings_status ON findings(status);
CREATE INDEX idx_findings_severity ON findings(severity);

CREATE INDEX idx_remediations_finding ON remediations(finding_id);
CREATE INDEX idx_remediations_status ON remediations(status);

CREATE INDEX idx_compliance_category ON compliance_items(category);
CREATE INDEX idx_compliance_status ON compliance_items(status);

CREATE INDEX idx_activity_created ON activity_logs(created_at DESC);
