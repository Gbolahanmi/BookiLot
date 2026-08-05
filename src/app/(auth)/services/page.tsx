"use client";

import useSWR from "swr";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ServicesPage() {
  const { data: services, error, isLoading } = useSWR("/api/services", fetcher);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
            Add Service
          </button>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
            Failed to load services. Please try again later.
          </div>
        )}

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : error ? (
            <p className="py-12 text-center text-sm text-red-600">Failed to load services.</p>
          ) : services?.length === 0 ? (
            <EmptyState
              title="No services yet"
              description="Add your first service to start accepting bookings."
              action={
                <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
                  Add Service
                </button>
              }
            />
          ) : (
            <ul className="divide-y divide-gray-200">
              {services?.map((service: { id: string; name: string; durationMinutes: number; price: number; currency: string }) => (
                <li key={service.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-gray-900">{service.name}</p>
                    <p className="text-sm text-gray-500">
                      {service.durationMinutes} min — {service.currency} {service.price.toLocaleString()}
                    </p>
                  </div>
                  <button className="text-sm text-indigo-600 hover:text-indigo-500">Edit</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
