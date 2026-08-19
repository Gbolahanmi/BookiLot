"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/ToastContext";

interface Service {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  priceCents: number;
  currency: string;
  bufferMinutes: number;
  depositRequired: boolean;
  depositAmountCents: number;
  active: boolean;
}

interface ServiceModalProps {
  open: boolean;
  onClose: () => void;
  service?: Service | null;
  onSaved: () => void;
}

const DURATION_OPTIONS = [
  { value: "15", label: "15 min" },
  { value: "30", label: "30 min" },
  { value: "45", label: "45 min" },
  { value: "60", label: "1 hour" },
  { value: "90", label: "1.5 hours" },
  { value: "120", label: "2 hours" },
  { value: "180", label: "3 hours" },
  { value: "240", label: "4 hours" },
];

export function ServiceModal({ open, onClose, service, onSaved }: ServiceModalProps) {
  const { addToast } = useToast();
  const isEdit = !!service;
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("60");
  const [price, setPrice] = useState("");
  const [buffer, setBuffer] = useState("10");

  useEffect(() => {
    if (open) {
      if (service) {
        setName(service.name);
        setDescription(service.description || "");
        setDuration(String(service.durationMinutes));
        setPrice(service.priceCents > 0 ? (service.priceCents / 100).toFixed(2) : "");
        setBuffer(String(service.bufferMinutes));
      } else {
        setName("");
        setDescription("");
        setDuration("60");
        setPrice("");
        setBuffer("10");
      }
    }
  }, [open, service]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      addToast({ type: "error", title: "Service name is required" });
      return;
    }

    setLoading(true);
    try {
      const body = {
        name: name.trim(),
        description: description.trim() || undefined,
        durationMinutes: parseInt(duration),
        priceCents: price ? Math.round(parseFloat(price) * 100) : 0,
        bufferMinutes: parseInt(buffer),
      };

      const url = isEdit ? `/api/services/${service.id}` : "/api/services";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        addToast({ type: "error", title: data.error || "Failed to save service" });
        return;
      }

      addToast({ type: "success", title: isEdit ? "Service updated" : "Service created" });
      onSaved();
      onClose();
    } catch {
      addToast({ type: "error", title: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!service) return;
    if (!confirm("Delete this service? This cannot be undone.")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/services/${service.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        addToast({ type: "error", title: data.error || "Failed to delete service" });
        return;
      }
      addToast({ type: "success", title: "Service deleted" });
      onSaved();
      onClose();
    } catch {
      addToast({ type: "error", title: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit Service" : "Add Service"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="service-name"
          label="Service name"
          placeholder="e.g. Haircut"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="space-y-1">
          <label htmlFor="service-desc" className="block text-sm font-medium text-gray-700">
            Description (optional)
          </label>
          <textarea
            id="service-desc"
            rows={2}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Brief description of the service"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Duration</label>
            <select
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            >
              {DURATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <Input
            id="service-price"
            label="Price"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <Input
          id="service-buffer"
          label="Buffer between bookings (min)"
          type="number"
          min="0"
          max="60"
          value={buffer}
          onChange={(e) => setBuffer(e.target.value)}
        />

        <div className="flex items-center justify-between pt-2">
          {isEdit ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              Delete
            </button>
          ) : (
            <div />
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Add Service"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
