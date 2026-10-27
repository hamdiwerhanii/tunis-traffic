import "leaflet/dist/leaflet.css";
import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";

import Providers from "@/shared/providers/Providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tunis Traffic | Live traffic and when to leave",
  description:
    "Check traffic in Tunis before you drive: live traffic map, rush hours, place search, saved places and a planner that tells you when to leave.",
  keywords: ["Tunis traffic", "Tunisia traffic", "traffic map", "rush hour Tunis", "route planner"],
  openGraph: {
    title: "Tunis Traffic",
    description: "Live traffic in Tunis and a planner that tells you when to leave.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0e1a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
