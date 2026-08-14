"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Service {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  priceCents: number;
  currency: string;
}

interface TimeSlot {
  startsAt: string;
  endsAt: string;
  staffMemberId: string | null;
}

type Step = "service" | "datetime" | "details" | "confirm";

function WidgetContent() {
  const searchParams = useSearchParams();
  const orgId = searchParams.get("orgId") || "";

  const [step, setStep] = useState<Step>("service");
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [recommendedSlots, setRecommendedSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bookingComplete, setBookingComplete] = useState(false);
  const [manageUrl, setManageUrl] = useState("");

  useEffect(() => {
    if (!orgId) return;
    fetch(`/api/widget/services?orgId=${orgId}`)
      .then((r) => r.json())
      .then((data) => setServices(data.services || []))
      .catch(() => {});
  }, [orgId]);

  const fetchSlots = useCallback(async () => {
    if (!orgId || !selectedService || !selectedDate) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/availability?orgId=${orgId}&serviceId=${selectedService.id}&date=${selectedDate}`
      );
      const data = await res.json();
      setSlots(data.slots || []);
      setRecommendedSlots(data.recommended || []);
    } catch {
      setError("Failed to load available times");
    } finally {
      setLoading(false);
    }
  }, [orgId, selectedService, selectedDate]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setStep("datetime");
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setStep("details");
  };

  const handleBookingSubmit = async () => {
    if (!selectedService || !selectedSlot || !orgId || !name || !phone) return;
    setLoading(true);
    setError("");

    try {
      const bookingRes = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: orgId,
          serviceId: selectedService.id,
          customerName: name,
          customerEmail: email || undefined,
          customerPhone: phone,
          startsAt: selectedSlot.startsAt,
          channel: "web",
        }),
      });

      const data = await bookingRes.json();

      if (!bookingRes.ok) {
        setError(data.error || "Booking failed");
        return;
      }

      setManageUrl(`/bookings/manage/${data.booking.manageToken}`);
      setBookingComplete(true);
      setStep("confirm");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (cents: number, currency: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  if (!orgId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="text-center text-gray-500">
          <p className="text-sm">Widget not configured</p>
          <p className="text-xs mt-1">
            Missing organization ID. Contact the business for the correct
            booking link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
        <h1 className="text-lg font-semibold text-gray-900">
          {bookingComplete ? "Booking Confirmed" : "Book an Appointment"}
        </h1>
      </div>

      <div className="p-4 sm:p-6">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {step === "service" && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">Select a service</p>
            {services.length === 0 ? (
              <div className="py-8 text-center text-gray-400">
                <p className="text-sm">
                  {loading ? "Loading services..." : "No services available"}
                </p>
              </div>
            ) : (
              services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleServiceSelect(service)}
                  className="w-full rounded-lg border border-gray-200 p-4 text-left transition-colors hover:border-indigo-300 hover:bg-indigo-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {service.name}
                      </p>
                      {service.description && (
                        <p className="mt-1 text-sm text-gray-500">
                          {service.description}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-400">
                        {service.durationMinutes} min
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {formatPrice(service.priceCents, service.currency)}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {step === "datetime" && (
          <div className="space-y-4">
            <button
              onClick={() => setStep("service")}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              &larr; Back to services
            </button>

            <p className="text-sm text-gray-500">
              Select a date for{" "}
              <span className="font-medium text-gray-900">
                {selectedService?.name}
              </span>
            </p>

            <Input
              type="date"
              label="Date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />

            {recommendedSlots.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">
                  Recommended times
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {recommendedSlots.map((slot, i) => (
                    <button
                      key={i}
                      onClick={() => handleSlotSelect(slot)}
                      className={cn(
                        "rounded-lg border p-2 text-center text-sm font-medium transition-colors",
                        selectedSlot === slot
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-gray-200 hover:border-indigo-300"
                      )}
                    >
                      {formatTime(slot.startsAt)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedDate && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">
                  Available times
                </p>
                {slots.length === 0 ? (
                  <p className="text-sm text-gray-400 py-4 text-center">
                    {loading
                      ? "Loading..."
                      : "No slots available for this date"}
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {slots.map((slot, i) => (
                      <button
                        key={i}
                        onClick={() => handleSlotSelect(slot)}
                        className={cn(
                          "rounded-lg border p-2 text-center text-sm font-medium transition-colors",
                          selectedSlot === slot
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                            : "border-gray-200 hover:border-indigo-300"
                        )}
                      >
                        {formatTime(slot.startsAt)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {step === "details" && (
          <div className="space-y-4">
            <button
              onClick={() => setStep("datetime")}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              &larr; Back to times
            </button>

            <div className="rounded-lg bg-gray-50 p-3 text-sm">
              <p className="font-medium text-gray-900">
                {selectedService?.name}
              </p>
              <p className="text-gray-500">
                {selectedDate && formatDate(selectedDate)} at{" "}
                {selectedSlot && formatTime(selectedSlot.startsAt)}
              </p>
            </div>

            <Input
              id="name"
              label="Full Name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              id="phone"
              label="Phone Number"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <Input
              id="email"
              label="Email (optional)"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Button
              onClick={handleBookingSubmit}
              disabled={!name || !phone || loading}
              className="w-full"
            >
              {loading ? "Booking..." : "Confirm Booking"}
            </Button>
          </div>
        )}

        {step === "confirm" && bookingComplete && (
          <div className="space-y-4 py-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              You&apos;re all set!
            </h2>
            <p className="text-sm text-gray-500">
              Your booking has been confirmed. You&apos;ll receive a
              confirmation shortly.
            </p>
            <div className="rounded-lg bg-gray-50 p-4 text-sm">
              <p className="font-medium text-gray-900">
                {selectedService?.name}
              </p>
              <p className="text-gray-500">
                {selectedDate && formatDate(selectedDate)} at{" "}
                {selectedSlot && formatTime(selectedSlot.startsAt)}
              </p>
            </div>
            <p className="text-xs text-gray-400">
              Manage your booking: {manageUrl}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function WidgetPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      }
    >
      <WidgetContent />
    </Suspense>
  );
}
