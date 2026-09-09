"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [inviteStatus, setInviteStatus] = useState<"loading" | "pending" | "accepted" | "expired" | "invalid">("loading");

  useEffect(() => {
    if (!token) {
      setInviteStatus("invalid");
      return;
    }
    fetch(`/api/staff/accept?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        setInviteStatus(data.status);
        if (data.status === "accepted") {
          setSuccessMessage("You already have an account. Please log in.");
          setSuccess(true);
        }
      })
      .catch(() => setInviteStatus("invalid"));
  }, [token]);

  if (inviteStatus === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    );
  }

  if (inviteStatus === "invalid") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">Invalid Link</p>
          <p className="mt-2 text-sm text-gray-500">
            This invitation link is invalid. Please contact the business owner for a new link.
          </p>
        </div>
      </div>
    );
  }

  if (inviteStatus === "expired") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">Invitation Expired</p>
          <p className="mt-2 text-sm text-gray-500">
            This invitation has expired. Please ask the business owner to send a new one.
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!name || !password) return;
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/staff/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, name, password }),
      });

      const data = await res.json();

      if (!res.ok && res.status !== 200) {
        setError(data.error || "Failed to accept invitation");
        return;
      }

      setSuccessMessage(data.message || "Account created successfully. You can now log in.");
      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">All Set!</h1>
          <p className="mt-2 text-gray-500">{successMessage}</p>
          <button
            onClick={() => router.push("/login")}
            className="mt-6 inline-block"
          >
            <Button>Go to Login</Button>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Accept Invitation</h1>
          <p className="mt-2 text-gray-500">
            Create your account to get started
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              id="name"
              label="Full Name"
              placeholder="Jane Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button onClick={handleSubmit} disabled={loading} className="w-full">
              {loading ? "Creating Account..." : "Accept & Create Account"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      }
    >
      <AcceptInviteContent />
    </Suspense>
  );
}
