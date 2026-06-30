import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { db } from "./prisma";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSession,
  verifySession,
} from "./session";

// Re-export edge-safe helpers so existing imports from "@/lib/auth" keep working.
export { SESSION_COOKIE, SESSION_MAX_AGE, createSession, verifySession };

export function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/** Reads the session cookie and returns the decoded payload (or null). */
export async function getSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return await verifySession(token);
}

/**
 * Returns the authenticated user's Mongo id, or null.
 * Drop-in replacement for Clerk's `const { userId } = await auth()`.
 */
export async function getAuthUserId() {
  const session = await getSession();
  return session?.id ?? null;
}

/** Returns the full Prisma user document for the current session (or null). */
export async function getCurrentDbUser(include) {
  const userId = await getAuthUserId();
  if (!userId) return null;
  try {
    return await db.user.findUnique({
      where: { id: userId },
      ...(include ? { include } : {}),
    });
  } catch (error) {
    console.error("getCurrentDbUser failed:", error.message);
    return null;
  }
}
