"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { OnboardingBanner } from "./onboarding-banner";
import { signOut, useSession } from "next-auth/react";
import { NAV_ITEMS, STAFF_NAV_ITEMS } from "@/lib/constants";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const user = session?.user;
  const role = user?.role;
  const userStatus = user?.status;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  const isStaff = role === "staff";
  const sidebarItems = isStaff ? STAFF_NAV_ITEMS : NAV_ITEMS;
  const logoHref = isStaff ? "/staff/dashboard" : "/dashboard";

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        items={sidebarItems}
        logoHref={logoHref}
      />
      <div className="lg:pl-64">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-x-4">
            {user && (
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.name || user.email}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Sign out
            </button>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">
          {!isStaff && userStatus !== "email_verified" && userStatus !== "active" ? (
            <OnboardingBanner />
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}
