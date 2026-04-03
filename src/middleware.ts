import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getSessionCookie } from "better-auth/cookies";

/**
 * Optimistic auth gate (cookie presence only). API routes still validate the session.
 */
export function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/products/:path*",
    "/inbound/:path*",
    "/outbound/:path*",
    "/movements/:path*",
  ],
};
