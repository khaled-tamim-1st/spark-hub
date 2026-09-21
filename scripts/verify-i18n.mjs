import { readFileSync } from 'fs';
import { resolve } from 'path';

function runVerification() {
  console.log('--- 1. Testing Locale JSON Structure & Parity ---');
  const enPath = resolve('artifacts/spark-hub-studio/src/locales/en.json');
  const arPath = resolve('artifacts/spark-hub-studio/src/locales/ar.json');

  const en = JSON.parse(readFileSync(enPath, 'utf8'));
  const ar = JSON.parse(readFileSync(arPath, 'utf8'));

  function getKeys(obj, prefix = '') {
    return Object.keys(obj).reduce((acc, k) => {
      const full = prefix ? `${prefix}.${k}` : k;
      if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
        return [...acc, ...getKeys(obj[k], full)];
      }
      return [...acc, full];
    }, []);
  }

  const enKeys = new Set(getKeys(en));
  const arKeys = new Set(getKeys(ar));

  console.log(`Total keys in EN: ${enKeys.size}`);
  console.log(`Total keys in AR: ${arKeys.size}`);

  const missingInAr = [...enKeys].filter((k) => !arKeys.has(k));
  const missingInEn = [...arKeys].filter((k) => !enKeys.has(k));

  if (missingInAr.length > 0) {
    console.error('Keys missing in AR:', missingInAr);
    process.exit(1);
  }
  if (missingInEn.length > 0) {
    console.error('Keys missing in EN:', missingInEn);
    process.exit(1);
  }
  console.log('✓ PASS: All locale keys match between EN and AR perfectly.');

  console.log('\n--- 2. Verifying Typography, CSS Rules & Tajawal Font Imports ---');
  const cssPath = resolve('artifacts/spark-hub-studio/src/index.css');
  const css = readFileSync(cssPath, 'utf8');

  if (!css.includes("'Tajawal'")) throw new Error('Tajawal font not imported in CSS');
  if (!css.includes('letter-spacing: normal !important')) throw new Error('letter-spacing: normal not found in RTL CSS');
  if (!css.includes('[dir="rtl"] .eyebrow') || !css.includes('letter-spacing: normal !important')) {
    throw new Error('Arabic .eyebrow must have letter-spacing: normal !important to prevent letter separation');
  }

  const htmlPath = resolve('artifacts/spark-hub-studio/index.html');
  const html = readFileSync(htmlPath, 'utf8');
  if (!html.includes('family=Tajawal')) throw new Error('Tajawal Google Font link missing in index.html');
  console.log('✓ PASS: Typography hierarchy (Tajawal) & CSS classes verified.');

  console.log('\n--- 3. Verifying Component Architecture & RTL Integrity ---');
  const appPath = resolve('artifacts/spark-hub-studio/src/App.tsx');
  const app = readFileSync(appPath, 'utf8');
  if (!app.includes("t('hero.eyebrow')")) {
    throw new Error('Hero eyebrow translation missing in App.tsx');
  }
  if (!app.includes("t('hero.vision')")) {
    throw new Error('Hero vision translation missing in App.tsx');
  }
  if (!app.includes("t('partners.kicker'")) {
    throw new Error('Partners section translation missing in App.tsx');
  }
  console.log('✓ PASS: App.tsx localized hero and partners components verified.');

  console.log('\n--- 4. Verifying Backend SSR & Sitemap Localization ---');
  const routesPath = resolve('artifacts/api-server/src/render/routes.ts');
  const routes = readFileSync(routesPath, 'utf8');
  if (!routes.includes('/ar/services')) throw new Error('/ar/services route missing in SSR routes');
  if (!routes.includes('isAr ? "ar" : "en"')) throw new Error('Language detection missing in SSR routes');
  if (!routes.includes('isAr ? "rtl" : "ltr"')) throw new Error('Direction detection missing in SSR routes');

  const sitemapPath = resolve('artifacts/api-server/src/render/sitemap.ts');
  const sitemap = readFileSync(sitemapPath, 'utf8');
  if (!sitemap.includes('/ar/services')) throw new Error('/ar/services missing from sitemap.ts');
  console.log('✓ PASS: Backend SSR /ar paths and sitemap entries verified.');

  console.log('\n=================================================');
  console.log('   ALL i18n & TAJAWAL VERIFICATIONS PASSED (100%)');
  console.log('=================================================\n');
}

runVerification();
