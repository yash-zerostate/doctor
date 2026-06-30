// Signs a short-lived identity token for Preta to verify.
// The doctor app signs with PRETA_PRIVATE_KEY (RS256); Preta verifies the
// token with PRETA_PUBLIC_KEY (paste the public key into Preta).
import { SignJWT, importPKCS8 } from "jose";

const PRIVATE_PEM = decodePem(process.env.PRETA_PRIVATE_KEY);
const ISSUER = process.env.PRETA_TOKEN_ISSUER || "doctor-app";
const AUDIENCE = process.env.PRETA_TOKEN_AUDIENCE || "preta";

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
