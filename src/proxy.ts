import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { COOKIE_NAME, QUOTE_COOKIE_SECRET, signIssueTime } from "@/lib/form-token";

/**
 * Quote-form timing cookie (C1-form).
 *
 * The form pages are statically prerendered, so any timestamp baked into the
 * HTML would be a build-time stamp and the timing trap would never fire on a
 * real visit. Middleware runs per request, even for static pages, so it can
 * issue a fresh signed cookie carrying the real visit time while keeping the
 * page itself static and the no-JavaScript path intact.
 *
 * The cookie is HttpOnly, Secure, SameSite=Lax, and path=/.
 */
export async function proxy(request: NextRequest) {
  const response = NextResponse.next();

  // Only issue the cookie on page loads. Refreshing it on other methods would
  // reset the stopwatch and defeat the trap.
  if (request.method !== "GET") {
    return response;
  }

  // If the visitor already has a valid cookie, keep it so the clock keeps
  // running from the first request of this visit.
  if (request.cookies.get(COOKIE_NAME)) {
    return response;
  }

  const issueTime = Date.now();
  const token = await signIssueTime(QUOTE_COOKIE_SECRET, issueTime);

  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    // The server-side timing trap only enforces a minimum fill time (bots fill
    // instantly). A maximum age ceiling previously wiped real leads who spent
    // more than ten minutes on the form, so the cookie lifetime is now long
    // enough that ordinary humans never hit it, while still bounding old-cookie
    // replay. See src/app/actions/quote.ts for the matching server-side check.
    maxAge: 4 * 60 * 60, // 4 hours
  });

  return response;
}

export const config = {
  matcher: ["/contact", "/models/:slug*"],
};
