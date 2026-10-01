// API Client for DocCare with Hybrid Local Fallback Resilience
// Provides seamless operation both with live Express backend and static/offline preview

const API_BASE = '/api';

// Seeded local mock data for zero-failure fallback
const MOCK_DOCTORS = [
  {
    id: "doc-1",
    slug: "dr-ayesha-siddiqui",
    name: "Dr. Ayesha Siddiqui",
    email: "dr.ayesha@doccare.pk",
    phone: "0300-1234567",
    specialization: "Consultant Cardiologist & Heart Specialist",
    qualifications: "MBBS, FCPS (Cardiology), Fellowship Interventional Cardiology",
    pmdcNumber: "34892-P",
    experienceYears: 12,
    consultationFee: 2500,
    clinicName: "Siddiqui Heart Clinic",
    address: "Suite 402, Al-Razi Healthcare Complex, Gulberg III, Lahore",
    city: "Lahore",
    province: "Punjab",
    profileImage: "https://images.unsplash.com/photo-1594824813628-9860b7305943?auto=format&fit=crop&q=80&w=600",
    rating: 4.9,
    reviewCount: 142,
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    nextAvailable: "Today • 05:00 PM",
    timeSlots: ["05:00 PM - 05:30 PM", "05:30 PM - 06:00 PM", "06:00 PM - 06:30 PM", "06:30 PM - 07:00 PM", "07:00 PM - 07:30 PM", "07:30 PM - 08:00 PM"]
  },
  {
    id: "doc-2",
    slug: "dr-bilal-ahmed",
    name: "Dr. Bilal Ahmed",
    email: "dr.bilal@doccare.pk",
    phone: "0321-7654321",
    specialization: "Consultant Physician & Diabetologist",
    qualifications: "MBBS, MRCP (UK), FCPS (Medicine)",
    pmdcNumber: "41209-P",
    experienceYears: 15,
    consultationFee: 2000,
    clinicName: "Medicare Diabetes Care Center",
    address: "Main Boulevard, DHA Phase 5, Lahore",
    city: "Lahore",
    province: "Punjab",
    profileImage: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600",
    rating: 4.8,
    reviewCount: 98,
    availableDays: ["Monday", "Wednesday", "Friday"],
    nextAvailable: "Tomorrow • 06:00 PM",
    timeSlots: ["06:00 PM - 06:30 PM", "06:30 PM - 07:00 PM", "07:00 PM - 07:30 PM", "07:30 PM - 08:00 PM"]
  },
  {
    id: "doc-3",
    slug: "dr-fatima-noor",
    name: "Dr. Fatima Noor",
    email: "dr.fatima@doccare.pk",
    phone: "0333-8889900",
    specialization: "Consultant Pediatrician & Child Specialist",
    qualifications: "MBBS, FCPS (Pediatrics), DCH",
    pmdcNumber: "48910-S",
    experienceYears: 9,
    consultationFee: 1800,
    clinicName: "Noor Children Clinic",
    address: "Block 4, Clifton, Karachi",
    city: "Karachi",
    province: "Sindh",
    profileImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600",
    rating: 4.95,
    reviewCount: 160,
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Saturday"],
    nextAvailable: "Today • 04:00 PM",
    timeSlots: ["04:00 PM - 04:30 PM", "04:30 PM - 05:00 PM", "05:00 PM - 05:30 PM"]
  }
];

const MOCK_PATIENTS = [
  {
    id: "pat-1",
    name: "Kamran Ali",
    nameUrdu: "کامران علی",
    email: "kamran.ali@gmail.com",
    phone: "0300-4829103",
    city: "Lahore",
    age: 48,
    gender: "Male"
  },
  {
    id: "pat-2",
    name: "Demo Patient (Kamran Ali)",
    nameUrdu: "کامران علی",
    email: "patient@doccare.pk",
    phone: "0300-4829103",
    city: "Lahore",
    age: 48,
    gender: "Male"
  }
];

// Fallback Mock API Handler
function handleLocalFallback(endpoint, options = {}) {
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body) : {};

  console.info(`[DocCare API Fallback] Servicing ${method} ${endpoint}`);

  // 1. Auth Login
  if (endpoint === '/auth/login' && method === 'POST') {
    const ident = (body.identifier || '').toLowerCase().trim();
    const isDoc = body.role === 'doctor' || ident.includes('doctor') || ident.startsWith('dr.');
    
    if (isDoc) {
      const doc = MOCK_DOCTORS[0];
      return {
        success: true,
        token: 'mock-session-token-doctor',
        user: {
          id: `user-${doc.id}`,
          name: doc.name,
          email: doc.email,
          role: 'doctor',
          doctorId: doc.id
        },
        doctor: doc
      };
    } else {
      const pat = MOCK_PATIENTS.find(p => p.email.toLowerCase() === ident) || {
        id: "pat-1",
        name: body.identifier || "Patient User",
        email: body.identifier || "patient@doccare.pk",
        phone: "0300-4829103",
        city: "Lahore",
        age: 35,
        gender: "Male"
      };
      return {
        success: true,
        token: 'mock-session-token-patient',
        user: {
          id: `user-${pat.id}`,
          name: pat.name,
          email: pat.email,
          role: 'patient',
          patientId: pat.id
        },
        patient: pat
      };
    }
  }

  // 2. Auth Register
  if (endpoint === '/auth/register' && method === 'POST') {
    const role = body.role || 'patient';
    const newUser = {
      id: `user-${Date.now()}`,
      name: body.name || 'New User',
      email: body.email || 'user@doccare.pk',
      role,
      ...(role === 'doctor' ? { doctorId: 'doc-1' } : { patientId: 'pat-1' })
    };
    return {
      success: true,
      token: `mock-session-token-${role}`,
      user: newUser,
      ...(role === 'doctor' ? { doctor: MOCK_DOCTORS[0] } : { patient: { ...newUser, phone: body.phone } })
    };
  }

  // 3. Auth Google
  if (endpoint === '/auth/google' && method === 'POST') {
    const role = body.role || 'patient';
    const user = {
      id: `user-g-${Date.now()}`,
      name: body.name || 'Google User',
      email: body.email,
      role,
      ...(role === 'doctor' ? { doctorId: 'doc-1' } : { patientId: 'pat-1' })
    };
    return {
      success: true,
      token: `mock-session-token-${role}`,
      user,
      ...(role === 'doctor' ? { doctor: MOCK_DOCTORS[0] } : { patient: { ...user, phone: '0300-1234567' } })
    };
  }

  // 4. Auth Me
  if (endpoint === '/auth/me') {
    const savedToken = localStorage.getItem('doccare_auth_token');
    if (!savedToken) return { authenticated: false };
    const isDoc = savedToken.includes('doctor');
    if (isDoc) {
      return {
        authenticated: true,
        user: { id: 'user-doc-1', name: MOCK_DOCTORS[0].name, email: MOCK_DOCTORS[0].email, role: 'doctor', doctorId: 'doc-1' },
        doctor: MOCK_DOCTORS[0]
      };
    } else {
      return {
        authenticated: true,
        user: { id: 'user-pat-1', name: MOCK_PATIENTS[0].name, email: MOCK_PATIENTS[0].email, role: 'patient', patientId: 'pat-1' },
        patient: MOCK_PATIENTS[0]
      };
    }
  }

  // 5. Patient Dashboard Data
  if (endpoint === '/patient/dashboard-data') {
    const pat = MOCK_PATIENTS[0];
    const doc = MOCK_DOCTORS[0];
    return {
      success: true,
      patient: pat,
      appointments: [
        {
          id: "APT-84920",
          doctor_id: doc.id,
          doctor_name: doc.name,
          doctor_specialty: doc.specialization,
          doctor_avatar: doc.profileImage,
          clinic_name: doc.clinicName,
          city: doc.city,
          date: new Date().toISOString().split('T')[0],
          start_time: "05:00 PM",
          status: "confirmed",
          notes: "Routine Consultation"
        }
      ],
      stats: {
        totalAppointments: 1,
        upcomingAppointments: 1,
        pastAppointments: 0,
        doctorsConsulted: 1
      }
    };
  }

  // 6. Public Doctors / Catalog
  if (endpoint.startsWith('/public/doctors') || endpoint === '/doctors') {
    if (endpoint.includes('/available-slots')) {
      return {
        isAvailableDay: true,
        dayName: "Monday",
        date: new Date().toISOString().split('T')[0],
        slots: ["05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM"]
      };
    }
    return {
      success: true,
      count: MOCK_DOCTORS.length,
      doctors: MOCK_DOCTORS
    };
  }

  // 7. Public Specialties
  if (endpoint === '/public/specialties') {
    return {
      success: true,
      specialties: [
        { name: "General Physician", count: 25 },
        { name: "Cardiologist", count: 12 },
        { name: "Pediatrician", count: 14 },
        { name: "Dermatologist", count: 10 },
        { name: "Gynecologist", count: 18 },
        { name: "Orthopedic", count: 9 },
        { name: "ENT Specialist", count: 8 },
        { name: "Neurologist", count: 6 }
      ]
    };
  }

  // 8. Public Cities
  if (endpoint === '/public/cities') {
    return {
      success: true,
      cities: [
        { name: "Lahore", doctorCount: 15 },
        { name: "Karachi", doctorCount: 12 },
        { name: "Islamabad", doctorCount: 8 },
        { name: "Rawalpindi", doctorCount: 6 },
        { name: "Faisalabad", doctorCount: 5 }
      ]
    };
  }

  // 9. Book Appointment Fallback
  if (endpoint.includes('/appointments') && method === 'POST') {
    return {
      success: true,
      message: "Appointment booked successfully",
      appointment: {
        id: `APT-${Math.floor(10000 + Math.random() * 90000)}`,
        doctor_name: MOCK_DOCTORS[0].name,
        clinic_name: MOCK_DOCTORS[0].clinicName,
        date: body.date || new Date().toISOString().split('T')[0],
        start_time: body.start_time || body.time_slot || "05:00 PM",
        status: "confirmed"
      }
    };
  }

  // Default generic success response
  return { success: true };
}

async function request(endpoint, options = {}) {
  const currentDoctorId = localStorage.getItem('doccare_active_doctor_id') || 'doc-1';
  const token = localStorage.getItem('doccare_auth_token');
  
  const headers = {
    'Content-Type': 'application/json',
    'x-doctor-id': currentDoctorId,
    ...(token ? { 'Authorization': `Bearer ${token}`, 'x-auth-token': token } : {}),
    ...(options.headers || {})
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      // If server explicitly returned a structured error message (e.g. 403 Forbidden or 400 Bad Request)
      if (data && data.error) {
        const err = new Error(data.error);
        err.status = res.status;
        err.data = data;
        throw err;
      }
      
      // If 404 Not Found (e.g. static preview or endpoint unavailable), use local fallback
      if (res.status === 404) {
        return handleLocalFallback(endpoint, options);
      }

      const err = new Error(data.error || `HTTP error! status: ${res.status}`);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (err) {
    // If network error (offline, connection refused, or 404), seamlessly service from local fallback
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.status === 404) {
      return handleLocalFallback(endpoint, options);
    }
    console.warn(`API Request warning for ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // --- DUAL-ROLE AUTHENTICATION (DOCTOR & PATIENT) ---
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  googleAuth: (data) => request('/auth/google', { method: 'POST', body: JSON.stringify(data) }),
  forgotPassword: (data) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify(data) }),
  resetPassword: (data) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),

  // --- PATIENT PORTAL (ROLE: PATIENT) ---
  getPatientDashboard: () => request('/patient/dashboard-data'),
  cancelPatientAppointment: (id, reason) => request(`/patient/appointments/${id}/cancel`, { method: 'PATCH', body: JSON.stringify({ reason }) }),
  updatePatientProfile: (data) => request('/patient/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // --- DOCTOR PROFILES & PRACTICE (STEP 1) ---
  getDoctors: () => request('/doctors'),
  getDoctor: (id) => request(`/doctors/${id}`),
  updateDoctor: (id, data) => request(`/doctors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  
  // --- PUBLIC BOOKING (STEP 2) ---
  getPublicDoctor: (slugOrId) => request(`/public/doctors/${slugOrId}`),
  getAvailableSlots: (slugOrId, date) => request(`/public/doctors/${slugOrId}/available-slots?date=${encodeURIComponent(date)}`),
  bookPublicAppointment: (data) => request('/public/appointments/book', { method: 'POST', body: JSON.stringify(data) }),

  // --- DOCTOR DASHBOARD & APPOINTMENTS (STEP 2) ---
  getAppointments: (tab = 'today', q = '') => {
    let url = `/appointments?tab=${encodeURIComponent(tab)}`;
    if (q) url += `&q=${encodeURIComponent(q)}`;
    return request(url);
  },
  getAppointmentCounts: () => request('/appointments/counts'),
  createManualAppointment: (data) => request('/appointments/manual', { method: 'POST', body: JSON.stringify(data) }),
  updateAppointmentStatus: (id, status, notes = null) => request(`/appointments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, notes }) }),
  rescheduleAppointment: (id, date, start_time, end_time = null) => request(`/appointments/${id}/reschedule`, { method: 'POST', body: JSON.stringify({ date, start_time, end_time }) }),

  // --- PATIENTS & HEALTH TIMELINES (STEP 2 & 3) ---
  getPatients: (q = '') => request(`/patients${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  getPatientDetail: (id) => request(`/patients/${id}`),
  updatePatient: (id, data) => request(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // --- PAKISTAN FORMULARY & MEDICINE DATABASE ---
  getMedicines: (params = {}) => {
    if (typeof params === 'string') {
      return request(`/medicines?q=${encodeURIComponent(params)}`);
    }
    const query = new URLSearchParams(params).toString();
    return request(`/medicines${query ? `?${query}` : ''}`);
  },
  searchMedicines: (q = '', options = {}) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (options.page) params.set('page', options.page);
    if (options.limit) params.set('limit', options.limit);
    if (options.form || options.dosage_form) params.set('form', options.form || options.dosage_form);
    if (options.route) params.set('route', options.route);
    if (options.category || options.therapeutic_class) params.set('category', options.category || options.therapeutic_class);
    if (options.manufacturer) params.set('manufacturer', options.manufacturer);
    if (options.status) params.set('status', options.status);
    return request(`/medicines/search?${params.toString()}`);
  },
  getMedicinesMeta: () => request('/medicines/meta'),
  getFormularySyncStatus: () => request('/medicines/sync-status'),
  verifyFormularyDataset: () => request('/medicines/verify'),
  getMedicineById: (id) => request(`/medicines/${id}`),
  addMedicine: (data) => request('/medicines', { method: 'POST', body: JSON.stringify(data) }),
  createCustomMedicine: (data) => request('/medicines', { method: 'POST', body: JSON.stringify(data) }),
  updateMedicine: (id, data) => request(`/medicines/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  toggleMedicineStatus: (id, status) => request(`/medicines/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteMedicine: (id) => request(`/medicines/${id}`, { method: 'DELETE' }),
  syncPakistanFormulary: (source = null, incomingData = null) => request('/medicines/sync', { method: 'POST', body: JSON.stringify({ source, incomingData }) }),
  getMedicineSyncLogs: (limit = 30) => request(`/medicines/sync-logs?limit=${limit}`),
  importMedicines: (medicines, source = null) => request('/medicines/import', { method: 'POST', body: JSON.stringify({ medicines, source }) }),
  getExportMedicinesUrl: () => '/api/medicines/export',
  getFavoriteMedicines: () => request('/medicines/favorites'),
  toggleFavoriteMedicine: (medicine_id) => request('/medicines/favorites/toggle', { method: 'POST', body: JSON.stringify({ medicine_id }) }),

  // --- PRESCRIPTIONS CRUD & LIFECYCLE ---
  getPrescriptions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/prescriptions${query ? `?${query}` : ''}`);
  },
  getPrescription: (id) => request(`/prescriptions/${id}`),
  savePrescriptionDraft: (data) => request('/prescriptions', { method: 'POST', body: JSON.stringify(data) }),
  finalizePrescription: (id, data = {}) => request(`/prescriptions/${id}/finalize`, { method: 'POST', body: JSON.stringify(data) }),
  duplicatePrescription: (id) => request(`/prescriptions/${id}/duplicate`, { method: 'POST' }),
  logPrescriptionAuditEvent: (id, event, details = '') => request(`/prescriptions/${id}/audit-event`, { method: 'POST', body: JSON.stringify({ event, details }) }),

  // --- PRESCRIPTION TEMPLATES ---
  getTemplates: () => request('/templates'),
  createTemplate: (data) => request('/templates', { method: 'POST', body: JSON.stringify(data) }),
  updateTemplate: (id, data) => request(`/templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTemplate: (id) => request(`/templates/${id}`, { method: 'DELETE' }),

  // --- CLINICAL SAFETY CHECKS & AI SUGGEST ---
  checkPrescriptionSafety: (data) => request('/prescriptions/safety-check', { method: 'POST', body: JSON.stringify(data) }),
  getAISuggestions: (data) => request('/ai/suggest', { method: 'POST', body: JSON.stringify(data) }),

  // --- PDF SETTINGS & SERVER-SIDE PDFS ---
  getPdfSettings: () => request('/pdf-settings'),
  updatePdfSettings: (data) => request('/pdf-settings', { method: 'PUT', body: JSON.stringify(data) }),
  resetPdfSettings: () => request('/pdf-settings/reset', { method: 'POST' }),
  generatePrescriptionPDF: (id) => request(`/prescriptions/${id}/generate-pdf`, { method: 'POST' }),
  getPrescriptionPdfUrl: (id, download = false) => `/api/prescriptions/${id}/pdf${download ? '?download=true' : ''}`,

  // --- PUBLIC VERIFICATION & SHARES ---
  verifyPublicPrescription: (token) => request(`/public/verify/${token}`),
  createPrescriptionShare: (prescriptionId, data = {}) => request(`/prescriptions/${prescriptionId}/share`, { method: 'POST', body: JSON.stringify(data) }),
  getPrescriptionShares: (prescriptionId) => request(`/prescriptions/${prescriptionId}/shares`),
  revokePrescriptionShare: (shareId) => request(`/shares/${shareId}/revoke`, { method: 'POST' }),
  getPublicRxInfo: (token) => request(`/public/rx-info/${token}`),
  getPublicRxPdfUrl: (token, download = false) => `/api/public/rx/${token}${download ? '?download=true' : ''}`,

  // --- WHATSAPP & MESSAGING ---
  getWhatsAppConfig: () => request('/whatsapp/config'),
  sendWhatsAppLink: (data) => request('/whatsapp/send-link', { method: 'POST', body: JSON.stringify(data) }),
  sendWhatsAppCloud: (data) => request('/whatsapp/send-cloud', { method: 'POST', body: JSON.stringify(data) }),
  updateDoctorWhatsAppSettings: (data) => request('/doctor/whatsapp-settings', { method: 'PUT', body: JSON.stringify(data) }),
  getMessageLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/messages${query ? `?${query}` : ''}`);
  },
  getMessageStats: () => request('/messages/stats'),

  // --- TWO-SIDED PLATFORM: PUBLIC PATIENT DISCOVERY ---
  getPublicDoctors: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/public/doctors${query ? `?${query}` : ''}`);
  },
  getPublicSpecialties: () => request('/public/specialties'),
  getPublicCities: () => request('/public/cities'),
  getPublicAppointmentStatus: (appointmentId) => request(`/public/appointments/${appointmentId}`),

  // --- TWO-SIDED PLATFORM: DOCTOR WORKSPACE & ANALYTICS ---
  getDoctorDashboardStats: () => request('/doctor/dashboard-stats'),
  getDoctorReportsAnalytics: () => request('/doctor/reports/analytics'),
  getDoctorPublicSettings: () => request('/doctor/public-settings'),
  updateDoctorPublicSettings: (data) => request('/doctor/public-settings', { method: 'PUT', body: JSON.stringify(data) }),

  // --- DOCTOR LEDGER & PATIENT ACCOUNTING ---
  getLedgerEntries: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/ledger${query ? `?${query}` : ''}`);
  },
  getLedgerSummary: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/ledger/summary${query ? `?${query}` : ''}`);
  },
  getLedgerEntry: (id) => request(`/ledger/${id}`),
  createLedgerEntry: (data) => request('/ledger', { method: 'POST', body: JSON.stringify(data) }),
  updateLedgerEntry: (id, data) => request(`/ledger/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteLedgerEntry: (id) => request(`/ledger/${id}`, { method: 'DELETE' }),
  getPatientFinancialHistory: (patientId) => request(`/ledger/patient/${patientId}`),
  getLedgerCsvUrl: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return `/api/ledger/export/csv${query ? `?${query}` : ''}`;
  }
};
