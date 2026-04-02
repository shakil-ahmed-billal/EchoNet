import { NextRequest } from "next/server";

export type UserRole = "USER" | "ADMIN" | "MODERATOR" | "SUPER_ADMIN";

// ─── Route Definitions ─────────────────────────────────────────────────────────

/** Pages only accessible when logged OUT */
const AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
];

/** Pages requiring authentication — any valid role */
const COMMON_PROTECTED_ROUTES = [
  "/",
  "/feed",
  "/discover",
  "/friends",
  "/messages",
  "/notifications",
  "/profile",
  "/marketplace",
  "/properties",
  "/my-properties",
  "/store",
  "/orders",
  "/search",
  "/settings",
];

/** Pages only accessible by ADMIN (and SUPER_ADMIN) */
const ADMIN_ROUTES = ["/admin", "/admin-dashboard"];

/** Pages accessible by MODERATOR or ADMIN */
const MODERATOR_ROUTES = ["/moderator", "/mod-dashboard"];

// ─── Route Classification Helpers ──────────────────────────────────────────────

export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

export function isCommonProtectedRoute(pathname: string): boolean {
  return COMMON_PROTECTED_ROUTES.some(
    (route) =>
      pathname === route ||
      (route !== "/" && pathname.startsWith(route + "/"))
  );
}

export function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some((route) => pathname.startsWith(route));
}

export function isModeratorRoute(pathname: string): boolean {
  return MODERATOR_ROUTES.some((route) => pathname.startsWith(route));
}

/** Returns who "owns" the route, or null for fully public routes */
export type RouteOwner = "COMMON" | "ADMIN" | "MODERATOR" | null;

export function getRouteOwner(pathname: string): RouteOwner {
  if (isAdminRoute(pathname)) return "ADMIN";
  if (isModeratorRoute(pathname)) return "MODERATOR";
  if (isCommonProtectedRoute(pathname)) return "COMMON";
  return null; // public
}

/** Default landing page for each role after login */
export function getDefaultDashboardRoute(role: UserRole | null): string {
  switch (role) {
    case "ADMIN":
    case "SUPER_ADMIN":
      return "/admin/dashboard";
    case "MODERATOR":
      return "/moderator/dashboard";
    default:
      return "/";
  }
}

// ─── Token Utilities (edge-safe — no jsonwebtoken) ─────────────────────────────

/** Decode a JWT payload without verifying signature (safe for Edge runtime) */
export function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const base64Payload = token.split(".")[1];
    if (!base64Payload) return null;
    const json = atob(base64Payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getTokenRole(token: string): UserRole | null {
  const payload = decodeJwtPayload(token);
  return (payload?.role as UserRole) ?? null;
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;
  return Math.floor(Date.now() / 1000) >= payload.exp;
}

export function isTokenExpiringSoon(token: string, thresholdSeconds = 300): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return false;
  const remaining = payload.exp - Math.floor(Date.now() / 1000);
  return remaining > 0 && remaining <= thresholdSeconds;
}

// ─── Session Cookie Helper ─────────────────────────────────────────────────────

/** Finds the better-auth session token regardless of __Secure- or __Host- prefix */
export function getSessionToken(request: NextRequest): string | undefined {
  for (const [name, value] of request.cookies) {
    if (name.includes("better-auth.session_token")) return value.value;
  }
  return undefined;
}
