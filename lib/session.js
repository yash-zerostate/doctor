// Edge-safe session helpers (jose only — no Prisma, no Node APIs).
// Safe to import from middleware/proxy.js which runs on the Edge runtime.
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-insecure-secret-change-me"
);

export const SESSION_COOKIE = "doc_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/** Sign a session JWT. Payload carries the Mongo user id + basic profile. */
export async function createSession(user) {
  return await new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secret);
}

/** Verify a session JWT. Returns the payload or null. */
export async function verifySession(token) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}
