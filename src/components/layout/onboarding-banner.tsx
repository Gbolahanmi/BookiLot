"use client";

import { useSession } from "next-auth/react";

export function OnboardingBanner() {
  const { data: session } = useSession();
  const status = session?.user?.status;

  if (status !== "email_verified") return null;

  return (
    <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <svg className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-amber-800">
            Complete your setup
          </h3>
          <p className="mt-1 text-sm text-amber-700">
            Add services and set working hours so customers can start booking with you.
          </p>
          <div className="mt-3">
            <a
              href="/onboarding"
              className="inline-flex items-center rounded-md bg-amber-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-500 transition-colors"
            >
              Continue Setup
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
