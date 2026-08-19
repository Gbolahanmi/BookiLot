"use client";

import { useState } from "react";
import useSWR from "swr";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/ToastContext";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface StaffMember {
  id: string;
  displayName: string;
  email?: string;
  bio?: string;
}

interface StaffForm {
  displayName: string;
  bio: string;
  email: string;
}

export default function StaffPage() {
  const { addToast } = useToast();
  const { data: staff, error, isLoading, mutate } = useSWR("/api/staff", fetcher);
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [form, setForm] = useState<StaffForm>({
    displayName: "",
    bio: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async () => {
    if (!form.displayName) return;
    setLoading(true);
    setSubmitError("");

    try {
      const url = editingStaff ? `/api/staff/${editingStaff.id}` : "/api/staff";
      const method = editingStaff ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save staff member");
      }

      mutate();
      setForm({ displayName: "", bio: "", email: "" });
      setEditingStaff(null);
      setShowForm(false);
      addToast({ type: "success", title: editingStaff ? "Staff member updated" : "Staff member added" });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (member: StaffMember) => {
    setEditingStaff(member);
    setForm({
      displayName: member.displayName,
      bio: member.bio || "",
      email: member.email || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this staff member?")) return;
    try {
      const res = await fetch(`/api/staff/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove staff member");
      mutate();
      addToast({ type: "success", title: "Staff member removed" });
    } catch {
      addToast({ type: "error", title: "Failed to remove staff member" });
    }
  };

  const handleCancel = () => {
    setForm({ displayName: "", bio: "", email: "" });
    setEditingStaff(null);
    setShowForm(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
          <Button onClick={() => setShowForm(true)}>Add Staff Member</Button>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
            Failed to load staff. Please try again later.
          </div>
        )}

        {showForm && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingStaff ? "Edit Staff Member" : "New Staff Member"}
            </h2>
            {submitError && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {submitError}
              </div>
            )}
            <div className="space-y-4 max-w-lg">
              <Input
                id="displayName"
                label="Display Name"
                placeholder="Jane Smith"
                value={form.displayName}
                onChange={(e) =>
                  setForm({ ...form, displayName: e.target.value })
                }
                required
              />
              <Input
                id="email"
                label="Email"
                type="email"
                placeholder="jane@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <Input
                id="bio"
                label="Bio"
                placeholder="Senior stylist with 5 years experience"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
              <div className="flex gap-3">
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? "Saving..." : editingStaff ? "Save Changes" : "Add Staff"}
                </Button>
                <Button variant="ghost" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : staff?.length === 0 ? (
            <EmptyState
              title="No staff members yet"
              description="Add staff members to assign bookings to specific people."
              action={
                <Button onClick={() => setShowForm(true)} size="sm">
                  Add Staff Member
                </Button>
              }
            />
          ) : (
            <div className="divide-y divide-gray-200">
              {staff?.map((member: StaffMember) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {member.displayName}
                    </p>
                    {member.email && (
                      <p className="text-sm text-gray-500">{member.email}</p>
                    )}
                    {member.bio && (
                      <p className="text-xs text-gray-400 mt-1">{member.bio}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(member)}>
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(member.id)} className="text-red-600 hover:text-red-500">
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
