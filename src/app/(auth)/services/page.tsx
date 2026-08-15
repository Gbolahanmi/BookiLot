"use client";

import { useState } from "react";
import useSWR from "swr";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ServiceModal } from "@/components/services/service-modal";

interface Service {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  priceCents: number;
  currency: string;
  bufferMinutes: number;
  depositRequired: boolean;
  depositAmountCents: number;
  active: boolean;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ServicesPage() {
  const { data, error, isLoading, mutate } = useSWR("/api/services", fetcher);
  const services: Service[] = data?.services ?? [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);

  function handleAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  function handleEdit(service: Service) {
    setEditing(service);
    setModalOpen(true);
  }

  function formatPrice(priceCents: number, currency: string) {
    const dollars = priceCents / 100;
    return dollars > 0 ? `$${dollars.toFixed(2)}` : "Free";
  }

  function formatDuration(mins: number) {
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <button
            onClick={handleAdd}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
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
          ) : services.length === 0 ? (
            <EmptyState
              title="No services yet"
              description="Add your first service to start accepting bookings."
              action={
                <button
                  onClick={handleAdd}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                >
                  Add Service
                </button>
              }
            />
          ) : (
            <ul className="divide-y divide-gray-200">
              {services.map((service) => (
                <li key={service.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{service.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatDuration(service.durationMinutes)} — {formatPrice(service.priceCents, service.currency)}
                    </p>
                    {service.description && (
                      <p className="mt-1 text-xs text-gray-400 truncate">{service.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleEdit(service)}
                    className="ml-4 shrink-0 text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    Edit
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <ServiceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        service={editing}
        onSaved={() => mutate()}
      />
    </DashboardLayout>
  );
}
