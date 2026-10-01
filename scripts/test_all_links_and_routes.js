import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', 'public');

async function testUrl(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, headers: res.headers, body: data });
      });
    }).on('error', (err) => {
      resolve({ statusCode: 0, error: err.message });
    });
  });
}

async function runLinkAndRouteAudit() {
  console.log('====================================================');
  console.log('    DOCCARE 100% LINK, ROUTE & ASSET PRODUCTION AUDIT');
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

  // 1. Static Asset Existence Check
  console.log('[1] Auditing Static Branding & SEO Assets in /public...');
  const assetsToCheck = [
    'manifest.json',
    'favicon.ico',
    'favicon-32x32.png',
    'favicon-16x16.png',
    'favicon.png',
    'apple-touch-icon.png',
    'doccare-logo.png',
    'doccare-icon.png',
    'icon-192.png',
    'icon-512.png',
    'brand/doccare-logo.png',
    'brand/doccare-icon.png',
    'brand/doccare-logo-horizontal.png',
    'brand/doccare-logo-horizontal-compact.png',
    'brand/doccare-tagline.png',
    'brand/doccare-wordmark.png',
    'brand/doccare-watermark.png'
  ];

  for (const relPath of assetsToCheck) {
    const fullPath = path.join(publicDir, relPath);
    const exists = fs.existsSync(fullPath);
    assert(exists, `Static asset exists: /public/${relPath}`);
  }

  // 2. API Endpoints Audit (Backend on port 5005)
  console.log('\n[2] Auditing Backend API Endpoints (http://localhost:5005)...');
  const apiEndpoints = [
    { path: '/api/health', expectedStatus: 200, label: 'API Health Check' },
    { path: '/api/medicines/meta', expectedStatus: 200, label: 'Formulary Meta' },
    { path: '/api/medicines/sync-status', expectedStatus: 200, label: 'Formulary Sync Status' },
    { path: '/api/medicines/search?q=panadol', expectedStatus: 200, label: 'Medicine Search (Brand: Panadol)' },
    { path: '/api/medicines/search?q=amoxicillin', expectedStatus: 200, label: 'Medicine Search (Generic: Amoxicillin)' },
    { path: '/api/medicines/sync-logs?limit=5', expectedStatus: 200, label: 'Medicine Sync Logs' },
    { path: '/api/public/doctors', expectedStatus: 200, label: 'Public Doctors Directory' },
    { path: '/api/public/doctors/dr-ayesha-siddiqui', expectedStatus: 200, label: 'Public Doctor Profile (dr-ayesha-siddiqui)' },
    { path: '/api/public/specialties', expectedStatus: 200, label: 'SEO Public Specialties' },
    { path: '/api/public/cities', expectedStatus: 200, label: 'SEO Public Cities' },
    { path: '/api/patients', expectedStatus: 200, label: 'Patients API' },
    { path: '/api/appointments', expectedStatus: 200, label: 'Appointments API' },
    { path: '/api/prescriptions', expectedStatus: 200, label: 'Prescriptions API' },
    { path: '/api/ledger', expectedStatus: 200, label: 'Doctor Ledger Entries' },
    { path: '/api/ledger/summary', expectedStatus: 200, label: 'Doctor Ledger Summary' },
    { path: '/api/doctor/reports/analytics', expectedStatus: 200, label: 'Doctor Reports Analytics' },
    { path: '/api/messages', expectedStatus: 200, label: 'WhatsApp Message Logs' },
    { path: '/api/messages/stats', expectedStatus: 200, label: 'WhatsApp Message Stats' }
  ];

  for (const ep of apiEndpoints) {
    const res = await testUrl(`http://localhost:5005${ep.path}`);
    assert(res.statusCode === ep.expectedStatus, `${ep.label} [${ep.path}] returned HTTP ${res.statusCode}`);
  }

  // 3. Frontend Routes Audit (Vite on port 5173)
  console.log('\n[3] Auditing Frontend Public & SEO Routes (http://localhost:5173)...');
  const frontendRoutes = [
    { path: '/', label: 'Root Clinical Portal' },
    { path: '/find-doctors', label: 'Public Doctor Directory' },
    { path: '/doctors/lahore', label: 'SEO City Page (Lahore)' },
    { path: '/doctors/karachi', label: 'SEO City Page (Karachi)' },
    { path: '/doctors/islamabad', label: 'SEO City Page (Islamabad)' },
    { path: '/specialists/cardiologist', label: 'SEO Specialty Page (Cardiologist)' },
    { path: '/specialists/dermatologist', label: 'SEO Specialty Page (Dermatologist)' },
    { path: '/dr/dr-ayesha-siddiqui', label: 'Public Doctor Profile Page' },
    { path: '/verify/demo-rx-token', label: 'Prescription QR Verification Route' },
    { path: '/rx/demo-share-token', label: 'Secure Patient Prescription Viewer' }
  ];

  for (const route of frontendRoutes) {
    const res = await testUrl(`http://localhost:5173${route.path}`);
    assert(res.statusCode === 200, `${route.label} [${route.path}] returned HTTP 200 OK`);
  }

  console.log('\n====================================================');
  console.log(`AUDIT RESULT: ${passed} Checked & Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runLinkAndRouteAudit().catch(err => {
  console.error("Audit error:", err);
  process.exit(1);
});
