import { Router, type IRouter } from "express";
import { caseStudiesTable, blogPostsTable, db } from "@workspace/db";
import { SITE_URL } from "./shell";

const router: IRouter = Router();

const STATIC_ROUTES = [
  { path: "/", priority: "1.0" },
  { path: "/work", priority: "0.8" },
  { path: "/services", priority: "0.8" },
  { path: "/reels", priority: "0.6" },
  { path: "/posts", priority: "0.6" },
  { path: "/about", priority: "0.6" },
  { path: "/contact", priority: "0.5" },
  { path: "/blog", priority: "0.7" },
];

function urlEntry(loc: string, priority: string, lastmod?: string): string {
  return `<url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}<priority>${priority}</priority></url>`;
}

router.get("/sitemap.xml", async (_req, res) => {
  const [caseStudies, blogPosts] = await Promise.all([
    db.select({ slug: caseStudiesTable.slug }).from(caseStudiesTable),
    db.select({ slug: blogPostsTable.slug, publishedAt: blogPostsTable.publishedAt }).from(blogPostsTable),
  ]);

  const urls = [
    ...STATIC_ROUTES.map(r => urlEntry(`${SITE_URL}${r.path}`, r.priority)),
    ...caseStudies.map(c => urlEntry(`${SITE_URL}/work/${c.slug}`, "0.7")),
    ...blogPosts.map(p => urlEntry(`${SITE_URL}/blog/${p.slug}`, "0.6", p.publishedAt)),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  res.type("application/xml").send(xml);
});

export default router;