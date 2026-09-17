import { calculateRiskScore } from '../routes/risks';
import { calculateComplianceScore } from '../routes/controlAssessments';
import { store } from '../lib/store';

console.log('=== Running GRCTrack Logic Verification Tests ===\n');

// 1. Test Risk Score & Level Mapping
console.log('Test 1: Risk Score & Level Calculation Formula');
const testCases = [
  { l: 1, i: 1, expectedScore: 1, expectedLevel: 'LOW' },
  { l: 2, i: 2, expectedScore: 4, expectedLevel: 'LOW' },
  { l: 1, i: 5, expectedScore: 5, expectedLevel: 'MEDIUM' },
  { l: 3, i: 3, expectedScore: 9, expectedLevel: 'MEDIUM' },
  { l: 2, i: 5, expectedScore: 10, expectedLevel: 'HIGH' },
  { l: 4, i: 4, expectedScore: 16, expectedLevel: 'HIGH' },
  { l: 4, i: 5, expectedScore: 20, expectedLevel: 'CRITICAL' },
  { l: 5, i: 5, expectedScore: 25, expectedLevel: 'CRITICAL' },
];

let failed = 0;
for (const tc of testCases) {
  const res = calculateRiskScore(tc.l, tc.i);
  if (res.score !== tc.expectedScore || res.level !== tc.expectedLevel) {
    console.error(`FAIL: Likelihood ${tc.l} x Impact ${tc.i}: Expected (${tc.expectedScore}, ${tc.expectedLevel}), got (${res.score}, ${res.level})`);
    failed++;
  } else {
    console.log(` PASS: ${tc.l} x ${tc.i} = ${res.score} [${res.level}]`);
  }
}

// 2. Test Compliance Scoring
console.log('\nTest 2: Control Compliance Percentage Calculation');
const testChecklist = [
  { status: 'COMPLIANT' as const },
  { status: 'COMPLIANT' as const },
  { status: 'PARTIALLY_COMPLIANT' as const },
  { status: 'NON_COMPLIANT' as const },
];
// Points: 1 + 1 + 0.5 + 0 = 2.5 / 4 = 62.5% -> 63% (PARTIALLY_COMPLIANT)
const compRes = calculateComplianceScore(testChecklist);
console.log(` Compliance Score: ${compRes.score}%, Status: ${compRes.status}`);
if (compRes.score === 63 && compRes.status === 'PARTIALLY_COMPLIANT') {
  console.log(' PASS: Compliance calculation matches expected rounding and status threshold.');
} else {
  console.error(`FAIL: Unexpected compliance result: ${JSON.stringify(compRes)}`);
  failed++;
}

// 3. Test Store Initializer & Overdue Detection
console.log('\nTest 3: Demo Data & Overdue Detection');
store.checkOverdueRemediations();
const overdue = store.remediations.filter((r) => r.status === 'OVERDUE');
console.log(` Found ${overdue.length} overdue remediation(s) automatically detected.`);
if (overdue.length > 0) {
  console.log(' PASS: Overdue detection works based on past due_date.');
} else {
  console.error('FAIL: Expected at least 1 overdue remediation in demo data.');
  failed++;
}

// 4. Test Demo Dataset Counts
console.log('\nTest 4: Demo Dataset Minimum Thresholds');
console.log(` Assets: ${store.assets.length} (Min: 10)`);
console.log(` Risks: ${store.risks.length} (Min: 20)`);
console.log(` Controls: ${store.controls.length} (Min: 15)`);
console.log(` Evidences: ${store.evidences.length} (Min: 20)`);
console.log(` Findings: ${store.findings.length} (Min: 8)`);
console.log(` Remediations: ${store.remediations.length} (Min: 8)`);

if (
  store.assets.length >= 10 &&
  store.risks.length >= 20 &&
  store.controls.length >= 15 &&
  store.evidences.length >= 20 &&
  store.findings.length >= 8 &&
  store.remediations.length >= 8
) {
  console.log(' PASS: All minimum dataset requirements met.');
} else {
  console.error('FAIL: Dataset does not satisfy minimum required items.');
  failed++;
}

if (failed === 0) {
  console.log('\n ALL BACKEND LOGIC TESTS PASSED SUCCESSFULLY!');
  process.exit(0);
} else {
  console.error(`\n ${failed} test(s) failed!`);
  process.exit(1);
}
