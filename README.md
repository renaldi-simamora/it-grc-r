# GRCTrack — IT Governance, Risk & Compliance Management System

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-16.x-black.svg)](https://nextjs.org)
[![Express](https://img.shields.io/badge/Express-4.x-blue.svg)](https://expressjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org)
[![Status](https://img.shields.io/badge/Simulation-Internal_Portfolio-orange.svg)]()

> **ACADEMIC & PORTFOLIO SIMULATION NOTICE:**  
> This project is built strictly as a **personal portfolio / academic simulation**. All data, company names (*PT Nusantara Digital*), system configurations, audit findings, evidence records, and remediation tracking are **100% synthetic/dummy**. No confidential, proprietary, or real organizational data is used.

---

## 1. Overview & Objectives

**GRCTrack** is an enterprise-grade IT GRC (Governance, Risk, and Compliance) web platform designed to simulate the day-to-day workflow of an **IT GRC Analyst** and **IT Auditor**. 

It provides an end-to-end audit lifecycle tracking assets, assessing inherent risks using standard 5×5 matrices, linking internal controls, auditing evidence artifacts, managing audit deficiencies (findings), tracking corrective remediation plans, and generating executive audit reports.

### Complete GRC Lifecycle Workflow
```
[IT ASSET] 
   └── [RISK IDENTIFICATION] 
          └── [RISK ASSESSMENT (5x5 Matrix)] 
                 └── [CONTROL MAPPING] 
                        └── [CONTROL ASSESSMENT & CHECKLIST] 
                               └── [EVIDENCE COLLECTION & AUDIT] 
                                      └── [AUDIT FINDINGS / DEFICIENCIES] 
                                             └── [CORRECTIVE REMEDIATION] 
                                                    └── [COMPLIANCE MONITORING] 
                                                           └── [EXECUTIVE REPORT (PDF/Print)]
```

---

## 2. Core Modules & Features

| Module | Features & Capabilities |
| :--- | :--- |
| **Executive Dashboard** | Real-time GRC KPIs, overall compliance score gauge, risk distribution charts, audit finding counts, and chronological activity audit trail. |
| **IT Asset Inventory** | Centralized catalog of hardware, applications, databases, cloud, and infrastructure assets categorized with business criticality (Critical, High, Medium, Low). |
| **Risk Register & Matrix** | Inherent risk scoring using a formal 5×5 matrix ($Likelihood \times Impact = Score$, range 1–25) categorized into Low, Medium, High, and Critical. Supports mitigation tracking. |
| **Control Framework** | Internal control repository mapped to global standards (ISO/IEC 27001, NIST CSF, CIS Controls) with implementation status and frequency tracking. |
| **Control Assessment** | Multi-item checklist audit engine calculating compliance scores ($Compliant + 0.5 \times Partial / Applicable$) with evaluator notes and status classification. |
| **Evidence Management** | Simulated file upload repository with metadata tagging, link to controls, status approval workflow (Pending Review, Approved, Rejected). |
| **Audit Findings** | Deficiency logging classified by severity, root cause analysis, risk association, and recommendation tracking. |
| **Remediation Plans** | Corrective Action Plans (CAP) with designated owners, target due dates, overdue automated detection, and status management. |
| **Compliance Monitoring** | Framework compliance overview tracking regulatory items, domain distribution, and overall organizational adherence percentage. |
| **Executive Audit Report** | Print/PDF-ready formal IT GRC assessment report including cover page, executive summary, methodology, risk register highlights, and assessor sign-off. |

---

## 3. Mathematical & Business Logic

### A. 5×5 Inherent Risk Scoring Model
* **Likelihood ($L$):** $1$ (Rare) to $5$ (Almost Certain)
* **Impact ($I$):** $1$ (Insignificant) to $5$ (Catastrophic)
* **Score ($S$):** $L \times I$ (Range: $1$ to $25$)

| Score Range | Risk Level | Recommended Action |
| :---: | :---: | :--- |
| **$17 - 25$** | **CRITICAL** | Immediate remediation required; report to executive board. |
| **$10 - 16$** | **HIGH** | Priority remediation plan with strict SLA (< 30 days). |
| **$5 - 9$** | **MEDIUM** | Scheduled remediation within standard operational cycles. |
| **$1 - 4$** | **LOW** | Accept risk or monitor during annual review. |

### B. Compliance Percentage Formula
$$\text{Compliance Rate (\%)} = \text{round}\left(\frac{\text{Compliant Items} + 0.5 \times \text{Partially Compliant Items}}{\text{Total Applicable Items}} \times 100\right)$$

* Status Thresholds:
  * **$\ge 85\%$**: Compliant
  * **$60\% - 84\%$**: Partially Compliant
  * **$< 60\%$**: Non-Compliant

---

## 4. Technology Stack

* **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS, Lucide Icons, Headless UI.
* **Backend**: Node.js, Express.js REST API, TypeScript, Helmet, CORS, Morgan, Rate Limiting.
* **Database & Persistence**:
  * Dual-mode architecture: Supabase PostgreSQL integration **OR** fully autonomous In-Memory Mock Store with preloaded synthetic datasets.
* **Testing & Verification**: TypeScript strict mode (`tsc --noEmit`), automated business logic verification suite (`src/test/verifyLogic.ts`).

---

## 5. Getting Started Locally

### Prerequisites
* **Node.js**: v18.x or higher (v20+ recommended)
* **npm**: v9.x or higher

### 1. Clone and Install Dependencies
```bash
# Clone the repository
git clone https://github.com/renaldi-simamora/it-grc-r.git
cd it-grc-r

# Install Backend dependencies
cd backend
npm install

# Install Frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration
Create `.env` in `backend/`:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
# Optional: Supabase configuration (System automatically defaults to in-memory store if absent)
# SUPABASE_URL=your-supabase-url
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Create `.env.local` in `frontend/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Run Development Servers
```bash
# Terminal 1: Start Backend API (Port 5000)
cd backend
npm run dev

# Terminal 2: Start Frontend Next.js (Port 3000)
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 6. Demo Accounts (Simulation Credentials)

The system is preloaded with synthetic accounts for demonstration:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Lead Auditor / Admin** | `admin@nusantara.digital` | `DemoPass123!` | Full Read/Write & User Management |
| **IT GRC Analyst** | `analyst@nusantara.digital` | `DemoPass123!` | Assessment, Risk & Evidence Operations |

*Tip: In simulation mode, entering `admin` or `analyst` in the email field automatically maps to the respective persona.*

---

## 7. Verification & Logic Testing

Run the automated GRC calculation and business logic tests:
```bash
cd backend
npx tsx src/test/verifyLogic.ts
```

All 4 test suites will execute:
1. Risk matrix scoring and level boundary mapping
2. Control compliance percentage scoring formula
3. Automatic overdue remediation detection
4. Minimum dataset integrity (12 assets, 21 risks, 16 controls, 20 evidences, 8 findings, 8 remediations)

---

## 8. License

This project is open-source under the [MIT License](LICENSE). Built for educational and portfolio demonstration purposes.
