"use client";

import { useToast, ToastType } from "@/components/ui/ToastContext";
import React from "react";

const toastConfig = {
  success: { bg: "bg-green-500", icon: "check" as const },
  error: { bg: "bg-red-500", icon: "x" as const },
  warning: { bg: "bg-yellow-500", icon: "alert" as const },
  info: { bg: "bg-blue-500", icon: "info" as const },
};

function Icon({ name }: { name: "check" | "x" | "alert" | "info" }) {
  if (name === "check") {
    return (
      <svg className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    );
  }
  if (name === "x") {
    return (
      <svg className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
  }
  if (name === "alert") {
    return (
      <svg className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    );
  }
  return (
    <svg className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  );
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-24 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

interface ToastProps {
  toast: { id: string; type: ToastType; title: string; message?: string; action?: { label: string; onClick: () => void } };
  onClose: () => void;
}

function ToastItem({ toast, onClose }: ToastProps) {
  const config = toastConfig[toast.type];

  return (
    <div
      className={`${config.bg} text-white px-6 py-4 rounded-lg shadow-2xl flex items-start gap-4 max-w-sm pointer-events-auto animate-slide-in-right`}
    >
      <Icon name={config.icon} />

      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm">{toast.title}</p>
        {toast.message && (
          <p className="text-xs opacity-90 mt-1">{toast.message}</p>
        )}
        {toast.action && (
          <button
            onClick={() => {
              toast.action!.onClick();
              onClose();
            }}
            className="text-xs font-semibold mt-2 underline hover:opacity-80 transition"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        onClick={onClose}
        className="flex-shrink-0 hover:opacity-80 transition p-1"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
