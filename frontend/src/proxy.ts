import { NextRequest, NextResponse } from "next/server";
import {
  decodeJwtPayload,
  getDefaultDashboardRoute,
  getRouteOwner,
  getSessionToken,
  isAdminRoute,
  isAuthRoute,
  isModeratorRoute,
  isTokenExpired,
  isTokenExpiringSoon,
  UserRole,
} from "./lib/authUtils";

const BASE_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// ─── Token Refresh ─────────────────────────────────────────────────────────────

async function refreshAccessToken(
  refreshToken: string,
  request: NextRequest,
  response: NextResponse
): Promise<NextResponse | null> {
  try {
    const res = await fetch(`${BASE_API_URL}/auth/refresh-token`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        // Forward all original cookies (including better-auth session) to the backend
        "Cookie": request.headers.get("cookie") || ""
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return null;

    const payload = await res.json();
    const data = payload.data;

    if (data?.accessToken) {
      response.cookies.set("accessToken", data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
    }
    if (data?.refreshToken) {
      response.cookies.set("refreshToken", data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
    }

    return response;
  } catch (error) {
    console.error("[Proxy] Error refreshing token:", error);
    return null;
  }
}

// ─── Main Proxy ────────────────────────────────────────────────────────────────

export async function proxy(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const pathWithQuery = `${pathname}${request.nextUrl.search}`;

    // ── Extract tokens ──────────────────────────────────────────────────────
    const accessToken = request.cookies.get("accessToken")?.value;
    const refreshToken = request.cookies.get("refreshToken")?.value;
    const sessionToken = getSessionToken(request);

    // A user is considered "logged in" if they have a valid access OR session token
    const isValidAccessToken =
      !!accessToken && !isTokenExpired(accessToken);
    const isLoggedIn = isValidAccessToken || !!sessionToken;

    // ── Decode role ─────────────────────────────────────────────────────────
    let userRole: UserRole | null = null;
    if (accessToken) {
      const payload = decodeJwtPayload(accessToken);
      const raw = (payload?.role as string | undefined)?.trim().toUpperCase();
      // Allow mapping SUPER_ADMIN to ADMIN permissions
      userRole = raw === "SUPER_ADMIN" ? "ADMIN" : (raw as UserRole ?? null);
    }

    const routeOwner = getRouteOwner(pathname);

    // ── Proactive token refresh ─────────────────────────────────────────────
    // If access token is missing, expired, or expiring soon, attempt a refresh if we have a refresh token
    const needsRefresh = !isValidAccessToken || isTokenExpiringSoon(accessToken!);
    if (needsRefresh && refreshToken) {
      if (isAuthRoute(pathname)) return NextResponse.next();

      const response = NextResponse.redirect(request.nextUrl); // Redirect to same URL to apply new cookies
      const refreshed = await refreshAccessToken(refreshToken, request, response);
      if (refreshed) {
        refreshed.headers.set("x-token-refreshed", "1");
        return refreshed;
      }
    }

    // ── Rule 1: Auth pages → redirect logged-in users to their dashboard ────
    if (isAuthRoute(pathname)) {
      if (isLoggedIn) {
        return NextResponse.redirect(
          new URL(getDefaultDashboardRoute(userRole), request.url)
        );
      }
      return NextResponse.next();
    }

    // ── Rule 2: Fully public routes → allow ─────────────────────────────────
    if (routeOwner === null) {
      return NextResponse.next();
    }

    // ── Rule 3: Protected routes → must be logged in ─────────────────────────
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathWithQuery);
      return NextResponse.redirect(loginUrl);
    }

    // ── Rule 4: Admin-only routes ─────────────────────────────────────────────
    if (isAdminRoute(pathname)) {
      if (userRole !== "ADMIN") {
        return NextResponse.redirect(
          new URL(getDefaultDashboardRoute(userRole), request.url)
        );
      }
      return NextResponse.next();
    }

    // ── Rule 5: Moderator routes ──────────────────────────────────────────────
    if (isModeratorRoute(pathname)) {
      if (userRole !== "MODERATOR" && userRole !== "ADMIN") {
        return NextResponse.redirect(
          new URL(getDefaultDashboardRoute(userRole), request.url)
        );
      }
      return NextResponse.next();
    }

    // ── Rule 6: Common protected routes → logged in users can access ──────────
    return NextResponse.next();
  } catch (error) {
    console.error("[Proxy] Middleware error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - logo and public assets
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|logo|.well-known).*)",
  ],
};
