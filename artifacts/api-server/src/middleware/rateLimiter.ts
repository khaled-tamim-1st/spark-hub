import type { Request } from "express";
import rateLimit from "express-rate-limit";

/**
 * Resolves trusted client IP, prioritizing Cloudflare CF-Connecting-IP.
 */
export function getTrustedClientIp(req: Request): string {
  const cfIp = req.headers["cf-connecting-ip"];
  if (typeof cfIp === "string" && cfIp.trim()) {
    return cfIp.trim();
  }
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.trim()) {
    return xff.split(",")[0].trim();
  }
  return req.ip || req.socket.remoteAddress || "127.0.0.1";
}

/**
 * Global API rate limiter: 300 requests per 15 minutes per IP.
 */
export const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getTrustedClientIp(req),
  message: { error: "Too many requests from this IP, please try again later." },
});

/**
 * Strict public contact form rate limiter: 5 submissions per hour per IP.
 */
export const contactRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getTrustedClientIp(req),
  message: { error: "Too many contact submissions. Please try again later or reach out via email directly." },
});
