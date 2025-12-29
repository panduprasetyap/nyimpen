import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_key_change_me");

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Paths that require authentication
  if (pathname.startsWith("/dashboard")) {
    const sessionToken = req.cookies.get("session_token")?.value;

    if (!sessionToken) {
      return NextResponse.redirect(new URL("/public/login", req.url));
    }

    try {
        await jwtVerify(sessionToken, JWT_SECRET);
        return NextResponse.next();
    } catch (error) {
        // Invalid token
        return NextResponse.redirect(new URL("/public/login", req.url));
    }
  }

  // Paths that are public-only (optional: redirect logged-in users away from login)
  if (pathname === "/public/login" || pathname === "/public/register") {
      const sessionToken = req.cookies.get("session_token")?.value;
      if (sessionToken) {
          try {
             await jwtVerify(sessionToken, JWT_SECRET);
             return NextResponse.redirect(new URL("/dashboard", req.url));
          } catch(e) {
              // Valid logic to continue to login if token is invalid
          }
      }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets (public assets)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|assets).*)",
  ],
};
