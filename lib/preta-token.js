// Signs a short-lived identity token for Preta to verify.
// The doctor app signs with PRETA_PRIVATE_KEY (RS256); Preta verifies the
// token with PRETA_PUBLIC_KEY (paste the public key into Preta).
import { SignJWT, importPKCS8 } from "jose";
import { DEFAULT_PLAN, planIsPaid, sanitizeAddOns } from "./preta-plans";

const PRIVATE_PEM = decodePem(process.env.PRETA_PRIVATE_KEY);
// Preta verifies the context JWT expecting: issuer = your tenant id,
// audience = "preta.io". (Matches the dashboard's "Sign the context JWT" snippet.)
const TENANT_ID =
  process.env.PRETA_TENANT_ID || "d2698929-3689-49bc-9577-327ee4cd36d0";
const ISSUER = process.env.PRETA_TOKEN_ISSUER || TENANT_ID;
const AUDIENCE = process.env.PRETA_TOKEN_AUDIENCE || "preta.io";

let privateKeyPromise;

function decodePem(value) {
  if (!value) return null;
  if (value.includes("BEGIN")) return value.replace(/\\n/g, "\n");
  if (typeof atob === "function") return atob(value);
  return Buffer.from(value, "base64").toString("utf8");
}

function getPrivateKey() {
  if (!PRIVATE_PEM) {
    throw new Error("PRETA_PRIVATE_KEY is not set. Run: node scripts/generate-jwt-keys.mjs PRETA");
  }
  if (!privateKeyPromise) privateKeyPromise = importPKCS8(PRIVATE_PEM, "RS256");
  return privateKeyPromise;
}

/**
 * Create a signed Preta identity token for a user.
 * @param {{id:string,email:string,name?:string,role?:string}} user
 * @param {{ttlSeconds?:number}} [opts]
 */
export async function createPretaToken(user, opts = {}) {
  const key = await getPrivateKey();
  const ttl = opts.ttlSeconds ?? 300; // 5 minutes
  return await new SignJWT({
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setSubject(String(user.id))
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${ttl}s`)
    .sign(key);
}

/**
 * Maps a doctor-app user to the Preta Policy Engine context attributes.
 *
 * `plan` and `add_ons` are now REAL, user-controllable fields (set from the
 * Billing page / seed). We fall back to a role-derived plan only when the user
 * has no plan yet (e.g. a pre-existing Mongo doc). risk_score / account_type
 * stay derived from role. These keys are what you target in the Phase-1
 * dashboard rules (User Attributes → field = plan / add_ons / role / …).
 */
export function pretaContextForUser(user) {
  const planByRole = { ADMIN: "enterprise", DOCTOR: "pro", PATIENT: "free" };
  const riskByRole = { ADMIN: 0.8, DOCTOR: 0.5, PATIENT: 0.2 };
  const plan = user.plan || planByRole[user.role] || DEFAULT_PLAN;
  const add_ons = sanitizeAddOns(user.addOns);
  return {
    plan,
    add_ons,
    has_paid: planIsPaid(plan),
    risk_score: riskByRole[user.role] ?? 0.2,
    account_type:
      user.role === "DOCTOR" || user.role === "ADMIN" ? "business" : "personal",
  };
}

/**
 * Create the short-lived signed context token consumed by the Preta SDK
 * via `window.__PRETA_CTX__` + `data-ctx-var`.
 *
 * Matches the dashboard's "Sign the context JWT" contract:
 *   payload  = { "preta:user": { ...attributes } }
 *   issuer   = tenant id, audience = "preta.io", RS256, 5-min expiry.
 * @param {{plan:string,risk_score:number,account_type:string,role?:string,email?:string}} ctx
 * @param {{ttlSeconds?:number}} [opts]
 */
export async function createPretaContextToken(ctx, opts = {}) {
  const key = await getPrivateKey();
  const ttl = opts.ttlSeconds ?? 300; // 5 minutes
  // Pass the whole context through so new attributes (add_ons, has_paid, …)
  // reach the policy engine without editing this signer each time.
  return await new SignJWT({
    "preta:user": { ...ctx },
  })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${ttl}s`)
    .sign(key);
}
