"use client";

import { usePathname } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";

const NO_LAYOUT_PATHS = ["/onboarding"];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (NO_LAYOUT_PATHS.includes(pathname)) {
    return <>{children}</>;
  }

  return <AppLayout>{children}</AppLayout>;
}
