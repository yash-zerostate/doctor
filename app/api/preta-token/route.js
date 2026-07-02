import { getSession } from "@/lib/auth";
import { createPretaContextToken, pretaContextForUser } from "@/lib/preta-token";

// Preta SmartCode ctx endpoint (data-ctx-endpoint="/api/preta-token").
// The loader fetches this and passes the returned token to Preta, which verifies
// it with the PUBLIC key you registered. Token claims live under "preta:user"
// (issuer = tenant id, audience = "preta.io", RS256, 5-min expiry).
export async function GET() {
  const session = await getSession();

  // No logged-in user → no token; visitor is treated as an anonymous guest.
  if (!session) {
    return Response.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const ctx = {
      ...pretaContextForUser(session),
      role: session.role,
      email: session.email,
    };
    const token = await createPretaContextToken(ctx);
    return Response.json({ token });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
