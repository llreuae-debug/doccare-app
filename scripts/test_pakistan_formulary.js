import { db } from '../server/db.js';

async function runFormularyTests() {
  console.log('====================================================');
  console.log('   DOCCARE PAKISTAN FORMULARY & LIVE MEDICINE TEST   ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Metadata Verification
  console.log('[1] Testing Formulary Meta & Live Status...');
  const meta = db.getFormularyMeta();
  assert(meta.status === 'up_to_date', `Status is up_to_date (received: ${meta.status})`);
  assert(meta.active_medicines > 0, `Active medicines count > 0 (received: ${meta.active_medicines})`);
  assert(meta.total_medicines >= meta.active_medicines, `Total medicines (${meta.total_medicines}) >= Active medicines (${meta.active_medicines})`);
  assert(Boolean(meta.version), `Version is authoritative string (received: ${meta.version})`);

  // 2. Search by Brand Name
  console.log('\n[2] Testing Search by Brand Name...');
  const panadolMeds = db.searchMedicines('Panadol', { limit: 10 });
  assert(panadolMeds.length > 0, `Search for 'Panadol' returned ${panadolMeds.length} items`);
  assert(panadolMeds.some(m => m.brand_name.toLowerCase().includes('panadol')), "Found exact brand match for Panadol");

  const augmentinMeds = db.searchMedicines('Augmentin', { limit: 10 });
  assert(augmentinMeds.length > 0, `Search for 'Augmentin' returned ${augmentinMeds.length} items`);

  // 3. Search by Generic Name
  console.log('\n[3] Testing Search by Generic Name / Salt...');
  const paracetamolMeds = db.searchMedicines('Paracetamol', { limit: 10 });
  assert(paracetamolMeds.length > 0, `Search for generic 'Paracetamol' returned ${paracetamolMeds.length} items`);

  const amoxMeds = db.searchMedicines('Amoxicillin', { limit: 10 });
  assert(amoxMeds.length > 0, `Search for generic 'Amoxicillin' returned ${amoxMeds.length} items`);

  // 4. Search by Manufacturer & Class
  console.log('\n[4] Testing Search by Manufacturer & Class...');
  const gskMeds = db.searchMedicines('', { manufacturer: 'GSK', limit: 20 });
  assert(gskMeds.length > 0, `Filter by manufacturer 'GSK' returned ${gskMeds.length} items`);

  const antiMeds = db.searchMedicines('', { category: 'Antibacterial', limit: 20 });
  assert(antiMeds.length > 0, `Filter by category 'Antibacterial' returned ${antiMeds.length} items`);

  // 5. Idempotent Synchronization & Sync Logs
  console.log('\n[5] Testing 24h Synchronization Idempotency...');
  const initialCount = db.getAllMedicines(null, true).length;
  const syncResult = db.syncPakistanFormulary("DRAP / Test Feed Verification");
  const postSyncCount = db.getAllMedicines(null, true).length;
  
  assert(postSyncCount === initialCount, `Idempotency verified: running sync did not duplicate records (${initialCount} -> ${postSyncCount})`);
  assert(syncResult.status === 'success', `Sync returned status 'success'`);
  
  const logs = db.getMedicineSyncLogs(5);
  assert(logs.length > 0, `Sync logs recorded successfully (found ${logs.length} logs)`);
  assert(logs[0].records_processed === initialCount, `Latest log processed ${logs[0].records_processed} records`);

  // 6. Duplicate Prevention on Add Medicine
  console.log('\n[6] Testing Duplicate Prevention on Manual Add...');
  let duplicateCaught = false;
  try {
    db.addMedicine({
      brand_name: "Panadol",
      generic_name: "Paracetamol",
      strength: "500 mg",
      dosage_form: "Tablet",
      manufacturer: "Haleon / GSK Pakistan"
    });
  } catch (err) {
    if (err.statusCode === 409 || err.message.includes('already exists')) {
      duplicateCaught = true;
    }
  }
  assert(duplicateCaught, "Duplicate medicine with same Brand + Strength + Form + Manufacturer was properly blocked");

  // 7. Historical Prescription Safety
  console.log('\n[7] Testing Historical Medicine Preservation...');
  const testRxMed = db.data.medicines[0];
  // Pretend used in prescription
  db.data.prescriptions = [{ id: "rx-test-1", items: [{ medicine_id: testRxMed.id }] }];
  const delResult = db.deleteMedicine(testRxMed.id);
  assert(delResult.deactivated === true, "Prescription-referenced medicine was safely marked as inactive rather than deleted");
  assert(testRxMed.status === 'inactive', "Medicine status set to 'inactive'");

  // Reactivate test
  db.reactivateMedicine(testRxMed.id);
  assert(testRxMed.status === 'active', "Medicine reactivated back to active");

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runFormularyTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
