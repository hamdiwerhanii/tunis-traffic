import "leaflet/dist/leaflet.css";
import "./globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";

import Providers from "@/lib/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Tunis Traffic Quick Check — Real-Time Traffic in Tunis",
  description:
    "Check real-time traffic conditions in Tunis, Tunisia. View live traffic layers, peak hour alerts, and calculate your best departure time.",
  keywords: [
    "Tunis traffic",
    "Tunisia traffic",
    "real-time traffic",
    "traffic map",
    "Tunis roads",
  ],
  openGraph: {
    title: "Tunis Traffic Quick Check",
    description:
      "Real-time traffic conditions in Tunis. See live traffic, peak hours, and plan your commute.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
