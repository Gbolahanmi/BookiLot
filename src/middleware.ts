import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";

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

const pendingOnlyRoutes = ["/verify-email"];

const activeOnlyRoutes = ["/settings", "/billing", "/staff"];

const protectedApiRoutes = ["/api/services", "/api/staff", "/api/customers"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isPublicRoute =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/pricing" ||
    pathname.startsWith("/widget") ||
    pathname.startsWith("/bookings/manage/") ||
    pathname.startsWith("/staff/accept") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/availability") ||
    pathname.startsWith("/api/bookings/manage") ||
    pathname.startsWith("/api/staff/accept") ||
    pathname.startsWith("/api/webhooks");

  if (isPublicRoute) {
    return NextResponse.next();
  }

  const isProtected =
    protectedRoutes.some((route) => pathname.startsWith(route)) ||
    protectedApiRoutes.some((route) => pathname.startsWith(route));

  if (isProtected && !req.auth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (req.auth) {
    const status = req.auth.user?.status || "pending";
    const orgId = req.auth.user?.organizationId;

    // Inactive users (deactivated staff) → block everything
    if (status === "inactive") {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("error", "account_deactivated");
      return NextResponse.redirect(loginUrl);
    }

    // Pending users: only allow /verify-email
    if (status === "pending") {
      const isPendingAllowed =
        pendingOnlyRoutes.some((route) => pathname.startsWith(route)) ||
        pathname.startsWith("/api/auth/verify-email");

      if (!isPendingAllowed) {
        return NextResponse.redirect(new URL("/verify-email", req.url));
      }
    }

    // Email-verified users: redirect to /onboarding if no org
    if (status === "email_verified" && !orgId && pathname !== "/onboarding") {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    // Active-only routes require "active" status
    if (status !== "active") {
      const isActiveOnly = activeOnlyRoutes.some((route) =>
        pathname.startsWith(route)
      );
      if (isActiveOnly) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Active users: block onboarding
    if (status === "active" && pathname === "/onboarding") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Role-based routing
    const role = req.auth.user?.role;

    const ownerOnlyRoutes = ["/dashboard", "/bookings", "/services", "/customers", "/settings", "/billing"];
    const isOwnerOnlyPage = ownerOnlyRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"));

    const staffSelfServiceRoutes = ["/staff/dashboard", "/staff/bookings", "/staff/hours", "/staff/profile"];
    const isStaffSelfService = staffSelfServiceRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"));

    if (role === "staff" && isOwnerOnlyPage) {
      return NextResponse.redirect(new URL("/staff/dashboard", req.url));
    }

    if (role === "owner" && isStaffSelfService) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Verified/active users trying to access pending-only routes
    if (status !== "pending") {
      const isPendingOnly = pendingOnlyRoutes.some((route) => pathname.startsWith(route));
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
