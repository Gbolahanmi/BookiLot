"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Input } from "@/components/ui/input";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  noShowCount: number;
  totalBookings: number;
}

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [customers] = useState<Customer[]>([]);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <div className="w-64">
            <Input
              id="search"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-sm">
                {search ? "No customers match your search" : "No customers yet"}
              </p>
              <p className="text-xs mt-1">
                Customers will appear here after their first booking.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-500">Name</th>
                  <th className="px-4 py-3 font-medium text-gray-500">
                    Phone
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500">
                    Bookings
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500">
                    No-Shows
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          {customer.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {customer.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {customer.phone}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {customer.totalBookings}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          customer.noShowCount > 0
                            ? "text-red-600 font-medium"
                            : "text-gray-600"
                        }
                      >
                        {customer.noShowCount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
