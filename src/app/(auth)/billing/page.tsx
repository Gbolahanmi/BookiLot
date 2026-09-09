"use client";

import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { PLAN_LIMITS } from "@/lib/constants";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    features: [
      "50 bookings/month",
      "1 staff member",
      "5 services",
      "Web channel only",
    ],
    current: true,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    features: [
      "Unlimited bookings",
      "10 staff members",
      "50 services",
      "Web + SMS channels",
      "Insights dashboard",
      "Waitlist management",
    ],
    current: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    features: [
      "Everything in Pro",
      "Voice AI channel",
      "Unlimited staff & services",
      "Multi-location",
      "API access",
    ],
    current: false,
  },
];

export default function BillingPage() {
  const { data: billing, error, isLoading } = useSWR("/api/billing", fetcher);
  const [upgrading, setUpgrading] = useState(false);

  const currentPlan = billing?.plan || "free";
  const bookingsUsed = billing?.bookingsUsed || 0;
  const limit = PLAN_LIMITS[currentPlan as keyof typeof PLAN_LIMITS];
  const maxBookings = limit?.maxBookingsPerMonth || 50;
  const usagePercent = maxBookings === -1 ? 0 : Math.min((bookingsUsed / maxBookings) * 100, 100);

  return (
    <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
            Failed to load billing info. Please try again later.
          </div>
        )}

        {isLoading ? (
          <div className="space-y-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <>
            {/* Current Plan */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Current Plan
              </h2>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-2xl font-bold text-gray-900 capitalize">{currentPlan}</p>
                  <p className="text-sm text-gray-500">
                    {bookingsUsed} of {maxBookings === -1 ? "unlimited" : maxBookings} bookings used this month
                  </p>
                </div>
                <div className="sm:ml-auto">
                  <Button onClick={() => setUpgrading(!upgrading)}>
                    Upgrade Plan
                  </Button>
                </div>
              </div>

              {/* Usage bar */}
              {maxBookings !== -1 && (
                <div className="mt-4">
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-indigo-600"
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Upgrade Options */}
            {upgrading && (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {plans
                  .filter((p) => p.name.toLowerCase() !== currentPlan)
                  .map((plan) => (
                    <div
                      key={plan.name}
                      className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
                    >
                      <h3 className="text-lg font-semibold text-gray-900">
                        {plan.name}
                      </h3>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-gray-900">
                          {plan.price}
                        </span>
                        {plan.period && (
                          <span className="text-gray-500">{plan.period}</span>
                        )}
                      </div>
                      <ul className="mt-4 space-y-2">
                        {plan.features.map((f) => (
                          <li
                            key={f}
                            className="flex items-center gap-2 text-sm text-gray-600"
                          >
                            <svg
                              className="h-4 w-4 text-green-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4.5 12.75l6 6 9-13.5"
                              />
                            </svg>
                            {f}
                          </li>
                        ))}
                      </ul>
                      <Button className="w-full mt-6" variant="outline">
                        Upgrade to {plan.name}
                      </Button>
                    </div>
                  ))}
              </div>
            )}

            {/* Invoices */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Invoice History
              </h2>
              {billing?.invoices?.length === 0 || !billing?.invoices ? (
                <EmptyState
                  title="No invoices yet"
                  description="Invoices will appear here after your first payment."
                />
              ) : (
                <div className="divide-y divide-gray-200">
                  {billing.invoices.map((invoice: { id: string; date: string; amount: string; status: string }) => (
                    <div key={invoice.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{invoice.date}</p>
                        <p className="text-xs text-gray-500">{invoice.status}</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{invoice.amount}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
    </div>
  );
}
