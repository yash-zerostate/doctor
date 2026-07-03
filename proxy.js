import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

// Routes that require an authenticated session.
const PROTECTED = [
  "/doctors",
  "/onboarding",
  "/doctor",
  "/admin",
  "/video-call",
  "/appointments",
  "/billing",
];

function matches(pathname, prefix) {
  return pathname === prefix || pathname.startsWith(prefix + "/");
}

export default async function middleware(req) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED.some((p) => matches(pathname, p));
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;

  // Not logged in -> send to sign-in (preserve intended destination).
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Role gating.
  if (matches(pathname, "/admin") && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (
    (pathname === "/doctor" || pathname.startsWith("/doctor/")) &&
    session.role !== "DOCTOR"
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
