import { getSession } from "@/lib/auth";
import { createPretaToken } from "@/lib/preta-token";

// Returns a signed Preta identity token for the logged-in user.
// Preta verifies it with PRETA_PUBLIC_KEY.
export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const token = await createPretaToken({
      id: session.id,
      email: session.email,
      name: session.name,
      role: session.role,
    });
    return Response.json({ token });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
