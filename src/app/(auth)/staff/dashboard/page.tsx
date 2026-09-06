"use client";

import useSWR from "swr";
import { StaffLayout } from "@/components/layout/staff-layout";
import { SkeletonCard } from "@/components/ui/skeleton";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function StaffDashboardPage() {
  const { data: stats, error: statsError } = useSWR("/api/staff/dashboard", fetcher);
  const { data: bookings, error: bookingsError } = useSWR("/api/staff/bookings", fetcher);

  const statsLoading = !stats && !statsError;
  const bookingsLoading = !bookings && !bookingsError;

  return (
    <StaffLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>

        {(statsError || bookingsError) && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
            Failed to load dashboard data. Please try again later.
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statsLoading
            ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            : [
                { label: "Today's Bookings", value: stats?.todayBookings ?? 0 },
                { label: "This Week", value: stats?.weekBookings ?? 0 },
                { label: "Total Bookings", value: stats?.totalBookings ?? 0 },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="mt-1 text-3xl font-semibold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              ))}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Upcoming Bookings
          </h2>
          {bookingsLoading ? (
            <SkeletonCard />
          ) : bookingsError ? (
            <p className="text-sm text-red-600">Failed to load bookings.</p>
          ) : bookings?.bookings?.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-500">No upcoming bookings</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {bookings?.bookings?.map((b: { id: string; customerName: string; time: string; service: string; status: string }) => (
                <div key={b.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-900">{b.customerName}</p>
                    <p className="text-sm text-gray-500">{b.service} — {b.time}</p>
                  </div>
                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </StaffLayout>
  );
}
