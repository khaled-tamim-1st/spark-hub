import { Router, type IRouter } from "express";
import { asc, desc, eq } from "drizzle-orm";
import {
  db,
  servicesTable,
  reelsTable,
  podcastsTable,
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

const overviewAr = {
  headline: "حيث تلتقي الاستراتيجية بالنمو.",
  intro: "استوديو مستقل لاستراتيجيات ونمو الأعمال / مصر والعالم",
  vision: "أفضل نمو للأعمال لا يبدو كتسارع عشوائي، بل هو اتساق وتناغم كامل بين أركان المؤسسة.",
  mission: "ندمج الفكر الاستراتيجي، منظومة التسويق، العمليات التشغيلية، وتطوير الكفاءات البشرية في مسار عملي واحد ومستدام.",
};

function getLocaleInfo(urlPath: string) {
  const isAr = urlPath === "/ar" || urlPath.startsWith("/ar/");
  return {
    isAr,
    lang: isAr ? "ar" : "en",
    dir: isAr ? "rtl" : "ltr",
    prefix: isAr ? "/ar" : "",
  };
}

// ---- Home ----
router.get(["/", "/ar", "/en"], async (req, res) => {
  const { isAr, lang, dir, prefix } = getLocaleInfo(req.path);
  const [services, testimonials] = await Promise.all([
    db.select().from(servicesTable).orderBy(asc(servicesTable.displayOrder)).limit(8),
    db.select().from(testimonialsTable).orderBy(asc(testimonialsTable.displayOrder)).limit(6),
  ]);

  const body = isAr
    ? `
<h1>${esc(overviewAr.headline)}</h1>
<p>${esc(overviewAr.intro)}</p>
<p><strong>رؤيتنا:</strong> ${esc(overviewAr.vision)}</p>
<section><h2>الخدمات الاستشارية</h2><ul>
${services.map(s => `<li><a href="${prefix}/services">${esc(s.title)}</a> — ${esc(s.summary)}</li>`).join("\n")}
</ul></section>
<section><h2>آراء الشركاء</h2><ul>
${testimonials.map(t => `<li>"${esc(t.quote)}" — ${esc(t.client)}</li>`).join("\n")}
</ul></section>`
    : `
<h1>${esc(overview.headline)}</h1>
<p>${esc(overview.intro)}</p>
<section><h2>Services</h2><ul>
${services.map(s => `<li><a href="/services">${esc(s.title)}</a> — ${esc(s.summary)}</li>`).join("\n")}
</ul></section>
<section><h2>What clients say</h2><ul>
${testimonials.map(t => `<li>"${esc(t.quote)}" — ${esc(t.client)}</li>`).join("\n")}
</ul></section>`;

  res.type("html").send(renderShell({
    title: isAr ? `سبارك هب ستوديو — حيث تلتقي الاستراتيجية بالنمو` : `${SITE_NAME} — Independent growth studio`,
    description: isAr ? overviewAr.mission : overview.intro,
    path: isAr ? "/ar" : "/",
    bodyHtml: body,
    lang,
    dir,
  }));
});

// ---- Work (redirected to services) ----
router.get(["/work", "/ar/work", "/en/work"], (req, res) => {
  const { isAr } = getLocaleInfo(req.path);
  res.redirect(301, isAr ? "/ar/services" : "/services");
});

router.get(["/work/:slug", "/ar/work/:slug", "/en/work/:slug"], (req, res) => {
  const { isAr } = getLocaleInfo(req.path);
  res.redirect(301, isAr ? "/ar/services" : "/services");
});

// ---- Services ----
router.get(["/services", "/ar/services", "/en/services"], async (req, res) => {
  const { isAr, lang, dir } = getLocaleInfo(req.path);
  const rows = await db.select().from(servicesTable).orderBy(asc(servicesTable.displayOrder));
  const body = isAr
    ? `
<h1>الخدمات الاستشارية</h1>
<ul>
${rows.map(s => `<li><h2>${esc(s.title)}</h2><p>${esc(s.summary)}</p><ul>${s.details.map(d => `<li>${esc(d)}</li>`).join("")}</ul></li>`).join("\n")}
</ul>`
    : `
<h1>Services</h1>
<ul>
${rows.map(s => `<li><h2>${esc(s.title)}</h2><p>${esc(s.summary)}</p><ul>${s.details.map(d => `<li>${esc(d)}</li>`).join("")}</ul></li>`).join("\n")}
</ul>`;

  res.type("html").send(renderShell({
    title: isAr ? `الخدمات الاستشارية — سبارك هب ستوديو` : `Services — ${SITE_NAME}`,
    description: isAr ? "الاستراتيجية المؤسسية، إدارة التسويق والنمو، الهوية البصرية، والتدريب التنفيذي." : "Strategy, marketing, creative and business services for ambitious organizations.",
    path: isAr ? "/ar/services" : "/services",
    bodyHtml: body,
    lang,
    dir,
  }));
});

// ---- Reels ----
router.get(["/reels", "/ar/reels", "/en/reels"], async (req, res) => {
  const { isAr, lang, dir } = getLocaleInfo(req.path);
  const rows = await db.select().from(reelsTable).orderBy(asc(reelsTable.displayOrder));
  const body = `
<h1>${isAr ? "ريلز وميديا" : "Reels"}</h1>
<ul>
${rows.map(r => `<li><h2>${esc(r.title)}</h2><p>${esc(r.client)} — ${esc(r.category)}</p></li>`).join("\n")}
</ul>`;
  res.type("html").send(renderShell({
    title: isAr ? `ريلز وميديا — سبارك هب ستوديو` : `Reels — ${SITE_NAME}`,
    description: isAr ? "قصص سينمائية ومحتوى بصري متفرد من استوديو سبارك هب." : "Short-form video work and campaign stories.",
    path: isAr ? "/ar/reels" : "/reels",
    bodyHtml: body,
    lang,
    dir,
  }));
});

// ---- Podcasts ----
router.get(["/podcasts", "/ar/podcasts", "/en/podcasts"], async (req, res) => {
  const { isAr, lang, dir } = getLocaleInfo(req.path);
  const rows = await db.select().from(podcastsTable).orderBy(asc(podcastsTable.displayOrder), asc(podcastsTable.id));
  const body = `
<h1>${isAr ? "بودكاست وحوارات" : "Podcasts & Audio"}</h1>
<p>${isAr ? "حوارات استراتيجية معمقة في بناء العلامات التجارية، القيادة، والنمو المستدام." : "Deep conversations on brand strategy, leadership, and sustainable growth."}</p>
<ul>
${rows.map(p => `<li><h2>${esc(p.title)}</h2><p>${p.episodeNumber ? esc(p.episodeNumber) + " • " : ""}${esc(p.host)}${p.guest ? " with " + esc(p.guest) : ""} — ${esc(p.category)} (${esc(p.duration || "")})</p><p>${esc(p.description || "")}</p></li>`).join("\n")}
</ul>`;
  res.type("html").send(renderShell({
    title: isAr ? `بودكاست وحوارات — سبارك هب ستوديو` : `Podcasts & Conversations — ${SITE_NAME}`,
    description: isAr ? "حوارات استراتيجية معمقة في بناء العلامات التجارية، القيادة، والنمو المستدام." : "Deep conversations on brand strategy, leadership, and sustainable growth from Spark Hub Studio.",
    path: isAr ? "/ar/podcasts" : "/podcasts",
    bodyHtml: body,
    lang,
    dir,
  }));
});

// ---- Posts ----
router.get(["/posts", "/ar/posts", "/en/posts"], async (req, res) => {
  const { isAr, lang, dir } = getLocaleInfo(req.path);
  const rows = await db.select().from(postsTable).orderBy(asc(postsTable.displayOrder));
  const body = `
<h1>${isAr ? "سجل الأعمال والحملات" : "Posts"}</h1>
<ul>
${rows.map(p => `<li><p>${esc(p.caption)}</p><p>${esc(p.client)} — ${esc(p.category)}</p></li>`).join("\n")}
</ul>`;
  res.type("html").send(renderShell({
    title: isAr ? `سجل الأعمال والحملات — سبارك هب ستوديو` : `Posts — ${SITE_NAME}`,
    description: isAr ? "تشكيلة مختارة من التصاميم والحملات الإعلانية والهويات الرقمية." : "Social and campaign posts from Spark Hub Studio's work.",
    path: isAr ? "/ar/posts" : "/posts",
    bodyHtml: body,
    lang,
    dir,
  }));
});

// ---- About ----
router.get(["/about", "/ar/about", "/en/about"], async (req, res) => {
  const { isAr, lang, dir } = getLocaleInfo(req.path);
  const team = await db.select().from(teamTable).orderBy(asc(teamTable.id));
  const body = isAr
    ? `
<h1>عن الاستوديو</h1>
<p>${esc(overviewAr.vision)}</p>
<p>${esc(overviewAr.mission)}</p>
<h2>فريق العمل والقيادة</h2>
<ul>
${team.map(t => `<li><h3>${esc(t.name)}</h3>${t.position ? `<p>${esc(t.position)}</p>` : ""}${t.bio ? `<p>${esc(t.bio)}</p>` : ""}</li>`).join("\n")}
</ul>`
    : `
<h1>The studio</h1>
<p>${esc(overview.vision)}</p>
<p>${esc(overview.mission)}</p>
<h2>The team</h2>
<ul>
${team.map(t => `<li><h3>${esc(t.name)}</h3>${t.position ? `<p>${esc(t.position)}</p>` : ""}${t.bio ? `<p>${esc(t.bio)}</p>` : ""}</li>`).join("\n")}
</ul>`;

  res.type("html").send(renderShell({
    title: isAr ? `عن الاستوديو — سبارك هب ستوديو` : `About — ${SITE_NAME}`,
    description: isAr ? overviewAr.mission : overview.mission,
    path: isAr ? "/ar/about" : "/about",
    bodyHtml: body,
    lang,
    dir,
  }));
});

// ---- Contact ----
router.get(["/contact", "/ar/contact", "/en/contact"], async (req, res) => {
  const { isAr, lang, dir } = getLocaleInfo(req.path);
  const body = isAr
    ? `
<h1>جاهز لتحويل الاستراتيجية إلى نمو؟ — لنبدأ محادثة عمل</h1>
<p>أخبرنا بما ترغب في تغييره، أو التحدي الذي يواجهك، أو ما تخطط لبنائه معاً.</p>`
    : `
<h1>Contact</h1>
<p>Bring us a challenge. Email us or reach out through the contact form.</p>`;

  res.type("html").send(renderShell({
    title: isAr ? `تواصل معنا — سبارك هب ستوديو` : `Contact — ${SITE_NAME}`,
    description: isAr ? "جاهز لتحويل الاستراتيجية إلى نمو؟ — لنبدأ محادثة عمل" : "Get in touch with Spark Hub Studio.",
    path: isAr ? "/ar/contact" : "/contact",
    bodyHtml: body,
    lang,
    dir,
  }));
});

// ---- Blog (list) ----
router.get(["/blog", "/ar/blog", "/en/blog"], async (req, res) => {
  const { isAr, lang, dir, prefix } = getLocaleInfo(req.path);
  const rows = await db.select().from(blogPostsTable).orderBy(desc(blogPostsTable.publishedAt));
  const body = `
<h1>${isAr ? "رؤى وأفكار استراتيجية" : "Notes"}</h1>
<ul>
${rows.map(p => `<li><a href="${prefix}/blog/${esc(p.slug)}">${esc(p.title)}</a> — ${esc(p.publishedAt)}<br>${esc(p.excerpt)}</li>`).join("\n")}
</ul>`;
  res.type("html").send(renderShell({
    title: isAr ? `رؤى وأفكار — سبارك هب ستوديو` : `Notes — ${SITE_NAME}`,
    description: isAr ? "تأملات ورؤى استراتيجية من ملتقى التخطيط، التسويق، وصناعة الأثر." : "Ideas in progress from Spark Hub Studio.",
    path: isAr ? "/ar/blog" : "/blog",
    bodyHtml: body,
    lang,
    dir,
  }));
});

// ---- Blog detail ----
router.get(["/blog/:slug", "/ar/blog/:slug", "/en/blog/:slug"], async (req, res) => {
  const { isAr, lang, dir } = getLocaleInfo(req.path);
  const slug = String(req.params.slug || "");
  const [row] = await db.select().from(blogPostsTable).where(eq(blogPostsTable.slug, slug));
  if (!row) {
    res.status(404).type("html").send(renderShell({
      title: isAr ? `غير موجود — سبارك هب ستوديو` : `Not found — ${SITE_NAME}`,
      description: isAr ? "المقال المطلوب غير موجود." : "This post could not be found.",
      path: isAr ? `/ar/blog/${slug}` : `/blog/${slug}`,
      bodyHtml: `<h1>${isAr ? "الصفحة غير موجودة" : "Not found"}</h1>`,
      lang,
      dir,
    }));
    return;
  }
  const body = `
<h1>${esc(row.title)}</h1>
<p><em>${esc(row.publishedAt)} · ${esc(row.category)}</em></p>
<img src="${esc(row.imageUrl)}" alt="${esc(row.imageAlt)}" />
<article>${row.body.split("\n\n").map(p => `<p>${esc(p)}</p>`).join("\n")}</article>`;
  res.type("html").send(renderShell({
    title: `${row.title} — ${isAr ? "سبارك هب ستوديو" : SITE_NAME}`,
    description: row.excerpt,
    path: isAr ? `/ar/blog/${row.slug}` : `/blog/${row.slug}`,
    image: row.imageUrl,
    bodyHtml: body,
    lang,
    dir,
  }));
});

export default router;