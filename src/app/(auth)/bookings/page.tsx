"use client";

import { useState } from "react";
import useSWR from "swr";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { SkeletonTable } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/components/ui/toast";
import { STATUS_COLORS } from "@/lib/constants";

interface Booking {
  id: string;
  startsAt: string;
  endsAt: string;
  status: string;
  channel: string;
  notes: string | null;
  serviceName: string;
  staffName: string | null;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function BookingsPage() {
  const [view, setView] = useState<"list" | "calendar">("list");
  const { data, error, isLoading, mutate } = useSWR("/api/bookings", fetcher);
  const bookings: Booking[] = data?.bookings ?? [];

  const [cancelling, setCancelling] = useState<string | null>(null);

  async function handleCancel(id: string) {
    if (!confirm("Cancel this booking?")) return;
    setCancelling(id);
    try {
      const res = await fetch(`/api/bookings/${id}/cancel`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        toast(err.error || "Failed to cancel booking", "error");
        return;
      }
      toast("Booking cancelled", "success");
      mutate();
    } catch {
      toast("Something went wrong", "error");
    } finally {
      setCancelling(null);
    }
  }

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
          ) : bookings.length === 0 ? (
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
                    <th className="px-4 py-3 font-medium text-gray-500">Staff</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Date & Time</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Channel</th>
                    <th className="px-4 py-3 font-medium text-gray-500"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings.map((b) => {
                    const colors = STATUS_COLORS[b.status] || STATUS_COLORS.pending;
                    return (
                      <tr key={b.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{b.customerName}</p>
                          {b.customerEmail && (
                            <p className="text-xs text-gray-500">{b.customerEmail}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{b.serviceName}</td>
                        <td className="px-4 py-3 text-gray-600">{b.staffName || "—"}</td>
                        <td className="px-4 py-3">
                          <p className="text-gray-900">{formatDate(b.startsAt)}</p>
                          <p className="text-xs text-gray-500">{formatTime(b.startsAt)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${colors.bg} ${colors.text}`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 capitalize">{b.channel}</td>
                        <td className="px-4 py-3">
                          {b.status === "confirmed" && (
                            <button
                              onClick={() => handleCancel(b.id)}
                              disabled={cancelling === b.id}
                              className="text-xs text-red-600 hover:text-red-500 disabled:opacity-50"
                            >
                              {cancelling === b.id ? "Cancelling..." : "Cancel"}
                            </button>
                          )}
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
