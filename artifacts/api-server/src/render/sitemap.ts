import { Router, type IRouter } from "express";
import { caseStudiesTable, blogPostsTable, db } from "@workspace/db";
import { SITE_URL } from "./shell";

const router: IRouter = Router();

const STATIC_ROUTES = [
  { path: "/", priority: "1.0" },
  { path: "/ar", priority: "1.0" },
  { path: "/services", priority: "0.9" },
  { path: "/ar/services", priority: "0.9" },
  { path: "/reels", priority: "0.8" },
  { path: "/ar/reels", priority: "0.8" },
  { path: "/podcasts", priority: "0.7" },
  { path: "/ar/podcasts", priority: "0.7" },
  { path: "/posts", priority: "0.7" },
  { path: "/ar/posts", priority: "0.7" },
  { path: "/team", priority: "0.7" },
  { path: "/ar/team", priority: "0.7" },
  { path: "/about", priority: "0.7" },
  { path: "/ar/about", priority: "0.7" },
  { path: "/blog", priority: "0.8" },
  { path: "/ar/blog", priority: "0.8" },
  { path: "/contact", priority: "0.8" },
  { path: "/ar/contact", priority: "0.8" },
];

function xmlEscape(val: string): string {
  return String(val ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function urlEntry(loc: string, priority: string, lastmod?: string): string {
  const safeLoc = xmlEscape(loc);
  const safePriority = xmlEscape(priority);
  const safeLastmod = lastmod ? `<lastmod>${xmlEscape(lastmod)}</lastmod>` : "";
  return `<url><loc>${safeLoc}</loc>${safeLastmod}<priority>${safePriority}</priority></url>`;
}

router.get("/sitemap.xml", async (_req, res) => {
  const [blogPosts] = await Promise.all([
    db.select({ slug: blogPostsTable.slug, publishedAt: blogPostsTable.publishedAt }).from(blogPostsTable),
  ]);

  const urls = [
    ...STATIC_ROUTES.map(r => urlEntry(`${SITE_URL}${r.path}`, r.priority)),
    ...blogPosts.flatMap(p => [
      urlEntry(`${SITE_URL}/blog/${p.slug}`, "0.6", p.publishedAt),
      urlEntry(`${SITE_URL}/ar/blog/${p.slug}`, "0.6", p.publishedAt),
    ]),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  res.type("application/xml").send(xml);
});

export default router;