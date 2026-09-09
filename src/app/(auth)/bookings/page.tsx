"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
} from "date-fns";
import { SkeletonTable } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/ToastContext";
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
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function BookingsPage() {
  const { addToast } = useToast();
  const [view, setView] = useState<"list" | "calendar">("list");
  const { data, error, isLoading, mutate } = useSWR("/api/bookings", fetcher);
  const bookings: Booking[] = data?.bookings ?? [];
  const [cancelling, setCancelling] = useState<string | null>(null);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const bookingsByDay = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const b of bookings) {
      const key = format(parseISO(b.startsAt), "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(b);
    }
    return map;
  }, [bookings]);

  const selectedDayBookings = useMemo(() => {
    if (!selectedDay) return [];
    const key = format(selectedDay, "yyyy-MM-dd");
    return bookingsByDay.get(key) ?? [];
  }, [selectedDay, bookingsByDay]);

  async function handleCancel(id: string) {
    if (!confirm("Cancel this booking?")) return;
    setCancelling(id);
    try {
      const res = await fetch(`/api/bookings/${id}/cancel`, {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json();
        addToast({
          type: "error",
          title: err.error || "Failed to cancel booking",
        });
        return;
      }
      addToast({ type: "success", title: "Booking cancelled" });
      mutate();
    } catch {
      addToast({ type: "error", title: "Something went wrong" });
    } finally {
      setCancelling(null);
    }
  }

  return (
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
            <p className="py-12 text-center text-sm text-red-600">
              Failed to load bookings.
            </p>
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
                    <th className="px-4 py-3 font-medium text-gray-500">
                      Customer
                    </th>
                    <th className="px-4 py-3 font-medium text-gray-500">
                      Service
                    </th>
                    <th className="px-4 py-3 font-medium text-gray-500">
                      Staff
                    </th>
                    <th className="px-4 py-3 font-medium text-gray-500">
                      Date & Time
                    </th>
                    <th className="px-4 py-3 font-medium text-gray-500">
                      Status
                    </th>
                    <th className="px-4 py-3 font-medium text-gray-500">
                      Channel
                    </th>
                    <th className="px-4 py-3 font-medium text-gray-500"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings.map((b) => {
                    const colors = STATUS_COLORS[b.status] || STATUS_COLORS.pending;
                    return (
                      <tr key={b.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">
                            {b.customerName}
                          </p>
                          {b.customerEmail && (
                            <p className="text-xs text-gray-500">
                              {b.customerEmail}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {b.serviceName}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {b.staffName || "\u2014"}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-gray-900">{formatDate(b.startsAt)}</p>
                          <p className="text-xs text-gray-500">
                            {formatTime(b.startsAt)}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${colors.bg} ${colors.text}`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 capitalize">
                          {b.channel}
                        </td>
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
            <div className="flex flex-col lg:flex-row">
              <div className="flex-1 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {format(currentMonth, "MMMM yyyy")}
                  </h2>
                  <button
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-px bg-gray-200 text-center text-xs font-medium text-gray-500">
                  {WEEKDAYS.map((d) => (
                    <div key={d} className="bg-gray-50 py-2">
                      {d}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-px bg-gray-200">
                  {calendarDays.map((day) => {
                    const key = format(day, "yyyy-MM-dd");
                    const dayBookings = bookingsByDay.get(key) ?? [];
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isSelected = selectedDay && isSameDay(day, selectedDay);
                    const isToday = isSameDay(day, new Date());

                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedDay(day)}
                        className={`relative flex min-h-[4rem] flex-col bg-white p-1 text-left transition-colors hover:bg-indigo-50 ${
                          !isCurrentMonth ? "text-gray-300" : "text-gray-700"
                        } ${isSelected ? "ring-2 ring-inset ring-indigo-600" : ""}`}
                      >
                        <span
                          className={`ml-1 mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                            isToday
                              ? "bg-indigo-600 text-white"
                              : ""
                          }`}
                        >
                          {format(day, "d")}
                        </span>
                        <div className="mt-1 flex flex-wrap gap-0.5">
                          {dayBookings.slice(0, 3).map((b) => {
                            const colors = STATUS_COLORS[b.status] || STATUS_COLORS.pending;
                            return (
                              <span
                                key={b.id}
                                title={`${b.customerName} — ${b.serviceName}`}
                                className={`block h-1.5 w-full rounded-full ${colors.dot}`}
                              />
                            );
                          })}
                        </div>
                        {dayBookings.length > 3 && (
                          <span className="mt-auto text-[10px] text-gray-400">
                            +{dayBookings.length - 3} more
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="w-full border-t bg-gray-50 p-4 lg:w-80 lg:border-t-0 lg:border-l">
                {selectedDay ? (
                  <>
                    <h3 className="mb-3 text-sm font-semibold text-gray-900">
                      {format(selectedDay, "EEEE, MMMM d, yyyy")}
                    </h3>
                    {selectedDayBookings.length === 0 ? (
                      <p className="text-sm text-gray-500">No bookings this day.</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedDayBookings.map((b) => {
                          const colors = STATUS_COLORS[b.status] || STATUS_COLORS.pending;
                          return (
                            <div
                              key={b.id}
                              className="rounded-lg border border-gray-200 bg-white p-3"
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {b.customerName}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {b.serviceName}
                                  </p>
                                </div>
                                <span
                                  className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${colors.bg} ${colors.text}`}
                                >
                                  {b.status}
                                </span>
                              </div>
                              <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                                <span>
                                  {formatTime(b.startsAt)} &ndash; {formatTime(b.endsAt)}
                                </span>
                                {b.staffName && (
                                  <>
                                    <span className="text-gray-300">|</span>
                                    <span>{b.staffName}</span>
                                  </>
                                )}
                              </div>
                              {b.status === "confirmed" && (
                                <button
                                  onClick={() => handleCancel(b.id)}
                                  disabled={cancelling === b.id}
                                  className="mt-2 text-xs text-red-600 hover:text-red-500 disabled:opacity-50"
                                >
                                  {cancelling === b.id ? "Cancelling..." : "Cancel"}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-500">
                    Select a day to view bookings.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
    </div>
  );
}
