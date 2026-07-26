import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Today's Bookings", value: "0", change: "+0%" },
            { label: "This Week", value: "0", change: "+0%" },
            { label: "Revenue (Month)", value: "₦0", change: "+0%" },
            { label: "No-Show Rate", value: "0%", change: "-0%" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-green-600">{stat.change}</p>
            </div>
          ))}
        </div>

        {/* Today's Bookings */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Today&apos;s Bookings
          </h2>
          <div className="text-center py-12 text-gray-500">
            <p className="text-sm">No bookings yet</p>
            <p className="text-xs mt-1">
              Bookings will appear here once customers start booking.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
