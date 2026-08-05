"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SkeletonCard } from "@/components/ui/skeleton";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function SettingsPage() {
  const { data: settings, error, isLoading } = useSWR("/api/settings", fetcher);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    description: "",
    timezone: "Africa/Lagos",
  });

  useEffect(() => {
    if (settings) {
      setForm({
        name: settings.name || "",
        phone: settings.phone || "",
        email: settings.email || "",
        address: settings.address || "",
        description: settings.description || "",
        timezone: settings.timezone || "Africa/Lagos",
      });
    }
  }, [settings]);

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

  return (
    <DashboardLayout>
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
                  placeholder="+234 xxx xxx xxxx"
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
                  placeholder="123 Main St, Lagos"
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
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => (
                  <div key={day} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                    <span className="w-full sm:w-24 text-sm font-medium text-gray-700">
                      {day}
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        defaultValue="09:00"
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      />
                      <span className="text-gray-400">to</span>
                      <input
                        type="time"
                        defaultValue="17:00"
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <label className="flex items-center gap-2 sm:ml-auto">
                      <input
                        type="checkbox"
                        defaultChecked={day !== "Sunday"}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-600">Open</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
