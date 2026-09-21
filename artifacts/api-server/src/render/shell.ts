const SITE_NAME = "Spark Hub Studio";
const SITE_URL = process.env.PUBLIC_SITE_URL || "https://spark-hub.online";
const DEFAULT_IMAGE = process.env.PUBLIC_DEFAULT_OG_IMAGE || `${SITE_URL}/og-image.png`;

export function esc(value: string | number | null | undefined): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function formatInlineMarkdown(text: string): string {
  let safe = esc(text);
  // Bold: **text**
  safe = safe.replace(/\*\*([^*]+?)\*\*/g, "<strong>$1</strong>");
  // Italic: *text*
  safe = safe.replace(/(^|[^*])\*([^*]+?)\*([^*]|$)/g, "$1<em>$2</em>$3");
  // Inline code: `code`
  safe = safe.replace(/`([^`]+)`/g, "<code>$1</code>");
  // Links: [text](url)
  safe = safe.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/g, '<a href="$2">$1</a>');
  return safe;
}

/**
 * Converts raw Markdown content into clean, semantic HTML tags for search engine bots and AI crawlers.
 */
export function renderMarkdownToHtml(markdown: string): string {
  if (!markdown) return "";

  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const htmlChunks: string[] = [];
  let inList: "ul" | "ol" | null = null;
  let paragraphBuffer: string[] = [];

  function flushParagraph() {
    if (paragraphBuffer.length > 0) {
      const text = paragraphBuffer.join(" ").trim();
      if (text) {
        htmlChunks.push(`<p>${formatInlineMarkdown(text)}</p>`);
      }
      paragraphBuffer = [];
    }
  }

  function flushList() {
    if (inList) {
      htmlChunks.push(`</${inList}>`);
      inList = null;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    // Horizontal Rule
    if (/^---+$|^___+$|^\*\*\*+$/.test(line)) {
      flushParagraph();
      flushList();
      htmlChunks.push("<hr />");
      continue;
    }

    // Headings
    if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      htmlChunks.push(`<h3>${formatInlineMarkdown(line.slice(4))}</h3>`);
      continue;
    }
    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      htmlChunks.push(`<h2>${formatInlineMarkdown(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith("# ")) {
      flushParagraph();
      flushList();
      htmlChunks.push(`<h1>${formatInlineMarkdown(line.slice(2))}</h1>`);
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      flushParagraph();
      flushList();
      htmlChunks.push(`<blockquote><p>${formatInlineMarkdown(line.slice(2))}</p></blockquote>`);
      continue;
    }

    // Unordered List (- or *)
    const ulMatch = line.match(/^[-*]\s+(.*)$/);
    if (ulMatch) {
      flushParagraph();
      if (inList !== "ul") {
        flushList();
        inList = "ul";
        htmlChunks.push("<ul>");
      }
      htmlChunks.push(`<li>${formatInlineMarkdown(ulMatch[1])}</li>`);
      continue;
    }

    // Ordered List (1. or 2.)
    const olMatch = line.match(/^\d+\.\s+(.*)$/);
    if (olMatch) {
      flushParagraph();
      if (inList !== "ol") {
        flushList();
        inList = "ol";
        htmlChunks.push("<ol>");
      }
      htmlChunks.push(`<li>${formatInlineMarkdown(olMatch[1])}</li>`);
      continue;
    }

    // Regular line
    flushList();
    paragraphBuffer.push(line);
  }

  flushParagraph();
  flushList();

  return htmlChunks.join("\n");
}

export type BreadcrumbItem = {
  name: string;
  url: string;
};

export type ShellOptions = {
  title: string;
  description: string;
  path: string;
  image?: string;
  bodyHtml: string;
  lang?: string;
  dir?: string;
  extraHead?: string;
  schemas?: object[];
  breadcrumbs?: BreadcrumbItem[];
  canonicalPath?: string;
  keywords?: string[];
  type?: "website" | "article";
};

/**
 * Builds standard breadcrumbs JSON-LD schema
 */
export function buildBreadcrumbSchema(items: BreadcrumbItem[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

/**
 * Renders a full, semantic HTML document specifically crafted for crawlers and search engine bots.
 * Delivers comprehensive structured data, metadata, contextual internal links, and rich content.
 */
export function renderShell({
  title,
  description,
  path,
  image,
  bodyHtml,
  lang = "ar",
  dir = "rtl",
  extraHead = "",
  schemas = [],
  breadcrumbs,
  canonicalPath,
  keywords,
  type = "website",
}: ShellOptions): string {
  const currentPath = canonicalPath || path;
  const canonicalUrl = `${SITE_URL}${currentPath}`;
  const ogImage = image || DEFAULT_IMAGE;

  // Compute hreflang paths
  let cleanSubpath = path;
  if (cleanSubpath === "/ar" || cleanSubpath === "/en") {
    cleanSubpath = "";
  } else if (cleanSubpath.startsWith("/ar/")) {
    cleanSubpath = cleanSubpath.slice(3);
  } else if (cleanSubpath.startsWith("/en/")) {
    cleanSubpath = cleanSubpath.slice(3);
  }

  const arUrl = `${SITE_URL}${cleanSubpath === "" ? "/ar" : `/ar${cleanSubpath}`}`;
  const enUrl = `${SITE_URL}${cleanSubpath === "" ? "/" : cleanSubpath}`;

  // Organization Schema
  const defaultOrgSchema = {
    "@context": "https://schema.org",
    "@type": "MarketingAgency",
    "@id": `${SITE_URL}/#organization`,
    "name": "Spark Hub Studio | سبارك هب ستوديو",
    "alternateName": "Spark Agency Studio",
    "url": SITE_URL,
    "logo": `${SITE_URL}/logo.png`,
    "image": ogImage,
    "description": "استوديو استشاري ووكالة تسويق رقمي متكاملة لهندسة نمو الأعمال، إدارة الحملات الإعلانية، السيو، تصميم الهوية البصرية وإنتاج الفيديو.",
    "email": "hello@spark-hub.online",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "EG",
      "addressLocality": "Cairo",
      "addressRegion": "Cairo Governorate",
    },
    "areaServed": [
      { "@type": "Country", "name": "Egypt", "alternateName": "مصر" },
      { "@type": "Country", "name": "Saudi Arabia", "alternateName": "المملكة العربية السعودية" },
      { "@type": "Country", "name": "United Arab Emirates", "alternateName": "الإمارات العربية المتحدة" },
      { "@type": "GeoShape", "name": "MENA Region" },
    ],
    "sameAs": [
      "https://www.instagram.com/sparkhubstudio",
      "https://www.linkedin.com/company/spark-hub-studio",
    ],
    "priceRange": "$$",
  };

  const allSchemas: object[] = [defaultOrgSchema];

  if (breadcrumbs && breadcrumbs.length > 0) {
    allSchemas.push(buildBreadcrumbSchema(breadcrumbs));
  }

  if (schemas && schemas.length > 0) {
    allSchemas.push(...schemas);
  }

  const schemaScripts = allSchemas
    .map((s) => `<script type="application/ld+json">\n${JSON.stringify(s, null, 2)}\n</script>`)
    .join("\n");

  const isAr = lang === "ar";
  const navHome = isAr ? "/ar" : "/";
  const navServices = isAr ? "/ar/services" : "/services";
  const navReels = isAr ? "/ar/reels" : "/reels";
  const navPodcasts = isAr ? "/ar/podcasts" : "/podcasts";
  const navPosts = isAr ? "/ar/posts" : "/posts";
  const navTeam = isAr ? "/ar/team" : "/team";
  const navAbout = isAr ? "/ar/about" : "/about";
  const navBlog = isAr ? "/ar/blog" : "/blog";
  const navContact = isAr ? "/ar/contact" : "/contact";

  return `<!DOCTYPE html>
<html lang="${esc(lang)}" dir="${esc(dir)}">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="google-site-verification" content="gx87jzqiQqonrST48CL4BIaT2EUtfWFi64nuLAJYdNc" />
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
${keywords && keywords.length > 0 ? `<meta name="keywords" content="${esc(keywords.join(", "))}" />` : ""}
<link rel="canonical" href="${esc(canonicalUrl)}" />
<link rel="alternate" hreflang="ar" href="${esc(arUrl)}" />
<link rel="alternate" hreflang="en" href="${esc(enUrl)}" />
<link rel="alternate" hreflang="x-default" href="${esc(enUrl)}" />
<link rel="icon" type="image/png" sizes="32x32" href="${esc(SITE_URL)}/favicon.png" />
<link rel="icon" type="image/png" sizes="192x192" href="${esc(SITE_URL)}/favicon.png" />
<link rel="apple-touch-icon" sizes="180x180" href="${esc(SITE_URL)}/logo.png" />
<link rel="shortcut icon" href="${esc(SITE_URL)}/favicon.png" />
<meta property="og:site_name" content="${esc(SITE_NAME)}" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:url" content="${esc(canonicalUrl)}" />
<meta property="og:image" content="${esc(ogImage)}" />
<meta property="og:image:secure_url" content="${esc(ogImage)}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="${esc(title)}" />
<meta property="og:type" content="${esc(type)}" />
<meta property="og:locale" content="${isAr ? "ar_AR" : "en_US"}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(description)}" />
<meta name="twitter:image" content="${esc(ogImage)}" />
<meta name="twitter:image:alt" content="${esc(title)}" />
${schemaScripts}
${extraHead}
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Tajawal', sans-serif; background: #0c111c; color: #e5e7eb; max-width: 900px; margin: 0 auto; padding: 2rem 1.25rem; line-height: 1.8; }
  header { border-bottom: 1px solid #1f293d; padding-bottom: 1.25rem; margin-bottom: 2rem; }
  .header-top { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1rem; }
  .brand-logo { color: #f59e0b; text-decoration: none; font-weight: 800; font-size: 1.25rem; letter-spacing: 0.05em; }
  .brand-tagline { color: #9ca3af; font-size: 0.85rem; }
  nav { display: flex; flex-wrap: wrap; gap: 0.85rem 1.25rem; font-size: 0.92rem; }
  nav a { color: #9ca3af; text-decoration: none; transition: color 0.2s; font-weight: 500; }
  nav a:hover, nav a:focus { color: #f59e0b; }
  main { min-height: 50vh; }
  h1 { font-size: 2.1rem; color: #ffffff; line-height: 1.35; margin-top: 0; margin-bottom: 1rem; }
  h2 { font-size: 1.5rem; color: #f59e0b; margin-top: 2.5rem; margin-bottom: 1rem; border-bottom: 1px solid #1f293d; padding-bottom: 0.5rem; }
  h3 { font-size: 1.2rem; color: #ffffff; margin-top: 1.5rem; margin-bottom: 0.5rem; }
  h4 { font-size: 1.05rem; color: #e5e7eb; margin-top: 1rem; }
  p, li { color: #d1d5db; font-size: 1.02rem; }
  a { color: #f59e0b; text-decoration: underline; text-underline-offset: 3px; }
  a:hover { color: #fbbf24; }
  blockquote { border-inline-start: 4px solid #f59e0b; background: #131b2e; padding: 0.85rem 1.25rem; margin: 1.5rem 0; border-radius: 4px; color: #f3f4f6; font-style: italic; }
  img { max-width: 100%; height: auto; border-radius: 8px; margin: 1.5rem 0; border: 1px solid #1f293d; }
  ul, ol { padding-inline-start: 1.5rem; margin: 1rem 0; }
  li { margin-bottom: 0.5rem; }
  .badge { display: inline-block; background: #1f293d; color: #f59e0b; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.82rem; margin-inline-end: 0.5rem; }
  .grid-card { background: #131b2e; border: 1px solid #1f293d; border-radius: 8px; padding: 1.25rem; margin-bottom: 1.25rem; }
  .faq-item { background: #111827; border: 1px solid #1f293d; border-radius: 6px; padding: 1rem 1.25rem; margin-bottom: 1rem; }
  .faq-item h3 { margin-top: 0; color: #f59e0b; }
  .faq-item p { margin-bottom: 0; }
  .cta-box { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 1px solid #f59e0b; border-radius: 8px; padding: 1.5rem; margin: 2.5rem 0; text-align: start; }
  .cta-box h3 { color: #f59e0b; margin-top: 0; font-size: 1.35rem; }
  .cta-box p { color: #e2e8f0; }
  .cta-btn { display: inline-block; background: #f59e0b; color: #000000 !important; font-weight: bold; text-decoration: none; padding: 0.65rem 1.5rem; border-radius: 4px; margin-top: 0.75rem; }
  footer { border-top: 1px solid #1f293d; padding-top: 2rem; margin-top: 3.5rem; color: #9ca3af; font-size: 0.9rem; }
  .footer-links { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
  .footer-col h4 { color: #ffffff; margin-top: 0; margin-bottom: 0.75rem; font-size: 0.95rem; }
  .footer-col ul { list-style: none; padding: 0; margin: 0; }
  .footer-col li { margin-bottom: 0.4rem; }
  .footer-col a { color: #9ca3af; text-decoration: none; font-size: 0.88rem; }
  .footer-col a:hover { color: #f59e0b; }
  .footer-bottom { border-top: 1px solid #172033; padding-top: 1.25rem; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 1rem; font-size: 0.82rem; }
</style>
</head>
<body>
<header>
  <div class="header-top">
    <div>
      <a href="${esc(navHome)}" class="brand-logo">${esc(SITE_NAME)}</a>
      <div class="brand-tagline">${isAr ? "استوديو استشاري لهندسة ونمو الأعمال والتسويق المتكامل" : "Strategic Growth & Full-Service Marketing Studio"}</div>
    </div>
  </div>
  <nav aria-label="${isAr ? "التنقل الرئيسي" : "Main Navigation"}">
    <a href="${esc(navHome)}">${isAr ? "الرئيسية" : "Home"}</a>
    <a href="${esc(navServices)}">${isAr ? "الخدمات" : "Services"}</a>
    <a href="${esc(navReels)}">${isAr ? "ريلز وميديا" : "Reels"}</a>
    <a href="${esc(navPodcasts)}">${isAr ? "بودكاست" : "Podcasts"}</a>
    <a href="${esc(navPosts)}">${isAr ? "سجل الأعمال" : "Work"}</a>
    <a href="${esc(navTeam)}">${isAr ? "فريق العمل" : "Team"}</a>
    <a href="${esc(navAbout)}">${isAr ? "عن الاستوديو" : "About"}</a>
    <a href="${esc(navBlog)}">${isAr ? "رؤى وأفكار" : "Blog"}</a>
    <a href="${esc(navContact)}">${isAr ? "تواصل معنا" : "Contact"}</a>
  </nav>
</header>
<main>
${bodyHtml}
</main>
<footer>
  <div class="footer-links">
    <div class="footer-col">
      <h4>${isAr ? "استوديو سبارك هب" : "Spark Hub Studio"}</h4>
      <p style="font-size: 0.85rem; color: #9ca3af; margin-top: 0;">
        ${isAr
          ? "استوديو استراتيجي متكامل لهندسة وتوسيع الأعمال، إدارة الحملات الإعلانية الممولة، السيو، بناء الهويات البصرية، والإنتاج السينمائي للشركات في السعودية والخليج ومصر."
          : "An integrated growth studio delivering full-service marketing, performance advertising, SEO, brand architecture, and media production across Saudi Arabia, UAE, and MENA."}
      </p>
    </div>
    <div class="footer-col">
      <h4>${isAr ? "الخدمات الرئيسية" : "Core Services"}</h4>
      <ul>
        <li><a href="${esc(navServices)}">${isAr ? "التخطيط وهندسة التوسع (GTM)" : "Growth Strategy & GTM"}</a></li>
        <li><a href="${esc(navServices)}">${isAr ? "إعلانات جوجل وميتا وسناب (Performance Ads)" : "Performance Marketing"}</a></li>
        <li><a href="${esc(navServices)}">${isAr ? "تحسين محركات البحث والسيو المحلي (SEO)" : "SEO & Local Search"}</a></li>
        <li><a href="${esc(navServices)}">${isAr ? "الهوية البصرية والأنظمة الإبداعية" : "Brand Identity"}</a></li>
        <li><a href="${esc(navReels)}">${isAr ? "الإنتاج السينمائي والريلز (Reels)" : "Video & Reels Production"}</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h4>${isAr ? "استكشف المحتوى" : "Explore Studio"}</h4>
      <ul>
        <li><a href="${esc(navPosts)}">${isAr ? "سجل الأعمال والحملات" : "Work & Campaigns"}</a></li>
        <li><a href="${esc(navPodcasts)}">${isAr ? "بودكاست سبارك هب" : "Podcasts & Dialogues"}</a></li>
        <li><a href="${esc(navBlog)}">${isAr ? "المقالات والرؤى الاستراتيجية" : "Field Notes & Blog"}</a></li>
        <li><a href="${esc(navTeam)}">${isAr ? "فريق الخبراء والقيادات" : "Leadership Team"}</a></li>
        <li><a href="${esc(navAbout)}">${isAr ? "عن الاستوديو وفلسفتنا" : "About & Philosophy"}</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h4>${isAr ? "التواصل والمناطق" : "Contact & Service Areas"}</h4>
      <ul>
        <li><a href="${esc(navContact)}">${isAr ? "احجز استشارة نمو" : "Book a Consultation"}</a></li>
        <li><a href="mailto:hello@spark-hub.online">hello@spark-hub.online</a></li>
        <li><span>${isAr ? "المملكة العربية السعودية (الرياض، جدة)" : "Saudi Arabia (Riyadh, Jeddah)"}</span></li>
        <li><span>${isAr ? "الإمارات العربية المتحدة (دبي، أبوظبي)" : "UAE (Dubai, Abu Dhabi)"}</span></li>
        <li><span>${isAr ? "جمهورية مصر العربية (القاهرة)" : "Egypt (Cairo)"}</span></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    <div>© ${new Date().getFullYear()} ${esc(SITE_NAME)}. ${isAr ? "جميع الحقوق محفوظة." : "All rights reserved."}</div>
    <div>${isAr ? "حيث تلتقي الاستراتيجية بالنمو المستدام." : "Where Strategy Meets Sustainable Growth."}</div>
  </div>
</footer>
</body>
</html>`;
}

export { SITE_NAME, SITE_URL, DEFAULT_IMAGE };