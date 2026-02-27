import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "@/styles/globals.css";
import PublicBottomNav from "@/components/PublicBottomNav";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#C5A456',
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://clubforgehq.com'),
  title: {
    default: 'ClubForge — The Operating System for Martial Arts Clubs',
    template: '%s | ClubForge',
  },
  description: 'The all-in-one SaaS platform for martial arts gyms, dojos, and academies. Member management, class scheduling, belt progression, Stripe payments, attendance tracking, and more — all from one dashboard.',
  keywords: [
    'gym management software',
    'martial arts software',
    'dojo management',
    'membership management',
    'class scheduling software',
    'belt progression tracking',
    'BJJ software',
    'karate club management',
    'martial arts gym app',
    'fitness club software',
    'ClubForge',
    'club management platform',
    'attendance tracking',
    'Stripe payments for gyms',
    'multi-location gym software',
  ],
  authors: [{ name: 'ClubForge', url: 'https://clubforgehq.com' }],
  creator: 'ClubForge',
  publisher: 'ClubForge',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ClubForge',
  },
  formatDetection: {
    telephone: true,
  },
  openGraph: {
    title: 'ClubForge — The Operating System for Martial Arts Clubs',
    description: 'Build, run, and grow your gym, dojo, or academy with one powerful platform. Member management, class scheduling, belt progression, payments, and more.',
    type: 'website',
    locale: 'en_GB',
    url: 'https://clubforgehq.com',
    siteName: 'ClubForge',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ClubForge — The Operating System for Martial Arts Clubs',
    description: 'The all-in-one platform for martial arts gyms. Manage members, classes, belt ranks, and payments from one dashboard.',
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
  alternates: {
    canonical: 'https://clubforgehq.com',
  },
  icons: {
    icon: '/logo-clubforge-icon.svg',
    shortcut: '/logo-clubforge-icon.svg',
    apple: '/logo-clubforge-icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/logo-clubforge-icon.svg" />
      </head>
      <body style={{ fontFamily: 'var(--font-sans)' }}>
        {children}
        <PublicBottomNav />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

