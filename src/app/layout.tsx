import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Timesheet App - การบันทึกเวลาทำงาน",
  description:
    "แอปพลิเคชันบันทึกเวลาทำงานสำหรับไทย - ง่าย รวดเร็ว และมีประสิทธิภาพ",
  keywords: [
    "timesheet",
    "time tracking",
    "work hours",
    "บันทึกเวลา",
    "เวลาทำงาน",
  ],
  authors: [{ name: "MaMoss" }],
  viewport: "width=device-width, initial-scale=1",
  manifest: "/manifest.json",
  robots: "index, follow",
  openGraph: {
    title: "Timesheet App - การบันทึกเวลาทำงาน",
    description: "แอปพลิเคชันบันทึกเวลาทำงานสำหรับไทย - ง่าย รวดเร็ว และมีประสิทธิภาพ",
    url: "https://timesheet-app-psi.vercel.app",
    siteName: "Timesheet App",
    locale: "th_TH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Timesheet App - การบันทึกเวลาทำงาน",
    description: "แอปพลิเคชันบันทึกเวลาทำงานสำหรับไทย",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
