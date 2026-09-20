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

  console.log('\n--- 2. Verifying Exact Arabic Copy Requirements ---');
  // 1. Hero
  if (ar.hero.headline_1 !== 'حيث تلتقي') throw new Error('Hero prefix mismatch');
  if (ar.hero.headline_2 !== 'الاستراتيجية') throw new Error('Hero highlight mismatch');
  if (ar.hero.headline_3 !== 'بالنمو.') throw new Error('Hero suffix mismatch');
  console.log('✓ PASS: Hero Arabic headline matches exact specification.');

  // 2. Core 4 Services
  const expectedServices = [
    'الاستراتيجية والتخطيط المؤسسي',
    'إدارة التسويق ومضاعفة النمو',
    'استراتيجية الهوية البصرية والأنظمة',
    'التدريب التنفيذي وتسريع المهارات',
  ];
  const arServices = [
    ar.services.items.strategy.title,
    ar.services.items.marketing.title,
    ar.services.items.creative.title,
    ar.services.items.training.title,
  ];
  for (let i = 0; i < expectedServices.length; i++) {
    if (arServices[i] !== expectedServices[i]) {
      throw new Error(`Service mismatch: expected "${expectedServices[i]}", got "${arServices[i]}"`);
    }
  }
  console.log('✓ PASS: Core 4 Services match exact Arabic copy.');

  // 3. Contact Form fields
  if (ar.contact.name_label !== 'الاسم الكريم') throw new Error('name_label mismatch');
  if (ar.contact.email_label !== 'البريد الإلكتروني للعمل') throw new Error('email_label mismatch');
  if (ar.contact.service_label !== 'ما الذي يمكننا مساعدتك في تحقيقه؟') throw new Error('service_label mismatch');
  if (ar.contact.budget_label !== 'الميزانية التقديرية للاستثمار (دليل استرشادي لتخصيص الحلول)') throw new Error('budget_label mismatch');
  if (ar.contact.brief_label !== 'متطلبات المشروع وتطلعات النمو') throw new Error('brief_label mismatch');
  if (ar.contact.submit !== 'إرسال متطلبات المشروع') throw new Error('submit button mismatch');
  console.log('✓ PASS: Contact Form fields & submit match exact Arabic copy.');

  // 4. Footer
  if (ar.footer.explore !== 'استكشف') throw new Error('footer explore mismatch');
  if (ar.footer.studio !== 'الاستوديو') throw new Error('footer studio mismatch');
  console.log('✓ PASS: Footer labels match exact Arabic copy.');

  console.log('\n--- 3. Verifying CSS & Typography Rules ---');
  const cssPath = resolve('artifacts/spark-hub-studio/src/index.css');
  const css = readFileSync(cssPath, 'utf8');

  if (!css.includes('Alexandria')) throw new Error('Alexandria font not imported in CSS');
  if (!css.includes('letter-spacing: normal !important')) throw new Error('letter-spacing: normal not found in RTL CSS');
  if (!css.includes('@custom-variant rtl')) throw new Error('@custom-variant rtl not configured in CSS');
  if (!css.includes('@custom-variant ltr')) throw new Error('@custom-variant ltr not configured in CSS');
  // Confirm .eyebrow has letter-spacing: normal in RTL
  if (!css.includes('[dir="rtl"] .eyebrow {\n  letter-spacing: normal !important;')) {
    throw new Error('Arabic .eyebrow must have letter-spacing: normal !important to prevent letter separation');
  }
  console.log('✓ PASS: CSS typography, letter-spacing cancelation, and RTL variants configured.');

  console.log('\n--- 4. Verifying HTML Google Fonts Import ---');
  const htmlPath = resolve('artifacts/spark-hub-studio/index.html');
  const html = readFileSync(htmlPath, 'utf8');
  if (!html.includes('family=Alexandria')) throw new Error('Alexandria Google Font link missing in index.html');
  console.log('✓ PASS: Google Fonts Alexandria link present in index.html.');

  console.log('\n--- 5. Verifying App.tsx Core Services & Form Alignment ---');
  const appPath = resolve('artifacts/spark-hub-studio/src/App.tsx');
  const app = readFileSync(appPath, 'utf8');

  // Verify App.tsx service mappings
  for (const service of expectedServices) {
    if (!app.includes(service)) {
      throw new Error(`Service "${service}" missing from App.tsx localized service definitions`);
    }
  }
  // Verify contact form header
  if (!app.includes('جاهز لتحويل') || !app.includes('— لنبدأ محادثة عمل')) {
    throw new Error('Contact header incomplete in App.tsx');
  }
  // Verify Play icon is not rotated 180
  if (app.includes('<Play size={12} fill="currentColor" className="rtl:rotate-180" />')) {
    throw new Error('Play button should not be mirrored in RTL');
  }
  console.log('✓ PASS: App.tsx services, contact header, and icon directions validated.');

  console.log('\n--- 6. Verifying Backend SSR & Sitemap Localization ---');
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
  console.log('   ALL I18N & RTL VERIFICATIONS PASSED (100%)');
  console.log('=================================================\n');
}

runVerification();
