const SITE_NAME = "Spark Hub Studio";
const SITE_URL = process.env.PUBLIC_SITE_URL || "https://spark-hub.online";
const DEFAULT_IMAGE = process.env.PUBLIC_DEFAULT_OG_IMAGE || `${SITE_URL}/og-image.png`;

export function esc(value: string): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

type ShellOptions = {
  title: string;
  description: string;
  path: string;
  image?: string;
  bodyHtml: string;
  lang?: string;
  dir?: string;
  extraHead?: string;
};

/**
 * Renders a full, plain-HTML document for crawlers/bots that do not
 * execute JavaScript. Deliberately unstyled beyond basics — bots read
 * text and structure, not CSS. Human visitors never see this; the
 * edge Worker only routes bot user-agents here.
 */
export function renderShell({ title, description, path, image, bodyHtml, lang = "en", dir = "ltr", extraHead = "" }: ShellOptions): string {
  const url = `${SITE_URL}${path}`;
  const ogImage = image || DEFAULT_IMAGE;
  return `<!DOCTYPE html>
<html lang="${esc(lang)}" dir="${esc(dir)}">
<head>
<meta name="google-site-verification" content="gx87jzqiQqonrST48CL4BIaT2EUtfWFi64nuLAJYdNc" />
${extraHead}
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<link rel="icon" type="image/png" sizes="32x32" href="${esc(SITE_URL)}/favicon.png" />
<link rel="icon" type="image/png" sizes="192x192" href="${esc(SITE_URL)}/favicon.png" />
<link rel="apple-touch-icon" sizes="180x180" href="${esc(SITE_URL)}/logo.png" />
<link rel="shortcut icon" href="${esc(SITE_URL)}/favicon.png" />
<meta property="og:site_name" content="${esc(SITE_NAME)}" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:url" content="${esc(url)}" />
<meta property="og:image" content="${esc(ogImage)}" />
<meta property="og:image:secure_url" content="${esc(ogImage)}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="${esc(title)}" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(description)}" />
<meta name="twitter:image" content="${esc(ogImage)}" />
<meta name="twitter:image:alt" content="${esc(title)}" />
<link rel="canonical" href="${esc(url)}" />
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Tajawal', sans-serif; background: #0c111c; color: #e5e7eb; max-width: 860px; margin: 0 auto; padding: 2rem 1.25rem; line-height: 1.8; }
  header { border-bottom: 1px solid #1f293d; padding-bottom: 1.25rem; margin-bottom: 2rem; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; }
  header a { color: #f59e0b; text-decoration: none; font-weight: 800; font-size: 1.1rem; }
  nav { display: flex; flex-wrap: wrap; gap: 1rem; font-size: 0.9rem; }
  nav a { color: #9ca3af; text-decoration: none; }
  nav a:hover { color: #f59e0b; }
  h1 { font-size: 2rem; color: #ffffff; line-height: 1.3; margin-top: 0; }
  h2 { font-size: 1.45rem; color: #f59e0b; margin-top: 2rem; border-bottom: 1px solid #1f293d; padding-bottom: 0.5rem; }
  h3 { font-size: 1.15rem; color: #ffffff; margin-top: 1.25rem; }
  p, li { color: #d1d5db; font-size: 1rem; }
  a { color: #f59e0b; }
  blockquote { border-right: 4px solid #f59e0b; background: #131b2e; padding: 0.75rem 1.25rem; margin: 1.25rem 0; border-radius: 4px; color: #f3f4f6; }
  img { max-width: 100%; height: auto; border-radius: 8px; margin: 1.5rem 0; border: 1px solid #1f293d; }
  ul { padding-inline-start: 1.25rem; }
</style>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "${esc(SITE_NAME)}",
  "url": "${esc(SITE_URL)}",
  "logo": "${esc(SITE_URL)}/logo.png",
  "image": "${esc(ogImage)}",
  "description": "${esc(description)}"
}
</script>
</head>
<body>
<header>
  <a href="${esc(SITE_URL)}/">${esc(SITE_NAME)}</a>
  <nav>
    <a href="${esc(SITE_URL)}/services">الخدمات</a>
    <a href="${esc(SITE_URL)}/blog">المدونة</a>
    <a href="${esc(SITE_URL)}/about">عن الاستوديو</a>
    <a href="${esc(SITE_URL)}/contact">تواصل معنا</a>
  </nav>
</header>
<main>
${bodyHtml}
</main>
</body>
</html>`;
}

export { SITE_NAME, SITE_URL, DEFAULT_IMAGE };