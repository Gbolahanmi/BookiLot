import { DashboardLayout } from "@/components/layout/dashboard-layout";

export const metadata = { title: "Services — Bookilot" };

export default function ServicesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
            Add Service
          </button>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="text-center py-12 text-gray-500">
            <p className="text-sm">No services yet</p>
            <p className="text-xs mt-1">
              Add your first service to start accepting bookings.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
