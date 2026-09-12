import { NextRequest, NextResponse } from "next/server";

const locales = ["en", "nl", "fr", "es", "pl", "uk", "pt", "ar"];
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

  if (!locale || !locales.includes(locale)) {
    const url = request.nextUrl.clone();
    url.pathname = `/en${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  const internalPath = `/${segments.slice(1).join("/")}`.replace(/\/$/, "") || "/";
  const isAuthRoute = publicAuthRoutes.has(internalPath);
  const hasSession = Boolean(
    request.cookies.get("cleanones_manager_access_token")?.value ||
    request.cookies.get("cleanones_manager_refresh_token")?.value
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
