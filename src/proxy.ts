import { NextRequest, NextResponse } from "next/server";

const locales = ["en", "nl", "fr", "es", "pl", "uk", "pt", "ar"];
const publicAuthRoutes = new Set([
  "/login",
  "/forgot-password",
  "/forgot-password/otp",
  "/forgot-password/reset",
]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
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
