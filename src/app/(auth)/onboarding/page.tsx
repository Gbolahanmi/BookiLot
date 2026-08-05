"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";

type Step = 1 | 2 | 3;

export default function OnboardingPage() {
  const { data: session } = useSession();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [business, setBusiness] = useState({
    name: "",
    phone: "",
    address: "",
    timezone: "Africa/Lagos",
  });

  const [services, setServices] = useState([
    { name: "", duration: "30", price: "", description: "" },
  ]);

  const [hours, setHours] = useState(
    Object.fromEntries(
      ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => [
        d,
        { open: "09:00", close: "17:00", active: d !== "Sun" },
      ])
    )
  );

  const addService = () => {
    setServices([...services, { name: "", duration: "30", price: "", description: "" }]);
  };

  const updateService = (
    index: number,
    field: string,
    value: string
  ) => {
    const updated = [...services];
    (updated[index] as Record<string, string>)[field] = value;
    setServices(updated);
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const handleComplete = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business: {
            ...business,
            email: session?.user?.email,
          },
          services: services.filter((s) => s.name),
          workingHours: hours,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to complete setup");
        setLoading(false);
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Bookilot</h1>
          <p className="text-gray-500 mt-2">
            Let&apos;s set up your business in a few steps
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= s
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`h-0.5 w-12 ${
                    step > s ? "bg-indigo-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          {/* Step 1: Business Info */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Business Information
              </h2>
              {session?.user?.email && (
                <p className="text-sm text-gray-500">
                  Business email: <span className="font-medium text-gray-700">{session.user.email}</span>
                </p>
              )}
              <Input
                id="name"
                label="Business Name"
                placeholder="My Salon"
                value={business.name}
                onChange={(e) =>
                  setBusiness({ ...business, name: e.target.value })
                }
                required
              />
              <Input
                id="phone"
                label="Phone Number"
                type="tel"
                placeholder="+234 xxx xxx xxxx"
                value={business.phone}
                onChange={(e) =>
                  setBusiness({ ...business, phone: e.target.value })
                }
                required
              />
              <Input
                id="address"
                label="Address (optional)"
                placeholder="123 Main St, Lagos"
                value={business.address}
                onChange={(e) =>
                  setBusiness({ ...business, address: e.target.value })
                }
              />
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Timezone</label>
                <select
                  value={business.timezone}
                  onChange={(e) =>
                    setBusiness({ ...business, timezone: e.target.value })
                  }
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                  <option value="Africa/Accra">Africa/Accra (GMT)</option>
                  <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                  <option value="Africa/Johannesburg">Africa/Johannesburg (SAST)</option>
                  <option value="Africa/Cairo">Africa/Cairo (EET)</option>
                </select>
              </div>
              <div className="pt-4">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!business.name || !business.phone}
                  className="w-full"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Services */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Add Your Services
              </h2>
              <p className="text-sm text-gray-500">
                Add at least one service customers can book.
              </p>

              {services.map((service, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-gray-200 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Service {i + 1}
                    </span>
                    {services.length > 1 && (
                      <button
                        onClick={() => removeService(i)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <Input
                    id={`svc-name-${i}`}
                    placeholder="e.g. Haircut"
                    value={service.name}
                    onChange={(e) => updateService(i, "name", e.target.value)}
                  />
                  <Input
                    id={`svc-desc-${i}`}
                    placeholder="Brief description (optional)"
                    value={service.description}
                    onChange={(e) => updateService(i, "description", e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-700">
                        Duration (min)
                      </label>
                      <select
                        value={service.duration}
                        onChange={(e) =>
                          updateService(i, "duration", e.target.value)
                        }
                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      >
                        {[15, 30, 45, 60, 90, 120].map((m) => (
                          <option key={m} value={m}>
                            {m} min
                          </option>
                        ))}
                      </select>
                    </div>
                    <Input
                      id={`svc-price-${i}`}
                      label="Price (₦)"
                      type="number"
                      placeholder="0"
                      value={service.price}
                      onChange={(e) => updateService(i, "price", e.target.value)}
                    />
                  </div>
                </div>
              ))}

              <Button variant="ghost" onClick={addService} className="w-full">
                + Add Another Service
              </Button>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!services.some((s) => s.name)}
                  className="flex-1"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Working Hours */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Working Hours
              </h2>
              <p className="text-sm text-gray-500">
                When is your business open for bookings?
              </p>

              <div className="space-y-3">
                {Object.entries(hours).map(([day, config]) => (
                  <div key={day} className="flex items-center gap-3">
                    <span className="w-10 text-sm font-medium text-gray-700">
                      {day}
                    </span>
                    <input
                      type="time"
                      value={config.open}
                      onChange={(e) =>
                        setHours({
                          ...hours,
                          [day]: { ...config, open: e.target.value },
                        })
                      }
                      disabled={!config.active}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-50"
                    />
                    <span className="text-gray-400">to</span>
                    <input
                      type="time"
                      value={config.close}
                      onChange={(e) =>
                        setHours({
                          ...hours,
                          [day]: { ...config, close: e.target.value },
                        })
                      }
                      disabled={!config.active}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-50"
                    />
                    <label className="flex items-center gap-2 ml-auto">
                      <input
                        type="checkbox"
                        checked={config.active}
                        onChange={(e) =>
                          setHours({
                            ...hours,
                            [day]: { ...config, active: e.target.checked },
                          })
                        }
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </label>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button onClick={handleComplete} disabled={loading} className="flex-1">
                  {loading ? "Setting up..." : "Complete Setup"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
