import { DashboardLayout } from "@/components/layout/dashboard-layout";

export const metadata = { title: "Bookings — Bookilot" };

export default function BookingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <div className="flex gap-2">
            <button className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
              Calendar
            </button>
            <button className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
              List
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="text-center py-12 text-gray-500">
            <p className="text-sm">No bookings yet</p>
            <p className="text-xs mt-1">
              Bookings will appear here as customers book appointments.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
