import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LunaBloom — Period Tracker & Women's Wellness Sanctuary",
  description:
    "A warm, privacy-first menstrual cycle tracker, mood journal, comfort sanctuary, partner connect, and women's health companion.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${plusJakarta.variable}`}>
      <body className="min-h-screen bg-[#FFFBF8] text-[#2E1A2B] font-sans antialiased selection:bg-pink-200 selection:text-pink-950">
        {children}
      </body>
    </html>
  );
}
