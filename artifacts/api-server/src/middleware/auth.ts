import { getAuth } from "@clerk/express";
import type { RequestHandler } from "express";

/**
 * Parses ADMIN_USER_IDS environment variable into a lookup Set.
 */
export function getAdminUserIds(): Set<string> {
  const raw = process.env.ADMIN_USER_IDS ?? "";
  return new Set(
    raw
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
  );
}

/**
 * Checks if the authenticated session has verified admin privileges.
 * 1. Checks if auth.userId is present in ADMIN_USER_IDS.
 * 2. Checks if Clerk sessionClaims contain role === 'admin'.
 */
export function isAuthorizedAdmin(auth: ReturnType<typeof getAuth>): boolean {
  if (!auth?.userId) return false;

  const adminUserIds = getAdminUserIds();
  if (adminUserIds.has(auth.userId)) {
    return true;
  }

  const claims = (auth.sessionClaims ?? {}) as Record<string, unknown>;
  const role =
    claims.role ||
    (claims.metadata as Record<string, unknown> | undefined)?.role ||
    (claims.publicMetadata as Record<string, unknown> | undefined)?.role ||
    (claims.public_metadata as Record<string, unknown> | undefined)?.role;

  if (typeof role === "string" && role.toLowerCase() === "admin") {
    return true;
  }

  return false;
}

/**
 * Middleware requiring authenticated administrator access.
 * - 401 Unauthorized if unauthenticated.
 * - 403 Forbidden if authenticated as a normal user without admin privileges.
 */
export const requireAuth: RequestHandler = (req, res, next) => {
  const auth = getAuth(req);

  if (!auth?.userId) {
    res.status(401).json({ error: "Unauthorized: Authentication required" });
    return;
  }

  if (!isAuthorizedAdmin(auth)) {
    res.status(403).json({ error: "Forbidden: Admin privileges required" });
    return;
  }

  next();
};