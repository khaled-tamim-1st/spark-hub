import { Router, type IRouter, type Response } from "express";
import { asc, desc, eq } from "drizzle-orm";
import { db, servicesTable, caseStudiesTable, reelsTable, podcastsTable, postsTable, testimonialsTable, blogPostsTable, contactLeadsTable, teamTable, clientLogosTable } from "@workspace/db";
import {
  CreateCaseStudyBody,
  CreateCaseStudyResponse,
  CreateContactLeadBody,
  CreateContactLeadResponse,
  CreatePostBody,
  CreatePostResponse,
  CreateReelBody,
  CreateReelResponse,
  CreateServiceBody,
  CreateServiceResponse,
  CreateTestimonialBody,
  CreateTestimonialResponse,
  DeleteCaseStudyParams,
  DeletePostParams,
  DeleteReelParams,
  DeleteServiceParams,
  DeleteTestimonialParams,
  GetBlogPostParams,
  GetBlogPostResponse,
  GetCaseStudyResponse,
  GetOverviewResponse,
  GetCaseStudyParams,
  ListBlogPostsResponse,
  ListCaseStudiesResponse,
  ListPostsResponse,
  ListReelsResponse,
  ListServicesResponse,
  ListTestimonialsResponse,
  UpdateCaseStudyBody,
  UpdateCaseStudyParams,
  UpdateCaseStudyResponse,
  UpdatePostBody,
  UpdatePostParams,
  UpdatePostResponse,
  UpdateReelBody,
  UpdateReelParams,
  UpdateReelResponse,
  UpdateServiceBody,
  UpdateServiceParams,
  UpdateServiceResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middleware/auth";

const router: IRouter = Router();

const overview = {
  eyebrow: "Independent growth studio / Egypt + remote",
  headline: "Where strategy meets growth.",
  intro: "Spark Hub helps ambitious organizations turn good intent into intelligent momentum.",
  vision: "Growth is not a department.",
  mission: "It is the result of clear thinking, aligned teams and work that earns attention. We bring the disciplines together so the whole organization can move with intent.",
  founderName: "Dr. Randa Elbanna",
  founderRole: "Founder & Managing Director",
  founderBio: "Dr. Randa Elbanna brings an operator’s eye and a strategist’s curiosity to every room. Her work is grounded in one belief: progress becomes possible when people can see the path clearly.",
  contactEmail: "info@sparkhubeg.com",
  contactPhone: "+20 100 071 5565",
  contactOffice: "Cairo, Egypt",
};

function invalid(res: Response, message: string): void {
  res.status(400).json({ error: message });
}

router.get("/overview", (_req, res): void => {
  res.json(GetOverviewResponse.parse(overview));
});

router.get("/services", async (_req, res): Promise<void> => {
  const rows = await db.select().from(servicesTable).orderBy(asc(servicesTable.displayOrder), asc(servicesTable.id));
  res.json(rows);
});

router.post("/services", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateServiceBody.safeParse(req.body);
  if (!parsed.success) {
    invalid(res, parsed.error.message);
    return;
  }
  const [row] = await db.insert(servicesTable).values(parsed.data).returning();
  res.status(201).json(CreateServiceResponse.parse(row));
});

router.patch("/services/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateServiceParams.safeParse(req.params);
  const body = UpdateServiceBody.safeParse(req.body);
  if (!params.success || !body.success) {
    invalid(res, params.success ? (body.success ? "" : body.error.message) : params.error.message);
    return;
  }
  const [row] = await db.update(servicesTable).set(body.data).where(eq(servicesTable.id, params.data.id)).returning();
  if (!row) {
    res.status(404).json({ error: "Service not found" });
    return;
  }
  res.json(UpdateServiceResponse.parse(row));
});

router.delete("/services/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteServiceParams.safeParse(req.params);
  if (!params.success) {
    invalid(res, params.error.message);
    return;
  }
  const [row] = await db.delete(servicesTable).where(eq(servicesTable.id, params.data.id)).returning();
  if (!row) {
    res.status(404).json({ error: "Service not found" });
    return;
  }
  res.sendStatus(204);
});

router.get("/case-studies", async (_req, res): Promise<void> => {
  const rows = await db.select().from(caseStudiesTable).orderBy(asc(caseStudiesTable.displayOrder), asc(caseStudiesTable.id));
  res.json(rows);
});

router.get("/case-studies/:id", async (req, res): Promise<void> => {
  const params = GetCaseStudyParams.safeParse(req.params);
  if (!params.success) {
    invalid(res, params.error.message);
    return;
  }
  const [row] = await db.select().from(caseStudiesTable).where(eq(caseStudiesTable.slug, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Case study not found" });
    return;
  }
  res.json(row);
});

router.post("/case-studies", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateCaseStudyBody.safeParse(req.body);
  if (!parsed.success) {
    invalid(res, parsed.error.message);
    return;
  }
  const [row] = await db.insert(caseStudiesTable).values(parsed.data).returning();
  res.status(201).json(CreateCaseStudyResponse.parse(row));
});

router.patch("/case-studies/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateCaseStudyParams.safeParse(req.params);
  const body = UpdateCaseStudyBody.safeParse(req.body);
  if (!params.success || !body.success) {
    invalid(res, params.success ? (body.success ? "" : body.error.message) : params.error.message);
    return;
  }
  const [row] = await db.update(caseStudiesTable).set(body.data).where(eq(caseStudiesTable.id, params.data.id)).returning();
  if (!row) {
    res.status(404).json({ error: "Case study not found" });
    return;
  }
  res.json(UpdateCaseStudyResponse.parse(row));
});

router.delete("/case-studies/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteCaseStudyParams.safeParse(req.params);
  if (!params.success) {
    invalid(res, params.error.message);
    return;
  }
  const [row] = await db.delete(caseStudiesTable).where(eq(caseStudiesTable.id, params.data.id)).returning();
  if (!row) {
    res.status(404).json({ error: "Case study not found" });
    return;
  }
  res.sendStatus(204);
});

router.get("/reels", async (_req, res): Promise<void> => {
  const rows = await db.select().from(reelsTable).orderBy(asc(reelsTable.displayOrder), asc(reelsTable.id));
  res.json(rows);
});

router.post("/reels", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateReelBody.safeParse(req.body);
  if (!parsed.success) {
    invalid(res, parsed.error.message);
    return;
  }
  const [row] = await db.insert(reelsTable).values(parsed.data).returning();
  res.status(201).json(CreateReelResponse.parse(row));
});

router.patch("/reels/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateReelParams.safeParse(req.params);
  const body = UpdateReelBody.safeParse(req.body);
  if (!params.success || !body.success) {
    invalid(res, params.success ? (body.success ? "" : body.error.message) : params.error.message);
    return;
  }
  const [row] = await db.update(reelsTable).set(body.data).where(eq(reelsTable.id, params.data.id)).returning();
  if (!row) {
    res.status(404).json({ error: "Reel not found" });
    return;
  }
  res.json(UpdateReelResponse.parse(row));
});

router.delete("/reels/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteReelParams.safeParse(req.params);
  if (!params.success) {
    invalid(res, params.error.message);
    return;
  }
  const [row] = await db.delete(reelsTable).where(eq(reelsTable.id, params.data.id)).returning();
  if (!row) {
    res.status(404).json({ error: "Reel not found" });
    return;
  }
  res.sendStatus(204);
});

function extractYoutubeId(url?: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') {
      return parsed.pathname.replace(/^\/+/, '').split('/')[0] || null;
    }
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const v = parsed.searchParams.get('v');
      if (v) return v;
      const parts = parsed.pathname.split('/').filter(Boolean);
      const embedIndex = parts.indexOf('embed');
      if (embedIndex >= 0 && parts[embedIndex + 1]) return parts[embedIndex + 1];
      const shortsIndex = parts.indexOf('shorts');
      if (shortsIndex >= 0 && parts[shortsIndex + 1]) return parts[shortsIndex + 1];
    }
  } catch {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))([\w-]{11})/);
    if (match?.[1]) return match[1];
  }
  return null;
}

function resolveServerThumbnail(thumbnailUrl?: string | null, ...fallbackUrls: (string | null | undefined)[]): string {
  if (thumbnailUrl && thumbnailUrl.trim().length > 0) {
    return thumbnailUrl.trim();
  }
  for (const fallback of fallbackUrls) {
    if (!fallback) continue;
    const ytId = extractYoutubeId(fallback);
    if (ytId) {
      return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    }
  }
  return '/media/spark-reels.png';
}

router.get("/podcasts", async (_req, res): Promise<void> => {
  const rows = await db.select().from(podcastsTable).orderBy(asc(podcastsTable.displayOrder), asc(podcastsTable.id));
  res.json(rows);
});

router.post("/podcasts", requireAuth, async (req, res): Promise<void> => {
  const { title, episodeNumber, host, guest, category, duration, description, audioUrl, spotifyUrl, appleUrl, youtubeUrl, thumbnailUrl, thumbnailAlt, displayOrder } = req.body ?? {};
  if (!title || !category || !audioUrl) {
    invalid(res, "title, category, and audioUrl are required");
    return;
  }
  const finalThumbnail = resolveServerThumbnail(thumbnailUrl, audioUrl, youtubeUrl);
  const [row] = await db
    .insert(podcastsTable)
    .values({
      title,
      episodeNumber: episodeNumber || null,
      host: host || "Spark Hub",
      guest: guest || null,
      category,
      duration: duration || null,
      description: description || null,
      audioUrl,
      spotifyUrl: spotifyUrl || null,
      appleUrl: appleUrl || null,
      youtubeUrl: youtubeUrl || null,
      thumbnailUrl: finalThumbnail,
      thumbnailAlt: thumbnailAlt || title,
      displayOrder: Number(displayOrder) || 0,
    })
    .returning();
  res.status(201).json(row);
});

router.patch("/podcasts/:id", requireAuth, async (req, res): Promise<void> => {
  const { title, episodeNumber, host, guest, category, duration, description, audioUrl, spotifyUrl, appleUrl, youtubeUrl, thumbnailUrl, thumbnailAlt, displayOrder } = req.body ?? {};
  if (!title || !category || !audioUrl) {
    invalid(res, "title, category, and audioUrl are required");
    return;
  }
  const finalThumbnail = resolveServerThumbnail(thumbnailUrl, audioUrl, youtubeUrl);
  const [row] = await db
    .update(podcastsTable)
    .set({
      title,
      episodeNumber: episodeNumber || null,
      host: host || "Spark Hub",
      guest: guest || null,
      category,
      duration: duration || null,
      description: description || null,
      audioUrl,
      spotifyUrl: spotifyUrl || null,
      appleUrl: appleUrl || null,
      youtubeUrl: youtubeUrl || null,
      thumbnailUrl: finalThumbnail,
      thumbnailAlt: thumbnailAlt || title,
      displayOrder: Number(displayOrder) || 0,
    })
    .where(eq(podcastsTable.id, Number(req.params.id)))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Podcast not found" });
    return;
  }
  res.json(row);
});

router.delete("/podcasts/:id", requireAuth, async (req, res): Promise<void> => {
  const [row] = await db.delete(podcastsTable).where(eq(podcastsTable.id, Number(req.params.id))).returning();
  if (!row) {
    res.status(404).json({ error: "Podcast not found" });
    return;
  }
  res.sendStatus(204);
});

router.get("/posts", async (_req, res): Promise<void> => {
  const rows = await db.select().from(postsTable).orderBy(asc(postsTable.displayOrder), asc(postsTable.id));
  res.json(rows);
});

router.post("/posts", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreatePostBody.safeParse(req.body);
  if (!parsed.success) {
    invalid(res, parsed.error.message);
    return;
  }
  const [row] = await db.insert(postsTable).values(parsed.data).returning();
  res.status(201).json(CreatePostResponse.parse(row));
});

router.patch("/posts/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdatePostParams.safeParse(req.params);
  const body = UpdatePostBody.safeParse(req.body);
  if (!params.success || !body.success) {
    invalid(res, params.success ? (body.success ? "" : body.error.message) : params.error.message);
    return;
  }
  const [row] = await db.update(postsTable).set(body.data).where(eq(postsTable.id, params.data.id)).returning();
  if (!row) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  res.json(UpdatePostResponse.parse(row));
});

router.delete("/posts/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeletePostParams.safeParse(req.params);
  if (!params.success) {
    invalid(res, params.error.message);
    return;
  }
  const [row] = await db.delete(postsTable).where(eq(postsTable.id, params.data.id)).returning();
  if (!row) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  res.sendStatus(204);
});

router.get("/testimonials", async (_req, res): Promise<void> => {
  const rows = await db.select().from(testimonialsTable).orderBy(asc(testimonialsTable.displayOrder), asc(testimonialsTable.id));
  res.json(rows);
});

router.post("/testimonials", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateTestimonialBody.safeParse(req.body);
  if (!parsed.success) {
    invalid(res, parsed.error.message);
    return;
  }
  const [row] = await db.insert(testimonialsTable).values(parsed.data).returning();
  res.status(201).json(CreateTestimonialResponse.parse(row));
});

router.delete("/testimonials/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteTestimonialParams.safeParse(req.params);
  if (!params.success) {
    invalid(res, params.error.message);
    return;
  }
  const [row] = await db.delete(testimonialsTable).where(eq(testimonialsTable.id, params.data.id)).returning();
  if (!row) {
    res.status(404).json({ error: "Testimonial not found" });
    return;
  }
  res.sendStatus(204);
});

router.get("/blog", async (_req, res): Promise<void> => {
  const rows = await db.select().from(blogPostsTable).orderBy(asc(blogPostsTable.publishedAt), asc(blogPostsTable.id));
  res.json(rows);
});

router.get("/blog/:slug", async (req, res): Promise<void> => {
  const params = GetBlogPostParams.safeParse(req.params);
  if (!params.success) {
    invalid(res, params.error.message);
    return;
  }
  const [row] = await db.select().from(blogPostsTable).where(eq(blogPostsTable.slug, params.data.slug));
  if (!row) {
    res.status(404).json({ error: "Blog post not found" });
    return;
  }
  res.json(row);
});

router.post("/blog", requireAuth, async (req, res): Promise<void> => {
  const { slug, title, excerpt, body, category, publishedAt, imageUrl, imageAlt } = req.body ?? {};
  if (!slug || !title || !excerpt || !body || !category || !publishedAt || !imageUrl || !imageAlt) {
    invalid(res, "slug, title, excerpt, body, category, publishedAt, imageUrl and imageAlt are required");
    return;
  }
  const [row] = await db
    .insert(blogPostsTable)
    .values({ slug, title, excerpt, body, category, publishedAt, imageUrl, imageAlt })
    .returning();
  res.status(201).json(row);
});

router.patch("/blog/:id", requireAuth, async (req, res): Promise<void> => {
  const { slug, title, excerpt, body, category, publishedAt, imageUrl, imageAlt } = req.body ?? {};
  if (!slug || !title || !excerpt || !body || !category || !publishedAt || !imageUrl || !imageAlt) {
    invalid(res, "slug, title, excerpt, body, category, publishedAt, imageUrl and imageAlt are required");
    return;
  }
  const [row] = await db
    .update(blogPostsTable)
    .set({ slug, title, excerpt, body, category, publishedAt, imageUrl, imageAlt })
    .where(eq(blogPostsTable.id, Number(req.params.id)))
    .returning();
  res.json(row);
});

router.delete("/blog/:id", requireAuth, async (req, res): Promise<void> => {
  await db.delete(blogPostsTable).where(eq(blogPostsTable.id, Number(req.params.id)));
  res.status(204).send();
});

router.get("/team", async (_req, res): Promise<void> => {
  const rows = await db.select().from(teamTable).orderBy(asc(teamTable.displayOrder), asc(teamTable.id));
  res.json(rows);
});

router.post("/team", requireAuth, async (req, res): Promise<void> => {
  const { name, position, bio, imageUrl, displayOrder, linkedinUrl, email } = req.body ?? {};
  if (!name || typeof name !== "string") {
    invalid(res, "name is required");
    return;
  }
  const [row] = await db
    .insert(teamTable)
    .values({
      name,
      position: position || null,
      bio: bio || null,
      imageUrl: imageUrl || null,
      displayOrder: typeof displayOrder === "number" ? displayOrder : 0,
      linkedinUrl: linkedinUrl || null,
      email: email || null,
    })
    .returning();
  res.status(201).json(row);
});

router.patch("/team/:id", requireAuth, async (req, res): Promise<void> => {
  const { name, position, bio, imageUrl, displayOrder, linkedinUrl, email } = req.body ?? {};
  if (!name || typeof name !== "string") {
    invalid(res, "name is required");
    return;
  }
  const [row] = await db
    .update(teamTable)
    .set({
      name,
      position: position || null,
      bio: bio || null,
      imageUrl: imageUrl || null,
      displayOrder: typeof displayOrder === "number" ? displayOrder : 0,
      linkedinUrl: linkedinUrl || null,
      email: email || null,
    })
    .where(eq(teamTable.id, Number(req.params.id)))
    .returning();
  res.json(row);
});

router.put("/team/:id", requireAuth, async (req, res): Promise<void> => {
  const { name, position, bio, imageUrl, displayOrder, linkedinUrl, email } = req.body ?? {};
  if (!name || typeof name !== "string") {
    invalid(res, "name is required");
    return;
  }
  const [row] = await db
    .update(teamTable)
    .set({
      name,
      position: position || null,
      bio: bio || null,
      imageUrl: imageUrl || null,
      displayOrder: typeof displayOrder === "number" ? displayOrder : 0,
      linkedinUrl: linkedinUrl || null,
      email: email || null,
    })
    .where(eq(teamTable.id, Number(req.params.id)))
    .returning();
  res.json(row);
});

router.delete("/team/:id", requireAuth, async (req, res): Promise<void> => {
  await db.delete(teamTable).where(eq(teamTable.id, Number(req.params.id)));
  res.status(204).send();
});

router.get("/client-logos", async (_req, res): Promise<void> => {
  const rows = await db.select().from(clientLogosTable).orderBy(asc(clientLogosTable.displayOrder), asc(clientLogosTable.id));
  res.json(rows);
});

router.post("/client-logos", requireAuth, async (req, res): Promise<void> => {
  const { name, imageUrl, displayOrder } = req.body ?? {};
  if (!name || !imageUrl) {
    invalid(res, "name and imageUrl are required");
    return;
  }
  const [row] = await db
    .insert(clientLogosTable)
    .values({ name, imageUrl, displayOrder: Number(displayOrder) || 0 })
    .returning();
  res.status(201).json(row);
});

router.patch("/client-logos/:id", requireAuth, async (req, res): Promise<void> => {
  const { name, imageUrl, displayOrder } = req.body ?? {};
  if (!name || !imageUrl) {
    invalid(res, "name and imageUrl are required");
    return;
  }
  const [row] = await db
    .update(clientLogosTable)
    .set({ name, imageUrl, displayOrder: Number(displayOrder) || 0 })
    .where(eq(clientLogosTable.id, Number(req.params.id)))
    .returning();
  res.json(row);
});

router.delete("/client-logos/:id", requireAuth, async (req, res): Promise<void> => {
  await db.delete(clientLogosTable).where(eq(clientLogosTable.id, Number(req.params.id)));
  res.status(204).send();
});

router.post("/contact", async (req, res): Promise<void> => {
  const parsed = CreateContactLeadBody.safeParse(req.body);
  if (!parsed.success) {
    invalid(res, parsed.error.message);
    return;
  }
  const [row] = await db.insert(contactLeadsTable).values(parsed.data).returning();
  res.status(201).json(CreateContactLeadResponse.parse(row));
});

router.get("/contact", requireAuth, async (_req, res): Promise<void> => {
  const rows = await db.select().from(contactLeadsTable).orderBy(desc(contactLeadsTable.createdAt));
  res.json(rows);
});

router.delete("/contact/:id", requireAuth, async (req, res): Promise<void> => {
  await db.delete(contactLeadsTable).where(eq(contactLeadsTable.id, Number(req.params.id)));
  res.status(204).send();
});

export default router;