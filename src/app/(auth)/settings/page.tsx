"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SkeletonCard } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/ToastContext";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface DayHours {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  active: boolean;
}

const DAYS = [
  { name: "Monday", dayOfWeek: 1 },
  { name: "Tuesday", dayOfWeek: 2 },
  { name: "Wednesday", dayOfWeek: 3 },
  { name: "Thursday", dayOfWeek: 4 },
  { name: "Friday", dayOfWeek: 5 },
  { name: "Saturday", dayOfWeek: 6 },
  { name: "Sunday", dayOfWeek: 0 },
];

export default function SettingsPage() {
  const { addToast } = useToast();
  const { data: settings, error, isLoading } = useSWR("/api/settings", fetcher);
  const { data: hoursData, mutate: mutateHours } = useSWR("/api/settings/hours", fetcher);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    description: "",
    timezone: "UTC",
  });
  const [hours, setHours] = useState<DayHours[]>([
    { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", active: true },
    { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", active: true },
    { dayOfWeek: 3, startTime: "09:00", endTime: "17:00", active: true },
    { dayOfWeek: 4, startTime: "09:00", endTime: "17:00", active: true },
    { dayOfWeek: 5, startTime: "09:00", endTime: "17:00", active: true },
    { dayOfWeek: 6, startTime: "09:00", endTime: "17:00", active: true },
    { dayOfWeek: 0, startTime: "10:00", endTime: "16:00", active: false },
  ]);

  useEffect(() => {
    if (settings) {
      setForm({
        name: settings.name || "",
        phone: settings.phone || "",
        email: settings.email || "",
        address: settings.address || "",
        description: settings.description || "",
        timezone: settings.timezone || "UTC",
      });
    }
  }, [settings]);

  useEffect(() => {
    if (hoursData?.hours) {
      const loaded: DayHours[] = DAYS.map((d) => {
        const existing = hoursData.hours.find((h: DayHours) => h.dayOfWeek === d.dayOfWeek);
        return existing || { dayOfWeek: d.dayOfWeek, startTime: "09:00", endTime: "17:00", active: false };
      });
      setHours(loaded);
    }
  }, [hoursData]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setSaveError("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveHours = async () => {
    try {
      const res = await fetch("/api/settings/hours", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hours }),
      });
      if (!res.ok) throw new Error("Failed to save hours");
      mutateHours();
      addToast({ type: "success", title: "Working hours saved" });
    } catch {
      addToast({ type: "error", title: "Failed to save working hours" });
    }
  };

  const updateHour = (dayOfWeek: number, field: keyof DayHours, value: string | boolean) => {
    setHours((prev) =>
      prev.map((h) => (h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h))
    );
  };

  return (
    <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
            Failed to load settings. Please refresh the page.
          </div>
        )}

        {saveError && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {saveError}
          </div>
        )}

        {/* Booking Link */}
        {settings?.id && (
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Your Booking Link
            </h2>
            <p className="text-sm text-gray-600 mb-3">
              Share this link with customers so they can book appointments. Embed it on your website or send it directly.
            </p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={`${typeof window !== "undefined" ? window.location.origin : ""}/widget?orgId=${settings.id}`}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
              />
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/widget?orgId=${settings.id}`);
                  addToast({ type: "success", title: "Booking link copied!" });
                }}
                variant="outline"
              >
                Copy
              </Button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Organization ID: {settings.id}
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Business Information
              </h2>
              <div className="space-y-4 max-w-lg">
                <Input
                  id="name"
                  label="Business Name"
                  placeholder="My Business"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <Input
                  id="phone"
                  label="Phone Number"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                <Input
                  id="email"
                  label="Email"
                  type="email"
                  placeholder="hello@mybusiness.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <Input
                  id="address"
                  label="Address"
                  placeholder="123 Main St, New York"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
                <div className="space-y-1">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Tell customers about your business..."
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Timezone
                  </label>
                  <select
                    value={form.timezone}
                    onChange={(e) =>
                      setForm({ ...form, timezone: e.target.value })
                    }
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  >
                    <optgroup label="Americas">
                      <option value="America/New_York">Eastern Time (US & Canada)</option>
                      <option value="America/Chicago">Central Time (US & Canada)</option>
                      <option value="America/Denver">Mountain Time (US & Canada)</option>
                      <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                      <option value="America/Sao_Paulo">São Paulo (BRT)</option>
                      <option value="America/Mexico_City">Mexico City (CST)</option>
                    </optgroup>
                    <optgroup label="Europe & Africa">
                      <option value="Europe/London">London (GMT/BST)</option>
                      <option value="Europe/Paris">Paris (CET/CEST)</option>
                      <option value="Europe/Berlin">Berlin (CET/CEST)</option>
                      <option value="Europe/Lagos">Lagos (WAT)</option>
                      <option value="Africa/Nairobi">Nairobi (EAT)</option>
                      <option value="Africa/Johannesburg">Johannesburg (SAST)</option>
                      <option value="Africa/Cairo">Cairo (EET)</option>
                    </optgroup>
                    <optgroup label="Asia & Pacific">
                      <option value="Asia/Dubai">Dubai (GST)</option>
                      <option value="Asia/Kolkata">India (IST)</option>
                      <option value="Asia/Singapore">Singapore (SGT)</option>
                      <option value="Asia/Tokyo">Tokyo (JST)</option>
                      <option value="Australia/Sydney">Sydney (AEST)</option>
                    </optgroup>
                  </select>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Working Hours
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Set your business hours. Customers can only book during these times.
              </p>
              <div className="space-y-3">
                {DAYS.map((day) => {
                  const dayHours = hours.find((h) => h.dayOfWeek === day.dayOfWeek);
                  return (
                    <div key={day.dayOfWeek} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                      <span className="w-full sm:w-24 text-sm font-medium text-gray-700">
                        {day.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={dayHours?.startTime || "09:00"}
                          onChange={(e) => updateHour(day.dayOfWeek, "startTime", e.target.value)}
                          disabled={!dayHours?.active}
                          className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-50"
                        />
                        <span className="text-gray-400">to</span>
                        <input
                          type="time"
                          value={dayHours?.endTime || "17:00"}
                          onChange={(e) => updateHour(day.dayOfWeek, "endTime", e.target.value)}
                          disabled={!dayHours?.active}
                          className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-50"
                        />
                      </div>
                      <label className="flex items-center gap-2 sm:ml-auto">
                        <input
                          type="checkbox"
                          checked={dayHours?.active ?? false}
                          onChange={(e) => updateHour(day.dayOfWeek, "active", e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-600">Open</span>
                      </label>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4">
                <Button onClick={handleSaveHours} variant="outline">
                  Save Hours
                </Button>
              </div>
            </div>
          </>
        )}
    </div>
  );
}
