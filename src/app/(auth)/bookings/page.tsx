"use client";

import { useState } from "react";
import useSWR from "swr";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { SkeletonTable } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { STATUS_COLORS } from "@/lib/constants";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function BookingsPage() {
  const [view, setView] = useState<"list" | "calendar">("list");
  const { data: bookings, error, isLoading } = useSWR("/api/bookings", fetcher);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setView("list")}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                view === "list"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              }`}
            >
              List
            </button>
            <button
              onClick={() => setView("calendar")}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                view === "calendar"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              }`}
            >
              Calendar
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
            Failed to load bookings. Please try again later.
          </div>
        )}

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          {isLoading ? (
            <div className="p-6">
              <SkeletonTable rows={5} />
            </div>
          ) : error ? (
            <p className="py-12 text-center text-sm text-red-600">Failed to load bookings.</p>
          ) : bookings?.length === 0 ? (
            <EmptyState
              title="No bookings yet"
              description="Bookings will appear here as customers book appointments."
            />
          ) : view === "list" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 font-medium text-gray-500">Customer</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Service</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Date</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings?.map((b: { id: string; customerName: string; service: string; date: string; status: string }) => {
                    const colors = STATUS_COLORS[b.status] || STATUS_COLORS.pending;
                    return (
                      <tr key={b.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{b.customerName}</td>
                        <td className="px-4 py-3 text-gray-600">{b.service}</td>
                        <td className="px-4 py-3 text-gray-600">{b.date}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${colors.bg} ${colors.text}`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-sm text-gray-500">
              Calendar view coming soon.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
