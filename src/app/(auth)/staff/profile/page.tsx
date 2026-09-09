"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SkeletonCard } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/ToastContext";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function StaffProfilePage() {
  const { addToast } = useToast();
  const { data, error, isLoading } = useSWR("/api/staff/profile", fetcher);
  const [form, setForm] = useState({ displayName: "", bio: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data?.staff) {
      setForm({
        displayName: data.staff.displayName || "",
        bio: data.staff.bio || "",
      });
    }
  }, [data]);

  const handleSave = async () => {
    if (!form.displayName) return;
    setSaving(true);
    try {
      const res = await fetch("/api/staff/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to save");
      addToast({ type: "success", title: "Profile updated" });
    } catch {
      addToast({ type: "error", title: "Failed to update profile" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
            Failed to load profile. Please try again later.
          </div>
        )}

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          {isLoading ? (
            <SkeletonCard />
          ) : (
            <div className="space-y-4 max-w-lg">
              <Input
                id="displayName"
                label="Display Name"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                required
              />
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Bio</label>
                <textarea
                  rows={3}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Tell customers about yourself..."
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                />
              </div>
              <div>
                <p className="text-sm text-gray-500">
                  Email: <span className="font-medium text-gray-700">{data?.staff?.email || "Not set"}</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Contact the business owner to change your email address.
                </p>
              </div>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </div>
      </div>
  );
}
