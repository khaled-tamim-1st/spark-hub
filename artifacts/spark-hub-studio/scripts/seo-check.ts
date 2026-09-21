import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');

function checkFileExists(relPath: string): boolean {
  return fs.existsSync(path.join(ROOT, relPath));
}

function readFile(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

console.log('==================================================');
console.log('🔍 Spark Hub Studio — Automated SEO Health Check');
console.log('==================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, passMsg: string, failMsg: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${passMsg}`);
    passCount++;
  } else {
    console.log(`  ❌ FAIL: ${failMsg}`);
    failCount++;
  }
}

// 1. Check index.html tags
console.log('📄 1. Inspecting index.html:');
if (checkFileExists('index.html')) {
  const indexHtml = readFile('index.html');
  assert(indexHtml.includes('rel="canonical"'), 'Canonical link present', 'Missing canonical tag in index.html');
  assert(indexHtml.includes('hreflang="ar"'), 'hreflang="ar" link present', 'Missing hreflang="ar" in index.html');
  assert(indexHtml.includes('hreflang="en"'), 'hreflang="en" link present', 'Missing hreflang="en" in index.html');
  assert(indexHtml.includes('hreflang="x-default"'), 'hreflang="x-default" link present', 'Missing hreflang="x-default"');
  assert(indexHtml.includes('"@type": "MarketingAgency"'), 'MarketingAgency Schema present', 'Schema not updated to MarketingAgency');
  assert(indexHtml.includes('"@type": "WebSite"'), 'WebSite Schema with SearchAction present', 'Missing WebSite schema');
} else {
  assert(false, '', 'index.html not found');
}

// 2. Check robots.txt
console.log('\n🤖 2. Inspecting robots.txt:');
if (checkFileExists('public/robots.txt')) {
  const robots = readFile('public/robots.txt');
  assert(robots.includes('Sitemap: https://spark-hub.online/sitemap.xml'), 'Sitemap directive declared', 'Missing Sitemap directive');
  assert(robots.includes('Disallow: /admin'), 'Disallow /admin present', 'Missing /admin disallow');
  assert(robots.includes('Disallow: /ar/admin'), 'Disallow /ar/admin present', 'Missing /ar/admin disallow');
} else {
  assert(false, '', 'public/robots.txt not found');
}

// 3. Check public sitemap.xml
console.log('\n🗺️  3. Inspecting public/sitemap.xml:');
if (checkFileExists('public/sitemap.xml')) {
  const sitemap = readFile('public/sitemap.xml');
  assert(sitemap.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'), 'Valid sitemap xmlns', 'Invalid xmlns in sitemap.xml');
  assert(sitemap.includes('xmlns:xhtml="http://www.w3.org/1999/xhtml"'), 'Valid xhtml namespace for hreflang', 'Missing xhtml namespace');
  assert(sitemap.includes('<loc>https://spark-hub.online/services/strategy-and-planning</loc>'), 'Pillar service routes present in sitemap', 'Service pillar missing in sitemap');
  assert(sitemap.includes('<loc>https://spark-hub.online/work</loc>'), 'Work route present in sitemap', 'Work route missing in sitemap');
} else {
  assert(false, '', 'public/sitemap.xml not found');
}

// 4. Check App.tsx SEO hook integrations
console.log('\n⚛️  4. Inspecting React App.tsx SEO integration:');
if (checkFileExists('src/App.tsx')) {
  const appTsx = readFile('src/App.tsx');
  assert(appTsx.includes("import { useSEO } from '@/hooks/useSEO'"), 'useSEO hook imported in App.tsx', 'useSEO not imported in App.tsx');
  assert(appTsx.includes("import { SEOBreadcrumbs } from '@/components/seo/SEOBreadcrumbs'"), 'SEOBreadcrumbs component imported', 'SEOBreadcrumbs not imported');
  assert(appTsx.includes("import { RelatedBlogPosts } from '@/components/seo/RelatedBlogPosts'"), 'RelatedBlogPosts component imported', 'RelatedBlogPosts not imported');
  assert(appTsx.includes('function ServiceDetail()'), 'ServiceDetail component implemented', 'ServiceDetail missing');
  assert(!appTsx.includes('RedirectToServices'), 'RedirectToServices removed (Work enabled)', 'RedirectToServices still present');
} else {
  assert(false, '', 'src/App.tsx not found');
}

// 5. Check Hook and SEO component files
console.log('\n🧩 5. Inspecting SEO modules:');
assert(checkFileExists('src/hooks/useSEO.ts'), 'useSEO.ts hook exists', 'useSEO.ts missing');
assert(checkFileExists('src/components/seo/SEOBreadcrumbs.tsx'), 'SEOBreadcrumbs.tsx exists', 'SEOBreadcrumbs.tsx missing');
assert(checkFileExists('src/components/seo/RelatedBlogPosts.tsx'), 'RelatedBlogPosts.tsx exists', 'RelatedBlogPosts.tsx missing');

console.log('\n==================================================');
console.log(`Summary: ${passCount} passed, ${failCount} failed`);
console.log('==================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('✨ All SEO infrastructure requirements verified successfully!\n');
}
