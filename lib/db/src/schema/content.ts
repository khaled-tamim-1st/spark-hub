import { createInsertSchema } from "drizzle-zod";
import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const servicesTable = pgTable("spark_services", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  summary: text("summary").notNull(),
  details: text("details").array().notNull(),
  displayOrder: integer("display_order").notNull().default(0),
});

export const caseStudiesTable = pgTable("spark_case_studies", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  client: text("client").notNull(),
  category: text("category").notNull(),
  summary: text("summary").notNull(),
  problem: text("problem").notNull(),
  solution: text("solution").notNull(),
  result: text("result").notNull(),
  metric: text("metric").notNull(),
  imageUrl: text("image_url").notNull(),
  imageAlt: text("image_alt").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
});

export const reelsTable = pgTable("spark_reels", {
  id: serial("id").primaryKey(),
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  thumbnailAlt: text("thumbnail_alt").notNull(),
  title: text("title").notNull(),
  client: text("client").notNull(),
  category: text("category").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
});

export const postsTable = pgTable("spark_posts", {
  id: serial("id").primaryKey(),
  imageUrls: text("image_urls").array().notNull(),
  imageAlt: text("image_alt").notNull(),
  caption: text("caption").notNull(),
  client: text("client").notNull(),
  category: text("category").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
});

export const testimonialsTable = pgTable("spark_testimonials", {
  id: serial("id").primaryKey(),
  client: text("client").notNull(),
  quote: text("quote").notNull(),
  person: text("person").notNull(),
  role: text("role").notNull(),
  logoText: text("logo_text").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
});

export const blogPostsTable = pgTable("spark_blog_posts", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  body: text("body").notNull(),
  category: text("category").notNull(),
  publishedAt: text("published_at").notNull(),
  imageUrl: text("image_url").notNull(),
  imageAlt: text("image_alt").notNull(),
});

export const contactLeadsTable = pgTable("spark_contact_leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  budget: text("budget").notNull(),
  service: text("service").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const teamTable = pgTable("team", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  position: text("position"),
  bio: text("bio"),
  imageUrl: text("image_url"),
});

export const clientLogosTable = pgTable("client_logos", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
});

export const podcastsTable = pgTable("spark_podcasts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  episodeNumber: text("episode_number"),
  host: text("host").notNull().default("Spark Hub"),
  guest: text("guest"),
  category: text("category").notNull(),
  duration: text("duration"),
  description: text("description"),
  audioUrl: text("audio_url").notNull(),
  spotifyUrl: text("spotify_url"),
  appleUrl: text("apple_url"),
  youtubeUrl: text("youtube_url"),
  thumbnailUrl: text("thumbnail_url").notNull(),
  thumbnailAlt: text("thumbnail_alt").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
});

export const insertServiceSchema = createInsertSchema(servicesTable).omit({ id: true });
export const insertCaseStudySchema = createInsertSchema(caseStudiesTable).omit({ id: true });
export const insertReelSchema = createInsertSchema(reelsTable).omit({ id: true });
export const insertPodcastSchema = createInsertSchema(podcastsTable).omit({ id: true });
export const insertPostSchema = createInsertSchema(postsTable).omit({ id: true });
export const insertTestimonialSchema = createInsertSchema(testimonialsTable).omit({ id: true });
export const insertBlogPostSchema = createInsertSchema(blogPostsTable).omit({ id: true });
export const insertContactLeadSchema = createInsertSchema(contactLeadsTable).omit({ id: true, createdAt: true });
export const insertTeamSchema = createInsertSchema(teamTable).omit({ id: true });
export const insertClientLogoSchema = createInsertSchema(clientLogosTable).omit({ id: true });

export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof servicesTable.$inferSelect;
export type InsertCaseStudy = z.infer<typeof insertCaseStudySchema>;
export type CaseStudy = typeof caseStudiesTable.$inferSelect;
export type InsertReel = z.infer<typeof insertReelSchema>;
export type Reel = typeof reelsTable.$inferSelect;
export type InsertPodcast = z.infer<typeof insertPodcastSchema>;
export type Podcast = typeof podcastsTable.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof postsTable.$inferSelect;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type Testimonial = typeof testimonialsTable.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPostsTable.$inferSelect;
export type InsertContactLead = z.infer<typeof insertContactLeadSchema>;
export type ContactLead = typeof contactLeadsTable.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type TeamMember = typeof teamTable.$inferSelect;
export type InsertClientLogo = z.infer<typeof insertClientLogoSchema>;
export type ClientLogo = typeof clientLogosTable.$inferSelect;