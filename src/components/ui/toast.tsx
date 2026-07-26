"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

let toastListeners: Array<(toasts: Toast[]) => void> = [];
let toastsState: Toast[] = [];

function notifyListeners() {
  toastListeners.forEach((l) => l([...toastsState]));
}

export function toast(message: string, type: ToastType = "info") {
  const id = crypto.randomUUID();
  toastsState = [...toastsState, { id, message, type }];
  notifyListeners();

  setTimeout(() => {
    toastsState = toastsState.filter((t) => t.id !== id);
    notifyListeners();
  }, 5000);
}

const typeStyles: Record<ToastType, string> = {
  success: "bg-green-600",
  error: "bg-red-600",
  info: "bg-blue-600",
};

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    toastListeners.push(setToasts);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== setToasts);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "rounded-lg px-4 py-3 text-sm text-white shadow-lg animate-in slide-in-from-bottom-5",
            typeStyles[t.type]
          )}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
