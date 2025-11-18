import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { CalendarNavigationProvider } from '@/contexts/CalendarNavigationContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import ToastContainer from '@/components/ToastContainer';
import "./globals.css";
import "@/styles/design-system.css";
import "@/styles/responsive.css";
import "@/styles/button-system.css";
import "@/styles/mobile-enhancements.css";
import "@/styles/calendar-enhancements.css";
import "@/styles/animations-polish.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "[CALENDAR] - Event Management System",
  description: "A modern, feature-rich calendar app with categories, multiple views, and search functionality. Built with Next.js and styled with Tailwind CSS.",
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
        <ErrorBoundary>
          <ThemeProvider>
            <SettingsProvider>
              <ToastProvider>
                <CalendarNavigationProvider>
                  {children}
                  <ToastContainer />
                </CalendarNavigationProvider>
              </ToastProvider>
            </SettingsProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
