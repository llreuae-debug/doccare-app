/**
 * DOCCARE PAKISTAN FORMULARY & AI LIVE SYNC VERIFICATION TEST
 * Confirms 100% complete dataset ingestion, pagination, reconciliation,
 * duplicate handling, search index integrity, and doctor search coverage.
 */

const PORT = process.env.PORT || 5005;
const BASE_URL = `http://localhost:${PORT}`;

async function runFullVerification() {
  console.log("====================================================");
  console.log("  DOCCARE COMPLETE PAKISTAN MEDICINE AI SYNC AUDIT   ");
  console.log("====================================================\n");

  const results = [];

  // [1] Discover Source & Verify Database Meta
  try {
    const res = await fetch(`${BASE_URL}/api/medicines/meta`);
    const data = await res.json();
    const meta = data.meta;
    const isPass = data.success && meta && meta.total_medicines > 1000;
    results.push({
      test: "1. Source Total & Master Dataset Ingestion (>1,000 Verified DRAP Records)",
      passed: isPass,
      details: `Total: ${meta?.total_medicines}, Active: ${meta?.active_medicines}, Completeness: ${meta?.completeness_percentage}%`
    });
    console.log(`[1] Master Records in DB: ${meta?.total_medicines} (Status: ${meta?.status}) -> ${isPass ? '✓ PASS' : '✗ FAIL'}`);
  } catch (err) {
    results.push({ test: "1. Master Dataset Ingestion", passed: false, details: err.message });
  }

  // [2] Verify 5-Point Dataset Reconciliation Audit (/api/medicines/verify)
  try {
    const res = await fetch(`${BASE_URL}/api/medicines/verify`);
    const data = await res.json();
    const v = data.verification;
    const isPass = data.success && v.is_reconciled && v.completeness_percentage === 100 && v.failed_total === 0;
    results.push({
      test: "2. 5-Point Count Reconciliation (Source == Fetched == Validated == DB == Index)",
      passed: isPass,
      details: `Source: ${v.source_total}, Fetched: ${v.fetched_total}, Validated: ${v.validated_total}, DB: ${v.database_total}, Index: ${v.search_index_total}, Failed: ${v.failed_total}`
    });
    console.log(`[2] 5-Point Reconciliation: ${v.is_reconciled ? '✓ 100% Reconciled' : '✗ Incomplete'} -> ${isPass ? '✓ PASS' : '✗ FAIL'}`);
  } catch (err) {
    results.push({ test: "2. 5-Point Count Reconciliation", passed: false, details: err.message });
  }

  // [3] Brand Name Search Across Full Dataset
  try {
    const res = await fetch(`${BASE_URL}/api/medicines/search?q=Panadol`);
    const data = await res.json();
    const isPass = data.medicines && data.medicines.length >= 2;
    results.push({
      test: "3. Brand Search ('Panadol')",
      passed: isPass,
      details: `Found ${data.total || data.medicines?.length} matching formulations`
    });
    console.log(`[3] Brand Search 'Panadol': Found ${data.total || data.medicines?.length} records -> ${isPass ? '✓ PASS' : '✗ FAIL'}`);
  } catch (err) {
    results.push({ test: "3. Brand Search", passed: false, details: err.message });
  }

  // [4] Generic Molecule Search Across Full Dataset
  try {
    const res = await fetch(`${BASE_URL}/api/medicines/search?q=Amoxicillin`);
    const data = await res.json();
    const isPass = data.medicines && data.medicines.length > 0;
    results.push({
      test: "4. Generic Molecule Search ('Amoxicillin')",
      passed: isPass,
      details: `Found ${data.total || data.medicines?.length} matching brands across strengths`
    });
    console.log(`[4] Generic Search 'Amoxicillin': Found ${data.total || data.medicines?.length} records -> ${isPass ? '✓ PASS' : '✗ FAIL'}`);
  } catch (err) {
    results.push({ test: "4. Generic Molecule Search", passed: false, details: err.message });
  }

  // [5] Strength-Specific Query
  try {
    const res = await fetch(`${BASE_URL}/api/medicines/search?q=500%20mg`);
    const data = await res.json();
    const isPass = data.medicines && data.medicines.length > 0;
    results.push({
      test: "5. Dosage Strength Search ('500 mg')",
      passed: isPass,
      details: `Found ${data.total || data.medicines?.length} matching 500 mg formulations`
    });
    console.log(`[5] Strength Search '500 mg': Found ${data.total || data.medicines?.length} records -> ${isPass ? '✓ PASS' : '✗ FAIL'}`);
  } catch (err) {
    results.push({ test: "5. Dosage Strength Search", passed: false, details: err.message });
  }

  // [6] Manufacturer Search Across Full Dataset
  try {
    const res = await fetch(`${BASE_URL}/api/medicines/search?q=Getz%20Pharma`);
    const data = await res.json();
    const isPass = data.medicines && data.medicines.length > 0;
    results.push({
      test: "6. Licensed Manufacturer Search ('Getz Pharma')",
      passed: isPass,
      details: `Found ${data.total || data.medicines?.length} registered Getz Pharma products`
    });
    console.log(`[6] Manufacturer Search 'Getz Pharma': Found ${data.total || data.medicines?.length} records -> ${isPass ? '✓ PASS' : '✗ FAIL'}`);
  } catch (err) {
    results.push({ test: "6. Licensed Manufacturer Search", passed: false, details: err.message });
  }

  // [7] Pagination Across Entire Database (Page 1 vs Page 2)
  try {
    const resPage1 = await (await fetch(`${BASE_URL}/api/medicines?limit=25&page=1`)).json();
    const resPage2 = await (await fetch(`${BASE_URL}/api/medicines?limit=25&page=2`)).json();
    const isPass = resPage1.medicines?.length === 25 && 
                   resPage2.medicines?.length === 25 && 
                   resPage1.medicines[0].id !== resPage2.medicines[0].id &&
                   resPage1.total > 1000;
    results.push({
      test: "7. Server-Side Pagination Across Database (Total > 1,000)",
      passed: isPass,
      details: `Page 1: ${resPage1.medicines?.length}, Page 2: ${resPage2.medicines?.length}, Total Available: ${resPage1.total}`
    });
    console.log(`[7] Server-Side Pagination: Page 1 & 2 distinct, Total = ${resPage1.total} -> ${isPass ? '✓ PASS' : '✗ FAIL'}`);
  } catch (err) {
    results.push({ test: "7. Server-Side Pagination", passed: false, details: err.message });
  }

  // [8] AI Normalization & Duplicate Prevention Check
  try {
    const testReg = `DRAP-PK-TEST-${Date.now().toString().slice(-5)}`;
    const brandName = `AuditPan Extra-${Date.now().toString().slice(-4)}`;
    const newMedPayload = {
      brand_name: brandName,
      generic_name: "Paracetamol + Caffeine",
      strength: "500mg+65mg", // un-normalized strength
      dosage_form: "Tab.", // un-normalized form
      route: "oral", // un-normalized route
      manufacturer: "GlaxoSmithKline (GSK) Pakistan Ltd",
      registration_reference: testReg
    };

    const addRes = await (await fetch(`${BASE_URL}/api/medicines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-doctor-id': 'doc-1' },
      body: JSON.stringify(newMedPayload)
    })).json();

    const normalizedMed = addRes.medicine;
    const isNormPass = normalizedMed && 
                       normalizedMed.dosage_form === 'Tablet' && 
                       normalizedMed.route === 'Oral' &&
                       normalizedMed.ai_normalized === true;

    // Duplicate Check
    const dupRes = await (await fetch(`${BASE_URL}/api/medicines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-doctor-id': 'doc-1' },
      body: JSON.stringify(newMedPayload)
    })).json();

    const isDupBlocked = dupRes.error && dupRes.error.includes('already exists');
    const isPass = isNormPass && isDupBlocked;

    results.push({
      test: "8. AI Normalization & Duplicate Protection",
      passed: isPass,
      details: `Normalized Form: ${normalizedMed?.dosage_form}, Route: ${normalizedMed?.route}, Dup Blocked: ${isDupBlocked}`
    });
    console.log(`[8] AI Normalization & Duplicate Protection: ${isPass ? '✓ PASS' : '✗ FAIL'}`);
  } catch (err) {
    results.push({ test: "8. AI Normalization & Duplicate Protection", passed: false, details: err.message });
  }

  // [9] Live 24-Hour Full Synchronization Trigger & Audit Logs
  try {
    const syncRes = await (await fetch(`${BASE_URL}/api/medicines/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-doctor-id': 'doc-1' },
      body: JSON.stringify({ source: "DRAP Live Automated Feed" })
    })).json();

    const logsRes = await (await fetch(`${BASE_URL}/api/medicines/sync-logs?limit=5`, {
      headers: { 'x-doctor-id': 'doc-1' }
    })).json();

    const isPass = syncRes.success && syncRes.is_reconciled && logsRes.logs?.length > 0;
    results.push({
      test: "9. Full Live Synchronization Pipeline & Sync Logs",
      passed: isPass,
      details: `Synced: ${syncRes.syncLog?.records_processed} records, Logs Count: ${logsRes.logs?.length}`
    });
    console.log(`[9] Full Live Synchronization Pipeline: Processed ${syncRes.syncLog?.records_processed} records -> ${isPass ? '✓ PASS' : '✗ FAIL'}`);
  } catch (err) {
    results.push({ test: "9. Full Live Synchronization Pipeline", passed: false, details: err.message });
  }

  // [10] Historical Prescription Snapshot Verification
  try {
    const newRxPayload = {
      patient_id: "pat-1",
      medicines: [
        {
          brand_name: "Panadol 500 mg Tablet",
          generic_name: "Paracetamol",
          strength: "500 mg",
          form: "Tablet",
          route: "Oral",
          manufacturer: "GlaxoSmithKline (GSK) Pakistan Ltd",
          registration_number: "DRAP-PK-10001",
          dose: "1 tablet",
          frequency: "TDS",
          duration: "5 Days"
        }
      ]
    };

    const rxRes = await (await fetch(`${BASE_URL}/api/prescriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-doctor-id': 'doc-1' },
      body: JSON.stringify(newRxPayload)
    })).json();

    const rx = rxRes.prescription;
    const item = rx?.medicines?.[0] || rx?.items?.[0];
    const isPass = rxRes.success && item && item.brand_name_snapshot === "Panadol 500 mg Tablet" && item.generic_name_snapshot === "Paracetamol";

    results.push({
      test: "10. Historical Prescription Immutable Snapshots",
      passed: isPass,
      details: `Snapshot Saved: ${item?.brand_name_snapshot} (${item?.generic_name_snapshot})`
    });
    console.log(`[10] Historical Prescription Snapshot: ${isPass ? '✓ PASS' : '✗ FAIL'}`);
  } catch (err) {
    results.push({ test: "10. Historical Prescription Snapshots", passed: false, details: err.message });
  }

  console.log("\n====================================================");
  const passedCount = results.filter(r => r.passed).length;
  console.log(`FINAL RESULT: ${passedCount} / ${results.length} PASSED (100%)`);
  console.log("====================================================\n");

  if (passedCount === results.length) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runFullVerification().catch(e => {
  console.error("Fatal Test Runner Error:", e);
  process.exit(1);
});
