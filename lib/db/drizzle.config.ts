import { defineConfig } from "drizzle-kit";
import path from "path";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export default defineConfig({
  schema: "./src/schema/index.ts", // استخدم مسار نسبي بسيط
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  // أضف هذه الخيارات للتأكد من قراءة الملفات
  out: "./drizzle",
  verbose: true,
  strict: true,
});