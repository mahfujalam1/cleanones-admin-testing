import { NextRequest, NextResponse } from "next/server";
import { REFRESH_COOKIE, SESSION_COOKIE } from "@/lib/auth/session";
import { supportedLocales } from "@/lib/locale";


const publicAuthRoutes = new Set([
  "/login",
  "/forgot-password",
  "/forgot-password/otp",
  "/forgot-password/reset",
]);

// Set DEBUG_REQUESTS=1 to print what kind of request each hit actually is.
// "prefetch" = Link prefetch, "rsc-nav" = client-side navigation,
// "document" = full page load or reload. Remove once the noise is diagnosed.
function logRequestKind(request: NextRequest, pathname: string) {
  if (!process.env.DEBUG_REQUESTS) return;
  const headers = request.headers;
  const kind = headers.get("next-router-prefetch") === "1"
    ? "prefetch"
    : headers.get("rsc") === "1"
      ? "rsc-nav"
      : "document";
  console.log(
    `[req] ${kind.padEnd(8)} ${pathname}`,
    "| sec-fetch-mode:", headers.get("sec-fetch-mode"),
    "| sec-purpose:", headers.get("sec-purpose"),
    "| referer:", headers.get("referer"),
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  logRequestKind(request, pathname);
  const segments = pathname.split("/").filter(Boolean);
  const locale = segments[0];

  if (!locale || !supportedLocales.includes(locale as (typeof supportedLocales)[number])) {
    const url = request.nextUrl.clone();
    url.pathname = `/en${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  const internalPath = `/${segments.slice(1).join("/")}`.replace(/\/$/, "") || "/";
  const isAuthRoute = publicAuthRoutes.has(internalPath);
  // The access token is memory-only, so route gating reads the two things that do survive a
  // reload: the backend's HttpOnly refresh cookie, and our own marker cookie (which is also the
  // one sign-out can delete, since JavaScript cannot touch an HttpOnly cookie).
  const hasSession = Boolean(
    request.cookies.get(SESSION_COOKIE)?.value && request.cookies.get(REFRESH_COOKIE)?.value,
  );

  if (!hasSession && !isAuthRoute) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = `/${locale}/login`;
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && internalPath === "/login") {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = `/${locale}`;
    return NextResponse.redirect(dashboardUrl);
  }

  const url = request.nextUrl.clone();
  url.pathname = internalPath;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};