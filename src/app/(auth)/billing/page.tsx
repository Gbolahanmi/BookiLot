"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Free",
    price: "₦0",
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
    price: "₦15,000",
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

const invoices = [
  { id: "1", date: "Jan 1, 2025", amount: "₦0", status: "paid" },
];

export default function BillingPage() {
  const [upgrading, setUpgrading] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>

        {/* Current Plan */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Current Plan
          </h2>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-2xl font-bold text-gray-900">Free</p>
              <p className="text-sm text-gray-500">
                12 of 50 bookings used this month
              </p>
            </div>
            <div className="ml-auto">
              <Button onClick={() => setUpgrading(!upgrading)}>
                Upgrade Plan
              </Button>
            </div>
          </div>

          {/* Usage bar */}
          <div className="mt-4">
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-indigo-600"
                style={{ width: "24%" }}
              />
            </div>
          </div>
        </div>

        {/* Upgrade Options */}
        {upgrading && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {plans
              .filter((p) => !p.current)
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
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No invoices yet</p>
            <p className="text-xs mt-1">
              Invoices will appear here after your first payment.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
