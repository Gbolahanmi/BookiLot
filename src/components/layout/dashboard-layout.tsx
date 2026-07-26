"use client";

import { Sidebar } from "./sidebar";
import { signOut } from "next-auth/react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-x-6 border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6">
          <div className="flex-1" />
          <div className="flex items-center gap-x-4">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Sign out
            </button>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
