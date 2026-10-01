import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function runLogoAndBrandingAudit() {
  console.log("====================================================");
  console.log("  DOCCARE GLOBAL LOGO & ANIMATION BRANDING AUDIT   ");
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

  // 1. Single Source of Truth Asset Verification
  console.log("[1] Checking Single Source of Truth Brand Assets...");
  const publicDir = path.resolve('public');
  const brandDir = path.resolve('public/brand');

  const requiredAssets = [
    { file: 'doccare-logo.png', minWidth: 500, minHeight: 500, hasAlpha: true },
    { file: 'brand/doccare-logo.png', minWidth: 500, minHeight: 500, hasAlpha: true },
    { file: 'brand/doccare-icon.png', minWidth: 500, minHeight: 500, hasAlpha: true },
    { file: 'favicon-16x16.png', expectedSize: 16 },
    { file: 'favicon-32x32.png', expectedSize: 32 },
    { file: 'apple-touch-icon.png', expectedSize: 180 },
    { file: 'icon-192.png', expectedSize: 192 },
    { file: 'icon-512.png', expectedSize: 512 }
  ];

  for (const item of requiredAssets) {
    const fullPath = path.join(publicDir, item.file);
    const exists = fs.existsSync(fullPath);
    assert(exists, `Asset exists: /${item.file}`);
    if (exists) {
      const meta = await sharp(fullPath).metadata();
      if (item.minWidth) {
        assert(meta.width >= item.minWidth && meta.height >= item.minHeight, `Asset resolution check for /${item.file}: ${meta.width}x${meta.height}`);
      }
      if (item.expectedSize) {
        assert(meta.width === item.expectedSize && meta.height === item.expectedSize, `Icon exact dimension check for /${item.file}: ${meta.width}x${meta.height}`);
      }
      if (item.hasAlpha !== undefined) {
        assert(meta.hasAlpha === item.hasAlpha, `Asset alpha channel transparency check for /${item.file}: hasAlpha=${meta.hasAlpha}`);
      }
    }
  }

  // 2. Responsive Viewport Rule Audit
  console.log("\n[2] Auditing Responsive Viewport Rules & Sizing...");
  const viewports = [
    { name: "iPhone SE (Mobile)", width: 320, height: 568 },
    { name: "iPhone X/11/12 (Mobile)", width: 375, height: 812 },
    { name: "iPhone 13/14/15 Pro (Mobile)", width: 390, height: 844 },
    { name: "Pixel 7 / Galaxy S21 (Mobile)", width: 412, height: 915 },
    { name: "iPad Mini / Tablet", width: 768, height: 1024 },
    { name: "iPad Pro (Tablet)", width: 1024, height: 1366 },
    { name: "MacBook Air / Laptop", width: 1440, height: 900 },
    { name: "Desktop 1080p", width: 1920, height: 1080 }
  ];

  const docCareLogoContent = fs.readFileSync('src/components/DocCareLogo.jsx', 'utf-8');
  const splashContent = fs.readFileSync('src/components/DocCareSplash.jsx', 'utf-8');
  const indexCssContent = fs.readFileSync('src/index.css', 'utf-8');

  assert(docCareLogoContent.includes('object-contain'), 'DocCareLogo strictly uses object-fit: contain');
  assert(docCareLogoContent.includes('max-w-[80vw]') || docCareLogoContent.includes('max-h-[28vh]') || docCareLogoContent.includes('clamp'), 'DocCareLogo uses responsive clamp and safe-area max-width/max-height');
  assert(splashContent.includes('clamp(130px,38vw,200px)'), 'DocCareSplash uses responsive clamp sizing');
  assert(splashContent.includes('max-w-[80vw]'), 'DocCareSplash enforces max-width 80vw to prevent screen edge overflow');
  assert(splashContent.includes('prefers-reduced-motion'), 'DocCareSplash explicitly supports prefers-reduced-motion: reduce');
  assert(indexCssContent.includes('@media (prefers-reduced-motion: reduce)'), 'index.css has global prefers-reduced-motion reset for logo animations');
  assert(indexCssContent.includes('logoSoftEntrance') || indexCssContent.includes('logoEntrance'), 'index.css has soft entrance medical keyframe animations');

  // 3. Components Single Source of Truth Brand Audit
  console.log("\n[3] Auditing Components Brand Integrity...");
  const components = [
    'src/components/Navbar.jsx',
    'src/components/Sidebar.jsx',
    'src/components/AuthModal.jsx',
    'src/pages/WelcomeAuthPage.jsx',
    'src/pages/PatientDashboardPage.jsx',
    'src/pages/FindDoctorPage.jsx',
    'src/pages/PublicDoctorProfile.jsx',
    'src/pages/PublicVerifyPrescription.jsx',
    'src/pages/PublicSecureRxViewer.jsx',
    'src/components/PrescriptionPDF.jsx'
  ];

  for (const comp of components) {
    const content = fs.readFileSync(comp, 'utf-8');
    const hasDocCareBranding = content.includes('DocCareLogo') || content.includes('doccare-logo') || content.includes('doccare-icon');
    assert(hasDocCareBranding, `Component uses official DocCare branding: ${comp}`);
  }

  console.log("\n====================================================");
  console.log(`AUDIT COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log("====================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runLogoAndBrandingAudit().catch(err => {
  console.error("Audit error:", err);
  process.exit(1);
});
