// Generates an RSA key pair for RS256 JWT signing/verification.
// PEMs are base64-encoded so they fit on a single .env line.
//
// Usage:
//   npm run keys:generate            -> JWT_PRIVATE_KEY / JWT_PUBLIC_KEY
//   node scripts/generate-jwt-keys.mjs PRETA   -> PRETA_PRIVATE_KEY / PRETA_PUBLIC_KEY
import { generateKeyPairSync } from "node:crypto";

const prefix = (process.argv[2] || "JWT").toUpperCase();

const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

const b64 = (s) => Buffer.from(s, "utf8").toString("base64");

console.log(`# --- Add these to your .env (base64-encoded PEM) ---\n`);
console.log(`${prefix}_PRIVATE_KEY="${b64(privateKey)}"`);
console.log(`${prefix}_PUBLIC_KEY="${b64(publicKey)}"`);
console.log(`\n# --- Raw public key PEM (paste this into Preta to verify tokens) ---\n`);
console.log(publicKey);
