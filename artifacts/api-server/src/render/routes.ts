import { Router, type IRouter } from "express";
import { asc, desc, eq } from "drizzle-orm";
import {
  db,
  servicesTable,
  caseStudiesTable,
  reelsTable,
  postsTable,
  testimonialsTable,
  blogPostsTable,
  teamTable,
} from "@workspace/db";
import { esc, renderShell, SITE_NAME } from "./shell";

const router: IRouter = Router();

const overview = {
  headline: "Where strategy meets growth.",
  intro: "Spark Hub helps ambitious organizations turn good intent into intelligent momentum.",
  vision: "The best growth feels less like acceleration and more like alignment.",
  mission: "We integrate strategy, marketing, operations and people development into one clear way forward.",
};

// ---- Home ----
router.get("/", async (_req, res) => {
  const [services, caseStudies, testimonials] = await Promise.all([
    db.select().from(servicesTable).orderBy(asc(servicesTable.displayOrder)).limit(8),
    db.select().from(caseStudiesTable).orderBy(asc(caseStudiesTable.displayOrder)).limit(6),
    db.select().from(testimonialsTable).orderBy(asc(testimonialsTable.displayOrder)).limit(6),
  ]);

  const body = `
<h1>${esc(overview.headline)}</h1>
<p>${esc(overview.intro)}</p>
<section><h2>Services</h2><ul>
${services.map(s => `<li><a href="/services">${esc(s.title)}</a> — ${esc(s.summary)}</li>`).join("\n")}
</ul></section>
<section><h2>Selected work</h2><ul>
${caseStudies.map(c => `<li><a href="/work/${esc(c.slug)}">${esc(c.title)}</a> — ${esc(c.client)}: ${esc(c.summary)}</li>`).join("\n")}
</ul></section>
<section><h2>What clients say</h2><ul>
${testimonials.map(t => `<li>"${esc(t.quote)}" — ${esc(t.client)}</li>`).join("\n")}
</ul></section>`;

  res.type("html").send(renderShell({
    title: `${SITE_NAME} — Independent growth studio`,
    description: overview.intro,
    path: "/",
    bodyHtml: body,
  }));
});

// ---- Work (list) ----
router.get("/work", async (_req, res) => {
  const rows = await db.select().from(caseStudiesTable).orderBy(asc(caseStudiesTable.displayOrder));
  const body = `
<h1>Selected work</h1>
<ul>
${rows.map(c => `<li><a href="/work/${esc(c.slug)}">${esc(c.title)}</a> — ${esc(c.client)} (${esc(c.category)})<br>${esc(c.summary)}</li>`).join("\n")}
</ul>`;
  res.type("html").send(renderShell({
    title: `Selected work — ${SITE_NAME}`,
    description: "Case studies across strategy, marketing, creative and business growth.",
    path: "/work",
    bodyHtml: body,
  }));
});

// ---- Work detail ----
router.get("/work/:slug", async (req, res) => {
  const [row] = await db.select().from(caseStudiesTable).where(eq(caseStudiesTable.slug, req.params.slug));
  if (!row) {
    res.status(404).type("html").send(renderShell({
      title: `Not found — ${SITE_NAME}`,
      description: "This case study could not be found.",
      path: `/work/${req.params.slug}`,
      bodyHtml: "<h1>Not found</h1>",
    }));
    return;
  }
  const body = `
<h1>${esc(row.title)}</h1>
<p><strong>Client:</strong> ${esc(row.client)} · <strong>Category:</strong> ${esc(row.category)}</p>
<img src="${esc(row.imageUrl)}" alt="${esc(row.imageAlt)}" />
<p>${esc(row.summary)}</p>
<h2>Problem</h2><p>${esc(row.problem)}</p>
<h2>Solution</h2><p>${esc(row.solution)}</p>
<h2>Result</h2><p>${esc(row.result)}</p>
<p><strong>${esc(row.metric)}</strong></p>`;
  res.type("html").send(renderShell({
    title: `${row.title} — ${SITE_NAME}`,
    description: row.summary,
    path: `/work/${row.slug}`,
    image: row.imageUrl,
    bodyHtml: body,
  }));
});

// ---- Services ----
router.get("/services", async (_req, res) => {
  const rows = await db.select().from(servicesTable).orderBy(asc(servicesTable.displayOrder));
  const body = `
<h1>Services</h1>
<ul>
${rows.map(s => `<li><h2>${esc(s.title)}</h2><p>${esc(s.summary)}</p><ul>${s.details.map(d => `<li>${esc(d)}</li>`).join("")}</ul></li>`).join("\n")}
</ul>`;
  res.type("html").send(renderShell({
    title: `Services — ${SITE_NAME}`,
    description: "Strategy, marketing, creative and business services for ambitious organizations.",
    path: "/services",
    bodyHtml: body,
  }));
});

// ---- Reels ----
router.get("/reels", async (_req, res) => {
  const rows = await db.select().from(reelsTable).orderBy(asc(reelsTable.displayOrder));
  const body = `
<h1>Reels</h1>
<ul>
${rows.map(r => `<li><h2>${esc(r.title)}</h2><p>${esc(r.client)} — ${esc(r.category)}</p></li>`).join("\n")}
</ul>`;
  res.type("html").send(renderShell({
    title: `Reels — ${SITE_NAME}`,
    description: "Short-form video work and campaign stories.",
    path: "/reels",
    bodyHtml: body,
  }));
});

// ---- Posts ----
router.get("/posts", async (_req, res) => {
  const rows = await db.select().from(postsTable).orderBy(asc(postsTable.displayOrder));
  const body = `
<h1>Posts</h1>
<ul>
${rows.map(p => `<li><p>${esc(p.caption)}</p><p>${esc(p.client)} — ${esc(p.category)}</p></li>`).join("\n")}
</ul>`;
  res.type("html").send(renderShell({
    title: `Posts — ${SITE_NAME}`,
    description: "Social and campaign posts from Spark Hub Studio's work.",
    path: "/posts",
    bodyHtml: body,
  }));
});

// ---- About ----
router.get("/about", async (_req, res) => {
  const team = await db.select().from(teamTable).orderBy(asc(teamTable.id));
  const body = `
<h1>The studio</h1>
<p>${esc(overview.vision)}</p>
<p>${esc(overview.mission)}</p>
<h2>The team</h2>
<ul>
${team.map(t => `<li><h3>${esc(t.name)}</h3>${t.position ? `<p>${esc(t.position)}</p>` : ""}${t.bio ? `<p>${esc(t.bio)}</p>` : ""}</li>`).join("\n")}
</ul>`;
  res.type("html").send(renderShell({
    title: `About — ${SITE_NAME}`,
    description: overview.mission,
    path: "/about",
    bodyHtml: body,
  }));
});

// ---- Contact ----
router.get("/contact", async (_req, res) => {
  const body = `
<h1>Contact</h1>
<p>Bring us a challenge. Email us or reach out through the contact form.</p>`;
  res.type("html").send(renderShell({
    title: `Contact — ${SITE_NAME}`,
    description: "Get in touch with Spark Hub Studio.",
    path: "/contact",
    bodyHtml: body,
  }));
});

// ---- Blog (list) ----
router.get("/blog", async (_req, res) => {
  const rows = await db.select().from(blogPostsTable).orderBy(desc(blogPostsTable.publishedAt));
  const body = `
<h1>Notes</h1>
<ul>
${rows.map(p => `<li><a href="/blog/${esc(p.slug)}">${esc(p.title)}</a> — ${esc(p.publishedAt)}<br>${esc(p.excerpt)}</li>`).join("\n")}
</ul>`;
  res.type("html").send(renderShell({
    title: `Notes — ${SITE_NAME}`,
    description: "Ideas in progress from Spark Hub Studio.",
    path: "/blog",
    bodyHtml: body,
  }));
});

// ---- Blog detail ----
router.get("/blog/:slug", async (req, res) => {
  const [row] = await db.select().from(blogPostsTable).where(eq(blogPostsTable.slug, req.params.slug));
  if (!row) {
    res.status(404).type("html").send(renderShell({
      title: `Not found — ${SITE_NAME}`,
      description: "This post could not be found.",
      path: `/blog/${req.params.slug}`,
      bodyHtml: "<h1>Not found</h1>",
    }));
    return;
  }
  const body = `
<h1>${esc(row.title)}</h1>
<p><em>${esc(row.publishedAt)} · ${esc(row.category)}</em></p>
<img src="${esc(row.imageUrl)}" alt="${esc(row.imageAlt)}" />
<article>${row.body.split("\n\n").map(p => `<p>${esc(p)}</p>`).join("\n")}</article>`;
  res.type("html").send(renderShell({
    title: `${row.title} — ${SITE_NAME}`,
    description: row.excerpt,
    path: `/blog/${row.slug}`,
    image: row.imageUrl,
    bodyHtml: body,
  }));
});

export default router;