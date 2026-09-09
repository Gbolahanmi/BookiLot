"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
  items: Record<string, { label: string; href: string }>;
  logoHref: string;
}

export function Sidebar({ open, onClose, items, logoHref }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-50 bg-gray-900/80 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 z-50 flex w-64 flex-col bg-white transition-transform duration-200 ease-in-out",
          "lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
          <div className="flex h-16 items-center justify-between">
            <Link href={logoHref} className="text-xl font-bold text-indigo-600">
              Bookilot
            </Link>
            <button
              aria-label="Close navigation"
              onClick={onClose}
              className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 lg:hidden"
            >
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <nav className="flex flex-1 flex-col gap-1">
            {Object.entries(items).map(([key, item]) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={key}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-700 hover:bg-gray-50",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
