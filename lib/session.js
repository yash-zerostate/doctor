// Edge-safe session helpers (jose only — no Prisma, no Node APIs).
// Safe to import from middleware/proxy.js which runs on the Edge runtime.
//
// Uses RS256 (asymmetric) when JWT_PRIVATE_KEY / JWT_PUBLIC_KEY are set:
//   - private key SIGNS tokens (login/signup)
//   - public key VERIFIES tokens (everywhere, incl. middleware + other services)
// Falls back to HS256 with AUTH_SECRET when the RSA keys are absent.
import { SignJWT, jwtVerify, importPKCS8, importSPKI } from "jose";

export const SESSION_COOKIE = "doc_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const PRIVATE_PEM = decodePem(process.env.JWT_PRIVATE_KEY);
const PUBLIC_PEM = decodePem(process.env.JWT_PUBLIC_KEY);
const USE_RSA = Boolean(PRIVATE_PEM && PUBLIC_PEM);
const ALG = USE_RSA ? "RS256" : "HS256";

const hsSecret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-insecure-secret-change-me"
);

// Keys are imported once and cached (importing is async).
let privateKeyPromise;
let publicKeyPromise;

function decodePem(value) {
  if (!value) return null;
  // Accept either a base64-encoded PEM or a raw PEM (with literal \n).
  if (value.includes("BEGIN")) return value.replace(/\\n/g, "\n");
  // PEM is ASCII, so atob (available in Edge + Node) decodes it correctly.
  if (typeof atob === "function") return atob(value);
  return Buffer.from(value, "base64").toString("utf8");
}

function getSigningKey() {
  if (!USE_RSA) return hsSecret;
  if (!privateKeyPromise) privateKeyPromise = importPKCS8(PRIVATE_PEM, ALG);
  return privateKeyPromise;
}

function getVerifyKey() {
  if (!USE_RSA) return hsSecret;
  if (!publicKeyPromise) publicKeyPromise = importSPKI(PUBLIC_PEM, ALG);
  return publicKeyPromise;
}

/** Sign a session JWT. Payload carries the Mongo user id + basic profile. */
export async function createSession(user) {
  const key = await getSigningKey();
  return await new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(key);
}

/** Verify a session JWT. Returns the payload or null. */
export async function verifySession(token) {
  try {
    const key = await getVerifyKey();
    const { payload } = await jwtVerify(token, key);
    return payload;
  } catch {
    return null;
  }
}
