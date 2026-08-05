"use client";

import { useState } from "react";
import Link from "next/link";

const SERVICES = [
  { id: 1, name: "Haircut", duration: "30 min", price: "₦3,000", icon: "✂️" },
  { id: 2, name: "Braiding", duration: "2 hrs", price: "₦15,000", icon: "💇" },
  { id: 3, name: "Manicure", duration: "45 min", price: "₦2,500", icon: "💅" },
  { id: 4, name: "Facial", duration: "1 hr", price: "₦5,000", icon: "✨" },
];

const TIME_SLOTS = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM",
];

function getDates() {
  const dates = [];
  const today = new Date();
  for (let i = 1; i <= 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push({
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      date: d.getDate(),
      month: d.toLocaleDateString("en-US", { month: "short" }),
      full: d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
    });
  }
  return dates;
}

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pt-24 pb-16 lg:pt-32 lg:pb-24">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.15),transparent)]" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center">
          {/* Headline */}
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Never miss another booking
            <br />
            <span className="text-indigo-600">even when you don&apos;t pick up.</span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Let customers book by web, text, or a phone call answered by your AI
            receptionist — synced to one calendar.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-500 hover:shadow-md active:scale-95"
            >
              Start free trial
            </Link>
            <button className="flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Watch 90-second demo
            </button>
          </div>

          {/* Trust line */}
          <p className="mt-4 text-sm text-gray-500">
            Free for up to 50 bookings/month. No card required.
          </p>
        </div>

        {/* Interactive Widget Demo */}
        <div className="mt-16 flex justify-center">
          <BookingDemo />
        </div>

        {/* Social proof */}
        <div className="mt-16 text-center">
          <p className="text-sm font-medium text-gray-400">
            Trusted by 2,500+ businesses across Nigeria
          </p>
          <div className="mt-4 flex items-center justify-center gap-8 text-gray-300">
            {["Chidi's Salon", "Lagos Clinic", "Relax Spa", "FitZone Gym", "Style Studio"].map(
              (name) => (
                <span key={name} className="text-sm font-semibold">
                  {name}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function BookingDemo() {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<(typeof SERVICES)[0] | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const dates = getDates();

  function handleServiceClick(service: (typeof SERVICES)[0]) {
    setSelectedService(service);
    setStep(2);
  }

  function handleDateClick(date: string) {
    setSelectedDate(date);
    setSelectedTime(null);
  }

  function handleTimeClick(time: string) {
    setSelectedTime(time);
    setStep(3);
  }

  function handleConfirm() {
    setConfirmed(true);
  }

  function handleReset() {
    setStep(1);
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setConfirmed(false);
  }

  return (
    <div className="w-full max-w-md">
      {/* Phone frame */}
      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl">
        {/* Notch */}
        <div className="flex justify-center bg-gray-50 py-2">
          <div className="h-1.5 w-16 rounded-full bg-gray-200" />
        </div>

        {/* Step indicator */}
        {!confirmed && (
          <div className="flex items-center justify-center gap-2 bg-gray-50 px-6 py-3">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                    step >= s
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`h-0.5 w-8 transition-colors ${
                      step > s ? "bg-indigo-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {confirmed ? (
            /* Step 3: Success */
            <div className="flex flex-col items-center py-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Booking confirmed!
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {selectedService?.name} — {selectedDate} at {selectedTime}
              </p>
              <button
                onClick={handleReset}
                className="mt-6 text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Book another
              </button>
            </div>
          ) : step === 1 ? (
            /* Step 1: Pick Service */
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Pick a service
              </h3>
              <div className="mt-4 space-y-2">
                {SERVICES.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleServiceClick(service)}
                    className="flex w-full items-center justify-between rounded-xl border border-gray-200 p-4 text-left transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-sm active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{service.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {service.name}
                        </p>
                        <p className="text-xs text-gray-500">{service.duration}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-indigo-600">
                      {service.price}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : step === 2 ? (
            /* Step 2: Pick Date & Time */
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Pick a date
              </h3>
              {/* Date grid */}
              <div className="mt-4 grid grid-cols-7 gap-1">
                {dates.map((d) => (
                  <button
                    key={d.date}
                    onClick={() => handleDateClick(d.full)}
                    className={`flex flex-col items-center rounded-lg p-2 text-xs transition-all ${
                      selectedDate === d.full
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <span className="font-medium">{d.day}</span>
                    <span className="text-lg font-bold">{d.date}</span>
                  </button>
                ))}
              </div>

              {/* Time slots */}
              {selectedDate && (
                <>
                  <h3 className="mt-6 text-base font-semibold text-gray-900">
                    Pick a time
                  </h3>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {TIME_SLOTS.map((time) => (
                      <button
                        key={time}
                        onClick={() => handleTimeClick(time)}
                        className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                          selectedTime === time
                            ? "border-indigo-600 bg-indigo-600 text-white"
                            : "border-gray-200 text-gray-600 hover:border-indigo-300 hover:bg-indigo-50"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Step 3: Confirm */
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Confirm your booking
              </h3>
              <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Service</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedService?.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Date</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedDate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Time</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                    <span className="text-sm text-gray-500">Price</span>
                    <span className="text-sm font-semibold text-indigo-600">
                      {selectedService?.price}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleConfirm}
                className="mt-4 w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-500 hover:shadow-md active:scale-[0.98]"
              >
                Confirm Booking
              </button>
              <button
                onClick={() => setStep(2)}
                className="mt-2 w-full py-2 text-sm text-gray-500 hover:text-gray-700"
              >
                Go back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
