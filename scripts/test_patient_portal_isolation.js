/**
 * Automated Verification Script: DOCCARE Patient Portal Strict Role Separation & Discovery Flow
 * Tests:
 * 1. Role-Based Access Control (RBAC): Patient session calling Doctor routes (/api/prescriptions, /api/ledger, /api/patients) gets 403 Forbidden.
 * 2. Patient Authentication: Login as patient@doccare.pk
 * 3. Doctor Discovery: /api/public/doctors returns only public sanitized data.
 * 4. Available Slots: /api/public/doctors/:slug/available-slots returns real appointment slots.
 * 5. Appointment Booking: /api/public/appointments/book creates appointment with reference ID.
 * 6. Patient Appointments History: /api/patient/dashboard-data returns ONLY the patient's own bookings and zero private doctor records.
 * 7. Patient Profile Update: /api/patient/profile updates patient profile.
 * 8. Appointment Cancellation: /api/patient/appointments/:id/cancel cancels patient's own appointment.
 */

const API_BASE = 'http://localhost:5005/api';

async function runTests() {
  console.log("====================================================");
  console.log("   DOCCARE PATIENT PORTAL RBAC & DISCOVERY AUDIT    ");
  console.log("====================================================\n");

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

  // 1. Patient Login
  console.log("[1] Testing Patient Authentication...");
  let patientToken = '';
  let patientUser = null;
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'patient@doccare.pk',
        password: 'patient123',
        role: 'patient'
      })
    });
    const data = await res.json();
    assert(res.ok && data.success && data.token, "Patient login succeeded and received session token");
    patientToken = data.token;
    patientUser = data.user;
  } catch (err) {
    assert(false, "Patient login failed: " + err.message);
  }

  // 2. Strict Role-Based Access Control (RBAC) - Patient MUST receive 403 Forbidden on Doctor Routes!
  console.log("\n[2] Testing Strict Server-Side Role-Based Access Control (RBAC)...");
  
  // 2A. Prescriptions Doctor Route
  try {
    const res = await fetch(`${API_BASE}/prescriptions`, {
      headers: { 'Authorization': `Bearer ${patientToken}` }
    });
    assert(res.status === 403, "Patient access to Doctor Prescriptions route [/api/prescriptions] correctly returned HTTP 403 Forbidden");
  } catch (err) {
    assert(false, "Prescriptions RBAC check failed: " + err.message);
  }

  // 2B. Doctor Ledger Route
  try {
    const res = await fetch(`${API_BASE}/ledger`, {
      headers: { 'Authorization': `Bearer ${patientToken}` }
    });
    assert(res.status === 403, "Patient access to Doctor Financial Ledger [/api/ledger] correctly returned HTTP 403 Forbidden");
  } catch (err) {
    assert(false, "Ledger RBAC check failed: " + err.message);
  }

  // 2C. Doctor Patients EHR Directory Route
  try {
    const res = await fetch(`${API_BASE}/patients`, {
      headers: { 'Authorization': `Bearer ${patientToken}` }
    });
    assert(res.status === 403, "Patient access to Doctor Clinical Patients Directory [/api/patients] correctly returned HTTP 403 Forbidden");
  } catch (err) {
    assert(false, "Patients RBAC check failed: " + err.message);
  }

  // 2D. Doctor Dashboard Stats Route
  try {
    const res = await fetch(`${API_BASE}/doctor/dashboard-stats`, {
      headers: { 'Authorization': `Bearer ${patientToken}` }
    });
    assert(res.status === 403, "Patient access to Doctor Analytics [/api/doctor/dashboard-stats] correctly returned HTTP 403 Forbidden");
  } catch (err) {
    assert(false, "Doctor stats RBAC check failed: " + err.message);
  }

  // 2E. Pakistan Formulary Mutation Route
  try {
    const res = await fetch(`${API_BASE}/medicines/sync`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${patientToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'Test' })
    });
    assert(res.status === 403, "Patient attempt to trigger Formulary Sync [/api/medicines/sync] correctly returned HTTP 403 Forbidden");
  } catch (err) {
    assert(false, "Formulary mutation RBAC check failed: " + err.message);
  }

  // 3. Public Doctor Discovery
  console.log("\n[3] Testing Public Doctor Discovery & Profiles...");
  let sampleDoctor = null;
  try {
    const res = await fetch(`${API_BASE}/public/doctors?city=Lahore`);
    const data = await res.json();
    assert(res.ok && Array.isArray(data.doctors) && data.doctors.length > 0, `Public doctor search in Lahore returned ${data.doctors?.length} verified doctors`);
    sampleDoctor = data.doctors[0];
    assert(sampleDoctor && sampleDoctor.name && sampleDoctor.clinicName && sampleDoctor.consultationFee, "Doctor record contains public name, clinic, fee, and qualifications");
    assert(!sampleDoctor.revenue && !sampleDoctor.expenses && !sampleDoctor.patients, "Doctor record strictly excludes private doctor financial/patient CRM data");
  } catch (err) {
    assert(false, "Public doctor discovery failed: " + err.message);
  }

  // 4. Available Slots
  console.log("\n[4] Testing Live Appointment Slots...");
  let selectedSlot = '05:00 PM';
  let targetBookingDate = new Date().toISOString().split('T')[0];
  try {
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    // Find next date matching sampleDoctor.availableDays
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dayName = daysOfWeek[d.getDay()];
      if (sampleDoctor.availableDays && sampleDoctor.availableDays.includes(dayName)) {
        targetBookingDate = d.toISOString().split('T')[0];
        break;
      }
    }

    const res = await fetch(`${API_BASE}/public/doctors/${sampleDoctor.slug || sampleDoctor.id}/available-slots?date=${targetBookingDate}`);
    const data = await res.json();
    assert(res.ok && data.isAvailableDay && Array.isArray(data.slots) && data.slots.length > 0, `Available slots fetched: ${data.slots?.length} slots on ${targetBookingDate}`);
    const firstAvailable = data.slots.find(s => s.isAvailable !== false) || data.slots[0];
    selectedSlot = firstAvailable?.startTime || firstAvailable?.slot || '05:00 PM';
  } catch (err) {
    assert(false, "Slot fetching failed: " + err.message);
  }

  // 5. Booking Appointment
  console.log("\n[5] Testing Appointment Booking Flow...");
  let bookedAppointmentId = '';
  try {
    const res = await fetch(`${API_BASE}/public/appointments/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        doctor_id: sampleDoctor.id,
        date: targetBookingDate,
        start_time: selectedSlot,
        name: 'Demo Patient (Kamran Ali)',
        phone: '0300-4829103',
        email: 'patient@doccare.pk',
        notes: 'Routine health checkup consultation',
        consent_given: true
      })
    });
    const data = await res.json();
    assert(res.ok && data.success && data.appointment?.id, `Appointment booked successfully! Reference ID: #${data.appointment?.id}`);
    bookedAppointmentId = data.appointment?.id;
  } catch (err) {
    assert(false, "Appointment booking failed: " + err.message);
  }

  // 6. Patient Dashboard & Own Appointments Verification
  console.log("\n[6] Testing Patient Own Appointments & Profile Dashboard...");
  try {
    const res = await fetch(`${API_BASE}/patient/dashboard-data`, {
      headers: { 'Authorization': `Bearer ${patientToken}` }
    });
    const data = await res.json();
    assert(res.ok && data.success, "Patient dashboard data fetched successfully");
    assert(Array.isArray(data.appointments), `Patient appointments list contains ${data.appointments?.length} bookings`);
    
    // Check that booked appointment is in the list
    const found = data.appointments.find(a => a.id === bookedAppointmentId);
    assert(found && found.doctor_name && found.clinic_name, `Booked appointment #${bookedAppointmentId} confirmed in patient's personal history`);
    
    // Strict privacy: Ensure NO other patients are returned
    assert(!data.allPatients && !data.ledger, "Patient dashboard data strictly contains ZERO doctor practice/other patient data");
  } catch (err) {
    assert(false, "Patient dashboard check failed: " + err.message);
  }

  // 7. Update Patient Profile
  console.log("\n[7] Testing Patient Profile Update...");
  try {
    const res = await fetch(`${API_BASE}/patient/profile`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${patientToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Muhammad Ali Patient',
        nameUrdu: 'محمد علی',
        phone: '0300-4829103',
        city: 'Lahore',
        age: 32,
        gender: 'Male'
      })
    });
    const data = await res.json();
    assert(res.ok && data.success && data.patient?.name === 'Muhammad Ali Patient', "Patient profile updated successfully with English & Urdu names");
  } catch (err) {
    assert(false, "Patient profile update failed: " + err.message);
  }

  // 8. Cancel Appointment
  console.log("\n[8] Testing Appointment Cancellation...");
  if (bookedAppointmentId) {
    try {
      const res = await fetch(`${API_BASE}/patient/appointments/${bookedAppointmentId}/cancel`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${patientToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: 'Rescheduled by patient' })
      });
      const data = await res.json();
      assert(res.ok && data.success && data.appointment?.status === 'cancelled', `Appointment #${bookedAppointmentId} cancelled successfully by patient`);
    } catch (err) {
      assert(false, "Appointment cancellation failed: " + err.message);
    }
  }

  console.log("\n====================================================");
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("====================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
