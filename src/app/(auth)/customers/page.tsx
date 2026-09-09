"use client";

import { useState } from "react";
import useSWR from "swr";
import { Input } from "@/components/ui/input";
import { SkeletonTable } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

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
  const { data, error, isLoading } = useSWR("/api/customers", fetcher);
  const customers: Customer[] = data?.customers ?? [];

  const filtered: Customer[] = customers.filter(
    (c: Customer) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <div className="w-full sm:w-64">
            <Input
              id="search"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
            Failed to load customers. Please try again later.
          </div>
        )}

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          {isLoading ? (
            <div className="p-6">
              <SkeletonTable rows={5} />
            </div>
          ) : error ? (
            <p className="py-12 text-center text-sm text-red-600">Failed to load customers.</p>
          ) : filtered.length === 0 ? (
            <EmptyState
              title={search ? "No customers match your search" : "No customers yet"}
              description="Customers will appear here after their first booking."
            />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 font-medium text-gray-500">Name</th>
                      <th className="px-4 py-3 font-medium text-gray-500">Phone</th>
                      <th className="px-4 py-3 font-medium text-gray-500">Bookings</th>
                      <th className="px-4 py-3 font-medium text-gray-500">No-Shows</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filtered.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900">{customer.name}</p>
                            <p className="text-xs text-gray-500">{customer.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{customer.phone}</td>
                        <td className="px-4 py-3 text-gray-600">{customer.totalBookings}</td>
                        <td className="px-4 py-3">
                          <span className={customer.noShowCount > 0 ? "text-red-600 font-medium" : "text-gray-600"}>
                            {customer.noShowCount}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile card list */}
              <div className="divide-y divide-gray-200 md:hidden">
                {filtered.map((customer) => (
                  <div key={customer.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{customer.name}</p>
                        <p className="text-sm text-gray-500">{customer.email}</p>
                        <p className="text-sm text-gray-500">{customer.phone}</p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-gray-600">{customer.totalBookings} bookings</p>
                        <p className={customer.noShowCount > 0 ? "text-red-600 font-medium" : "text-gray-600"}>
                          {customer.noShowCount} no-shows
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
    </div>
  );
}
