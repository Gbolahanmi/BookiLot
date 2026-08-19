import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";

// Routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/bookings",
  "/services",
  "/staff",
  "/customers",
  "/settings",
  "/billing",
  "/onboarding",
];

// Routes only accessible with "pending" status (unverified)
const pendingOnlyRoutes = [
  "/verify-email",
];

// Routes that require active status (onboarding complete)
const activeOnlyRoutes = [
  "/settings",
  "/billing",
  "/staff",
];

// API routes that require authentication
const protectedApiRoutes = [
  "/api/services",
  "/api/staff",
  "/api/customers",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Public routes — always allowed
  const isPublicRoute =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/pricing" ||
    pathname.startsWith("/widget") ||
    pathname.startsWith("/bookings/manage/") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/availability") ||
    pathname.startsWith("/api/bookings/manage") ||
    pathname.startsWith("/api/webhooks");

  if (isPublicRoute) {
    return NextResponse.next();
  }

  const isProtected =
    protectedRoutes.some((route) => pathname.startsWith(route)) ||
    protectedApiRoutes.some((route) => pathname.startsWith(route));

  // Not logged in → redirect to login
  if (isProtected && !req.auth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Logged in user — check status
  if (req.auth) {
    const status = req.auth.user?.status || "pending";
    const orgId = req.auth.user?.organizationId;

    // Pending users: only allow /verify-email
    if (status === "pending") {
      const isPendingAllowed =
        pendingOnlyRoutes.some((route) => pathname.startsWith(route)) ||
        pathname.startsWith("/api/auth/verify-email");

      if (!isPendingAllowed) {
        return NextResponse.redirect(new URL("/verify-email", req.url));
      }
    }

    // Email-verified users: redirect to /onboarding if no org, block owner-only features
    if (status === "email_verified") {
      // No org yet → must complete onboarding
      if (!orgId && pathname !== "/onboarding") {
        return NextResponse.redirect(new URL("/onboarding", req.url));
      }
      // Has org → block owner-only features (they're "active" in practice)
      if (orgId) {
        const isBlockedForUnverified =
          activeOnlyRoutes.some((route) => pathname.startsWith(route));
        if (isBlockedForUnverified) {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
      }
    }

    // Active users: block onboarding (already completed)
    if (status === "active" && pathname === "/onboarding") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Verified/active users trying to access pending-only routes
    if (status !== "pending") {
      const isPendingOnly =
        pendingOnlyRoutes.some((route) => pathname.startsWith(route));

      if (isPendingOnly) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/bookings/:path*",
    "/services/:path*",
    "/staff/:path*",
    "/customers/:path*",
    "/settings/:path*",
    "/billing/:path*",
    "/onboarding/:path*",
    "/verify-email/:path*",
    "/api/services/:path*",
    "/api/staff/:path*",
    "/api/customers/:path*",
  ],
};
