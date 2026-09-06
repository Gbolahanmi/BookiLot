"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { StaffLayout } from "@/components/layout/staff-layout";
import { Button } from "@/components/ui/button";
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

export default function StaffHoursPage() {
  const { addToast } = useToast();
  const { data, error, isLoading } = useSWR("/api/staff/hours", fetcher);
  const [hours, setHours] = useState<DayHours[]>([]);
  const [canEdit, setCanEdit] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data?.hours) {
      const loaded: DayHours[] = DAYS.map((d) => {
        const existing = data.hours.find((h: DayHours) => h.dayOfWeek === d.dayOfWeek);
        return existing || { dayOfWeek: d.dayOfWeek, startTime: "09:00", endTime: "17:00", active: false };
      });
      setHours(loaded);
    }
    if (data?.canEditHours !== undefined) {
      setCanEdit(data.canEditHours);
    }
  }, [data]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/staff/hours", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hours }),
      });
      if (!res.ok) throw new Error("Failed to save");
      addToast({ type: "success", title: "Hours saved" });
    } catch {
      addToast({ type: "error", title: "Failed to save hours" });
    } finally {
      setSaving(false);
    }
  };

  const updateHour = (dayOfWeek: number, field: keyof DayHours, value: string | boolean) => {
    setHours((prev) =>
      prev.map((h) => (h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h))
    );
  };

  return (
    <StaffLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">My Hours</h1>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
            Failed to load hours. Please try again later.
          </div>
        )}

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          {isLoading ? (
            <SkeletonCard />
          ) : !canEdit ? (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-500">
                Your schedule is managed by the business owner.
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">
                Set your available hours. These times will be shown to customers booking with you.
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
                        <span className="text-sm text-gray-600">Available</span>
                      </label>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Hours"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </StaffLayout>
  );
}
