import { Router, type IRouter } from "express";
import { caseStudiesTable, blogPostsTable, db } from "@workspace/db";
import { SITE_URL } from "./shell";

const router: IRouter = Router();

interface RoutePair {
  enPath: string;
  arPath: string;
  priority: string;
  changefreq: "daily" | "weekly" | "monthly";
  lastmod?: string;
}

const STATIC_PAIRS: RoutePair[] = [
  { enPath: "/", arPath: "/ar", priority: "1.0", changefreq: "weekly" },
  { enPath: "/services", arPath: "/ar/services", priority: "0.9", changefreq: "weekly" },
  { enPath: "/services/strategy-and-planning", arPath: "/ar/services/strategy-and-planning", priority: "0.85", changefreq: "monthly" },
  { enPath: "/services/marketing-management", arPath: "/ar/services/marketing-management", priority: "0.85", changefreq: "monthly" },
  { enPath: "/services/brand-identity", arPath: "/ar/services/brand-identity", priority: "0.85", changefreq: "monthly" },
  { enPath: "/services/media-production", arPath: "/ar/services/media-production", priority: "0.85", changefreq: "monthly" },
  { enPath: "/services/training-and-development", arPath: "/ar/services/training-and-development", priority: "0.85", changefreq: "monthly" },
  { enPath: "/work", arPath: "/ar/work", priority: "0.85", changefreq: "weekly" },
  { enPath: "/blog", arPath: "/ar/blog", priority: "0.85", changefreq: "daily" },
  { enPath: "/team", arPath: "/ar/team", priority: "0.75", changefreq: "monthly" },
  { enPath: "/about", arPath: "/ar/about", priority: "0.75", changefreq: "monthly" },
  { enPath: "/reels", arPath: "/ar/reels", priority: "0.75", changefreq: "weekly" },
  { enPath: "/podcasts", arPath: "/ar/podcasts", priority: "0.75", changefreq: "weekly" },
  { enPath: "/posts", arPath: "/ar/posts", priority: "0.75", changefreq: "weekly" },
  { enPath: "/contact", arPath: "/ar/contact", priority: "0.80", changefreq: "monthly" },
];

function xmlEscape(val: string): string {
  return String(val ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function generateUrlXml(
  loc: string,
  enUrl: string,
  arUrl: string,
  priority: string,
  changefreq: string,
  lastmod?: string
): string {
  const safeLoc = xmlEscape(loc);
  const safeEn = xmlEscape(enUrl);
  const safeAr = xmlEscape(arUrl);
  const safePriority = xmlEscape(priority);
  const safeFreq = xmlEscape(changefreq);
  const safeLastmod = lastmod
    ? `    <lastmod>${xmlEscape(new Date(lastmod).toISOString().split("T")[0])}</lastmod>\n`
    : `    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>\n`;

  return `  <url>
    <loc>${safeLoc}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${safeEn}" />
    <xhtml:link rel="alternate" hreflang="ar" href="${safeAr}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${safeEn}" />
${safeLastmod}    <changefreq>${safeFreq}</changefreq>
    <priority>${safePriority}</priority>
  </url>`;
}

router.get("/sitemap.xml", async (_req, res) => {
  try {
    const [blogPosts, caseStudies] = await Promise.all([
      db.select({ slug: blogPostsTable.slug, publishedAt: blogPostsTable.publishedAt }).from(blogPostsTable),
      db.select({ slug: caseStudiesTable.slug }).from(caseStudiesTable),
    ]);

    const urlEntries: string[] = [];

    // 1. Static route pairs
    for (const pair of STATIC_PAIRS) {
      const enUrl = `${SITE_URL}${pair.enPath}`;
      const arUrl = `${SITE_URL}${pair.arPath}`;
      urlEntries.push(generateUrlXml(enUrl, enUrl, arUrl, pair.priority, pair.changefreq, pair.lastmod));
      urlEntries.push(generateUrlXml(arUrl, enUrl, arUrl, pair.priority, pair.changefreq, pair.lastmod));
    }

    // 2. Case study pairs
    for (const cs of caseStudies) {
      const enUrl = `${SITE_URL}/work/${cs.slug}`;
      const arUrl = `${SITE_URL}/ar/work/${cs.slug}`;
      urlEntries.push(generateUrlXml(enUrl, enUrl, arUrl, "0.75", "monthly"));
      urlEntries.push(generateUrlXml(arUrl, enUrl, arUrl, "0.75", "monthly"));
    }

    // 3. Blog post pairs
    for (const post of blogPosts) {
      const enUrl = `${SITE_URL}/blog/${post.slug}`;
      const arUrl = `${SITE_URL}/ar/blog/${post.slug}`;
      urlEntries.push(generateUrlXml(enUrl, enUrl, arUrl, "0.70", "weekly", post.publishedAt));
      urlEntries.push(generateUrlXml(arUrl, enUrl, arUrl, "0.70", "weekly", post.publishedAt));
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries.join("\n")}
</urlset>`;

    res.header("Content-Type", "application/xml; charset=utf-8");
    res.header("Cache-Control", "public, max-age=3600, s-maxage=7200");
    res.send(xml);
  } catch (error) {
    res.status(500).type("text/plain").send("Error generating sitemap");
  }
});

export default router;