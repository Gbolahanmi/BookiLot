"use client";

import useSWR from "swr";
import { SkeletonCard } from "@/components/ui/skeleton";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Booking {
  id: string;
  startsAt: string;
  endsAt: string;
  status: string;
  serviceName: string;
  customerName: string;
}

function formatTime(dateStr: string, tz: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: tz,
  }).format(new Date(dateStr));
}

function formatDate(dateStr: string, tz: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: tz,
  }).format(new Date(dateStr));
}

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  confirmed: { bg: "bg-green-100", text: "text-green-800" },
  pending: { bg: "bg-yellow-100", text: "text-yellow-800" },
  cancelled: { bg: "bg-red-100", text: "text-red-800" },
  completed: { bg: "bg-blue-100", text: "text-blue-800" },
  no_show: { bg: "bg-gray-100", text: "text-gray-800" },
};

export default function StaffBookingsPage() {
  const { data, error, isLoading } = useSWR("/api/staff/bookings", fetcher);
  const bookings: Booking[] = data?.bookings ?? [];
  const tz = data?.timezone || "UTC";

  return (
    <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
            Failed to load bookings. Please try again later.
          </div>
        )}

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-500">No bookings assigned to you</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {bookings.map((booking) => {
                const colors = STATUS_STYLES[booking.status] || STATUS_STYLES.pending;
                return (
                  <div key={booking.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {booking.customerName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {booking.serviceName}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(booking.startsAt, tz)} at {formatTime(booking.startsAt, tz)} – {formatTime(booking.endsAt, tz)}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}
                      >
                        {booking.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
  );
}
