"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface StaffForm {
  displayName: string;
  bio: string;
  email: string;
}

export default function StaffPage() {
  const [staff, setStaff] = useState<Array<{ id: string } & StaffForm>>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<StaffForm>({
    displayName: "",
    bio: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.displayName) return;
    setLoading(true);

    // TODO: Call API
    const newStaff = { id: crypto.randomUUID(), ...form };
    setStaff([...staff, newStaff]);
    setForm({ displayName: "", bio: "", email: "" });
    setShowForm(false);
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
          <Button onClick={() => setShowForm(true)}>Add Staff Member</Button>
        </div>

        {showForm && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              New Staff Member
            </h2>
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
                  {loading ? "Adding..." : "Add Staff"}
                </Button>
                <Button variant="ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          {staff.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-sm">No staff members yet</p>
              <p className="text-xs mt-1">
                Add staff members to assign bookings to specific people.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {staff.map((member) => (
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
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
