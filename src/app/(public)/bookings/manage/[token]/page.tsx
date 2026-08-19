"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/ToastContext";

interface Booking {
  id: string;
  startsAt: string;
  endsAt: string;
  status: string;
  channel: string;
  createdAt: string;
  serviceName: string;
  serviceDuration: number;
  staffName: string | null;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  confirmed: { bg: "bg-green-100", text: "text-green-800", label: "Confirmed" },
  pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
  cancelled: { bg: "bg-red-100", text: "text-red-800", label: "Cancelled" },
  completed: { bg: "bg-blue-100", text: "text-blue-800", label: "Completed" },
  no_show: { bg: "bg-gray-100", text: "text-gray-800", label: "No Show" },
};

export default function BookingManagePage() {
  const params = useParams();
  const token = params.token as string;
  const { addToast } = useToast();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/bookings/manage/${token}`)
      .then((r) => {
        if (!r.ok) throw new Error("Booking not found");
        return r.json();
      })
      .then((data) => setBooking(data.booking))
      .catch(() => setError("Booking not found or invalid link."))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/bookings/manage/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      if (!res.ok) {
        const data = await res.json();
        addToast({ type: "error", title: data.error || "Failed to cancel booking" });
        return;
      }
      const data = await res.json();
      setBooking(data.booking);
      addToast({ type: "success", title: "Booking cancelled" });
    } catch {
      addToast({ type: "error", title: "Something went wrong" });
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">Loading booking details...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">Booking Not Found</p>
          <p className="mt-2 text-sm text-gray-500">{error || "This booking link is invalid or has expired."}</p>
        </div>
      </div>
    );
  }

  const statusStyle = STATUS_STYLES[booking.status] || STATUS_STYLES.pending;
  const canCancel = booking.status === "confirmed" || booking.status === "pending";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
        <h1 className="text-lg font-semibold text-gray-900">Booking Details</h1>
      </div>

      <div className="mx-auto max-w-lg p-4 sm:p-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          {/* Status badge */}
          <div className="mb-6">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusStyle.bg} ${statusStyle.text}`}>
              {statusStyle.label}
            </span>
          </div>

          {/* Service info */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">{booking.serviceName}</h2>
            <p className="mt-1 text-sm text-gray-500">{booking.serviceDuration} minutes</p>
          </div>

          {/* Date & time */}
          <div className="mb-6 space-y-2">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-gray-500">Date:</span>
              <span className="font-medium text-gray-900">{formatDate(booking.startsAt)}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-gray-500">Time:</span>
              <span className="font-medium text-gray-900">
                {formatTime(booking.startsAt)} – {formatTime(booking.endsAt)}
              </span>
            </div>
            {booking.staffName && (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-500">Staff:</span>
                <span className="font-medium text-gray-900">{booking.staffName}</span>
              </div>
            )}
          </div>

          {/* Customer info */}
          <div className="mb-6 border-t border-gray-100 pt-4">
            <p className="text-sm font-medium text-gray-500 mb-2">Your Information</p>
            <div className="space-y-1 text-sm">
              <p className="text-gray-900">{booking.customerName}</p>
              {booking.customerEmail && <p className="text-gray-500">{booking.customerEmail}</p>}
              {booking.customerPhone && <p className="text-gray-500">{booking.customerPhone}</p>}
            </div>
          </div>

          {/* Cancel button */}
          {canCancel && (
            <div className="border-t border-gray-100 pt-4">
              <Button
                onClick={handleCancel}
                disabled={cancelling}
                variant="outline"
                className="w-full border-red-200 text-red-600 hover:bg-red-50"
              >
                {cancelling ? "Cancelling..." : "Cancel Booking"}
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="mt-4 text-center text-xs text-gray-400">
          Booking reference: {booking.id.slice(0, 8)}
        </p>
      </div>
    </div>
  );
}
