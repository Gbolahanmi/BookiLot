import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "@/components/auth/session-provider";
import { ToastProvider } from "@/components/ui/ToastContext";
import ToastContainer from "@/components/ui/ToastContainer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bookilot — Smart Booking for Local Businesses",
  description:
    "Accept bookings through web, SMS, and voice. Reduce no-shows, fill your calendar, understand your business.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <ToastProvider>
            {children}
            <ToastContainer />
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
