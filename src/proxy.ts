import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  ADMIN_COOKIE_OPTIONS,
  verifyAdminSession,
} from "@/lib/admin-auth";
import {
  COOKIE_NAME,
  QUOTE_COOKIE_SECRET,
  signIssueTime,
  verifyIssueTime,
} from "@/lib/form-token";

/**
 * Issue or refresh the quote-form timing cookie (C1-form).
 *
 * The form pages are statically prerendered, so any timestamp baked into the
 * HTML would be a build-time stamp and the timing trap would never fire on a
 * real visit. Proxy runs per request, even for static pages, so it can issue a
 * fresh signed cookie carrying the real visit time while keeping the page
 * itself static and the no-JavaScript path intact.
 *
 * The cookie is HttpOnly, Secure, SameSite=Lax, and path=/.
 */
async function issueQuoteCookie(request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.next();

  // Only issue the cookie on page loads. Refreshing it on other methods would
  // reset the stopwatch and defeat the trap.
  if (request.method !== "GET") {
    return response;
  }

  // If the visitor already has a valid cookie, keep it so the clock keeps
  // running from the first request of this visit. A missing or unverifiable
  // cookie is reissued so a secret rotation or tampered cookie is recovered
  // on the next page load.
  const existing = request.cookies.get(COOKIE_NAME);
  if (existing) {
    const verified = await verifyIssueTime(QUOTE_COOKIE_SECRET, existing.value);
    if (verified) {
      return response;
    }
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
    // enough that ordinary humans never hit it. See src/app/actions/quote.ts
    // for the matching server-side check.
    maxAge: 4 * 60 * 60, // 4 hours
  });

  return response;
}

/**
 * App-level admin gate.
 *
 * Unauthenticated visitors to any /admin path other than /admin/login are
 * redirected to /admin/login (GET) or receive 401 (everything else). The login
 * page and its Server Action are intentionally left ungated so the password
 * can be checked there.
 */
async function guardAdminRoute(request: NextRequest): Promise<NextResponse> {
  const session = request.cookies.get(ADMIN_COOKIE_OPTIONS.name);
  const valid = session ? await verifyAdminSession(session.value) : false;

  if (valid) {
    return NextResponse.next();
  }

  if (request.method === "GET") {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return new NextResponse("Unauthorized", { status: 401 });
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin area: password-gated. Leave /admin/login open so the login action
  // can run.
  if (pathname.startsWith("/admin/") && !pathname.startsWith("/admin/login")) {
    return guardAdminRoute(request);
  }

  // Everything else (including /admin/login): keep the quote-form timing
  // cookie fresh on the public pages that host the form.
  return issueQuoteCookie(request);
}

export const config = {
  matcher: ["/contact", "/models/:slug*", "/admin/:path*"],
};
