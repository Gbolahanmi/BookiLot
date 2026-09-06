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
  status: string;
  canEditHours: boolean;
  userId?: string;
  inviteToken?: string | null;
}

export default function StaffPage() {
  const { addToast } = useToast();
  const { data, error, isLoading, mutate } = useSWR("/api/staff", fetcher);
  const staff: StaffMember[] = data?.staff ?? [];
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [form, setForm] = useState({ displayName: "", bio: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleInvite = async () => {
    if (!form.displayName || !form.email) return;
    setLoading(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/staff/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send invitation");
      }

      mutate();
      setForm({ displayName: "", bio: "", email: "" });
      setShowInviteForm(false);
      addToast({ type: "success", title: "Invitation sent!" });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (member: StaffMember) => {
    setEditingStaff(member);
    setForm({
      displayName: member.displayName,
      bio: member.bio || "",
      email: member.email || "",
    });
    setShowInviteForm(true);
  };

  const handleUpdate = async () => {
    if (!editingStaff || !form.displayName) return;
    setLoading(true);
    setSubmitError("");

    try {
      const res = await fetch(`/api/staff/${editingStaff.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update staff member");
      }

      mutate();
      setForm({ displayName: "", bio: "", email: "" });
      setEditingStaff(null);
      setShowInviteForm(false);
      addToast({ type: "success", title: "Staff member updated" });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleHours = async (member: StaffMember) => {
    try {
      const res = await fetch(`/api/staff/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ canEditHours: !member.canEditHours }),
      });
      if (!res.ok) throw new Error("Failed to update");
      mutate();
      addToast({
        type: "success",
        title: member.canEditHours
          ? "Staff can no longer edit hours"
          : "Staff can now edit their hours",
      });
    } catch {
      addToast({ type: "error", title: "Failed to update permissions" });
    }
  };

  const handleRevoke = async (token: string) => {
    if (!confirm("Revoke this invitation?")) return;
    try {
      const res = await fetch(`/api/staff/invite/${token}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to revoke invitation");
      mutate();
      addToast({ type: "success", title: "Invitation revoked" });
    } catch {
      addToast({ type: "error", title: "Failed to revoke invitation" });
    }
  };

  const handleResend = async (token: string) => {
    try {
      const res = await fetch(`/api/staff/invite/${token}/resend`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to resend invitation");
      }
      addToast({ type: "success", title: "Invitation resent!" });
    } catch (err) {
      addToast({
        type: "error",
        title: err instanceof Error ? err.message : "Failed to resend invitation",
      });
    }
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
    setShowInviteForm(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
          <Button onClick={() => setShowInviteForm(true)}>Invite Staff Member</Button>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
            Failed to load staff. Please try again later.
          </div>
        )}

        {showInviteForm && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingStaff ? "Edit Staff Member" : "Invite Staff Member"}
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
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                required
              />
              <Input
                id="email"
                label="Email"
                type="email"
                placeholder="jane@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required={!editingStaff}
                disabled={!!editingStaff}
              />
              <Input
                id="bio"
                label="Bio"
                placeholder="Senior stylist with 5 years experience"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
              <div className="flex gap-3">
                <Button
                  onClick={editingStaff ? handleUpdate : handleInvite}
                  disabled={loading}
                >
                  {loading
                    ? "Saving..."
                    : editingStaff
                      ? "Save Changes"
                      : "Send Invitation"}
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
          ) : staff.length === 0 ? (
            <EmptyState
              title="No staff members yet"
              description="Invite staff members to assign bookings to specific people."
              action={
                <Button onClick={() => setShowInviteForm(true)} size="sm">
                  Invite Staff Member
                </Button>
              }
            />
          ) : (
            <div className="divide-y divide-gray-200">
              {staff.map((member) => (
                <div key={member.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">
                          {member.displayName}
                        </p>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            member.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {member.status === "active" ? "Active" : "Invited"}
                        </span>
                      </div>
                      {member.email && (
                        <p className="text-sm text-gray-500">{member.email}</p>
                      )}
                      {member.bio && (
                        <p className="text-xs text-gray-400 mt-1">{member.bio}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {member.status === "active" && (
                        <label className="flex items-center gap-1.5 text-xs text-gray-600">
                          <input
                            type="checkbox"
                            checked={member.canEditHours}
                            onChange={() => handleToggleHours(member)}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          Edit hours
                        </label>
                      )}
                      {member.status === "invited" && member.inviteToken && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResend(member.inviteToken!)}
                          >
                            Resend
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevoke(member.inviteToken!)}
                            className="text-red-600 hover:text-red-500"
                          >
                            Revoke
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(member)}>
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(member.id)}
                        className="text-red-600 hover:text-red-500"
                      >
                        Delete
                      </Button>
                    </div>
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
