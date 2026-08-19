const SITE_NAME = "Spark Hub Studio";
const SITE_URL = process.env.PUBLIC_SITE_URL || "https://spark-hub.online";
const DEFAULT_IMAGE = process.env.PUBLIC_DEFAULT_OG_IMAGE || `${SITE_URL}/logo.png`;

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
};

/**
 * Renders a full, plain-HTML document for crawlers/bots that do not
 * execute JavaScript. Deliberately unstyled beyond basics — bots read
 * text and structure, not CSS. Human visitors never see this; the
 * edge Worker only routes bot user-agents here.
 */
export function renderShell({ title, description, path, image, bodyHtml }: ShellOptions): string {
  const url = `${SITE_URL}${path}`;
  const ogImage = image || DEFAULT_IMAGE;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta name="google-site-verification" content="gx87jzqiQqonrST48CL4BIaT2EUtfWFi64nuLAJYdNc" />
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
<meta property="og:image:alt" content="${esc(title)}" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(description)}" />
<meta name="twitter:image" content="${esc(ogImage)}" />
<meta name="twitter:image:alt" content="${esc(title)}" />
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
<header><a href="/">${esc(SITE_NAME)}</a>
<nav>
<a href="/work">Work</a>
<a href="/services">Services</a>
<a href="/reels">Reels</a>
<a href="/podcasts">Podcasts</a>
<a href="/posts">Posts</a>
<a href="/about">About</a>
<a href="/blog">Blog</a>
<a href="/contact">Contact</a>
</nav>
</header>
<main>
${bodyHtml}
</main>
</body>
</html>`;
}

export { SITE_NAME, SITE_URL, DEFAULT_IMAGE };