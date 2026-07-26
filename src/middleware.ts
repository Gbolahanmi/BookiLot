import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
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

// API routes that require authentication
const protectedApiRoutes = [
  "/api/services",
  "/api/staff",
  "/api/customers",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Check if the route is protected
  const isProtected =
    protectedRoutes.some((route) => pathname.startsWith(route)) ||
    protectedApiRoutes.some((route) => pathname.startsWith(route));

  if (isProtected && !req.auth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
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
    "/api/services/:path*",
    "/api/staff/:path*",
    "/api/customers/:path*",
  ],
};
