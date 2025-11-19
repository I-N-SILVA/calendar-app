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
  title: "[CALENDAR] - Smart Event Management System",
  description: "A powerful, brutalist-inspired calendar app with natural language processing, voice input, recurring events, and multiple views. Organize your life with style.",
  keywords: ["calendar", "event management", "scheduling", "productivity", "time management", "recurring events", "natural language", "voice input"],
  authors: [{ name: "Calendar App Team" }],
  creator: "Calendar App",
  publisher: "Calendar App",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  openGraph: {
    title: "[CALENDAR] - Smart Event Management System",
    description: "A powerful calendar app with natural language processing, voice input, and multiple views. Organize your life with style.",
    url: '/',
    siteName: 'Calendar App',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png', // You'll need to create this
        width: 1200,
        height: 630,
        alt: 'Calendar App Screenshot',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "[CALENDAR] - Smart Event Management",
    description: "Powerful calendar app with NLP, voice input, and multiple views.",
    images: ['/og-image.png'],
    creator: '@calendarapp',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png' },
    ],
  },
  manifest: '/site.webmanifest',
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
