# GRCTrack Implementation Plan

## Phase 1: Foundation & Auth
- [ ] Setup `.env` files for both frontend and backend.
- [ ] Initialize Supabase Client (frontend & backend).
- [ ] Implement Auth Middleware in Backend.
- [ ] Implement `AuthProvider` in Frontend.
- [ ] Create Login/Register pages.

## Phase 2: Core GRC Modules
- [ ] **Asset Management:** CRUD for assets.
- [ ] **Risk Management:** CRUD for risks, automatic scoring, risk register.
- [ ] **Control Management:** CRUD for controls, link to risks.

## Phase 3: Execution & Evidence
- [ ] **Control Assessment:** Assessment mechanism, checklist items.
- [ ] **Evidence Management:** Upload synthetic evidence to Supabase Storage, link to controls.
- [ ] **Findings & Remediation:** Create findings from gaps, tracking remediation plans.

## Phase 4: Monitoring & Reporting
- [ ] **Dashboard:** Metrics, charts, activity logs.
- [ ] **Compliance Assessment:** Simulated assessment across categories.
- [ ] **Reporting:** Generate IT GRC Assessment Report (PDF).

## Phase 5: Polish & Data
- [ ] Demo Data Seeding.
- [ ] UI/UX Polish (responsive, badges, filters).
- [ ] Documentation (README, ERD).

---

# Database Schema

## Tables

### profiles
- id (uuid, pk)
- email (text)
- full_name (text)
- role (enum: ADMIN, GRC_OFFICER)
- created_at (timestamp)
- updated_at (timestamp)

### assets
- id (uuid, pk)
- asset_code (text, unique)
- name (text)
- type (enum: Application, Database, Server, Network, Endpoint, Cloud Service, Other)
- description (text)
- owner (text)
- department (text)
- criticality (enum: LOW, MEDIUM, HIGH, CRITICAL)
- status (enum: ACTIVE, INACTIVE, RETIRED)
- created_at (timestamp)
- updated_at (timestamp)

### risks
- id (uuid, pk)
- risk_code (text, unique)
- title (text)
- asset_id (uuid, fk -> assets.id)
- category (text)
- description (text)
- likelihood (int 1-5)
- impact (int 1-5)
- risk_score (int)
- risk_level (enum: LOW, MEDIUM, HIGH, CRITICAL)
- existing_mitigation (text)
- recommendation (text)
- status (enum: OPEN, MITIGATED, ACCEPTED, CLOSED)
- owner (text)
- created_at (timestamp)
- updated_at (timestamp)

### controls
- id (uuid, pk)
- control_code (text, unique)
- name (text)
- description (text)
- risk_id (uuid, fk -> risks.id)
- owner (text)
- frequency (enum: Continuous, Daily, Weekly, Monthly, Quarterly, Semi-Annual, Annual, Ad Hoc)
- implementation_status (enum: IMPLEMENTED, PARTIALLY_IMPLEMENTED, NOT_IMPLEMENTED, NOT_APPLICABLE)
- effectiveness (enum: EFFECTIVE, PARTIALLY_EFFECTIVE, INEFFECTIVE, NOT_ASSESSED)
- created_at (timestamp)
- updated_at (timestamp)

### evidences
- id (uuid, pk)
- evidence_code (text, unique)
- control_id (uuid, fk -> controls.id)
- file_name (text)
- file_path (text)
- description (text)
- uploaded_by (uuid, fk -> profiles.id)
- review_status (enum: PENDING, APPROVED, REJECTED)
- uploaded_at (timestamp)
- reviewed_at (timestamp)
- reviewer (text)
- reviewer_notes (text)

### findings
- id (uuid, pk)
- finding_code (text, unique)
- title (text)
- description (text)
- risk_id (uuid, fk -> risks.id)
- control_id (uuid, fk -> controls.id)
- severity (enum: LOW, MEDIUM, HIGH, CRITICAL)
- recommendation (text)
- owner (text)
- due_date (timestamp)
- status (enum: OPEN, IN_PROGRESS, RESOLVED, VERIFIED, CLOSED)
- created_at (timestamp)
- updated_at (timestamp)

### remediations
- id (uuid, pk)
- finding_id (uuid, fk -> findings.id)
- action (text)
- owner (text)
- due_date (timestamp)
- status (enum: OPEN, IN_PROGRESS, COMPLETED, OVERDUE, VERIFIED)
- completion_notes (text)
- completed_at (timestamp)
- created_at (timestamp)
- updated_at (timestamp)

### control_assessments
- id (uuid, pk)
- control_id (uuid, fk -> controls.id)
- assessor_id (uuid, fk -> profiles.id)
- status (enum: COMPLIANT, PARTIALLY_COMPLIANT, NON_COMPLIANT, NOT_APPLICABLE)
- score (float)
- notes (text)
- created_at (timestamp)
- updated_at (timestamp)

### control_checklist_items
- id (uuid, pk)
- assessment_id (uuid, fk -> control_assessments.id)
- title (text)
- status (enum: COMPLIANT, PARTIALLY_COMPLIANT, NON_COMPLIANT, NOT_APPLICABLE)
- notes (text)
- evidence_id (uuid, fk -> evidences.id)

### activity_logs
- id (uuid, pk)
- user_id (uuid, fk -> profiles.id)
- action (text)
- module (text)
- reference_id (uuid)
- details (jsonb)
- created_at (timestamp)
