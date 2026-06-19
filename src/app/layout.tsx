import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "@/styles/globals.css";
import PublicBottomNav from "@/components/PublicBottomNav";
import CookieConsent from "@/components/CookieConsent";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { OrganizationSchema, WebSiteSchema } from "@/components/structured-data";

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
  themeColor: '#C5A456',
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://clubforgehq.com'),
  title: {
    default: 'ClubForge — Martial Arts & Gym Management Software UK',
    template: '%s | ClubForge',
  },
  description: 'Purpose-built management platform for martial arts clubs, gyms, dojos, and combat sports academies. Member management, class scheduling, belt progression, Stripe payments, attendance tracking, and multi-location support — all from one dashboard.',
  keywords: [
    // Primary — high-volume
    'gym management software',
    'martial arts software',
    'club management software',
    'dojo management system',
    'fitness studio software',
    // Discipline-specific
    'BJJ gym management software',
    'MMA gym software',
    'karate dojo management',
    'taekwondo club software',
    'judo club management',
    'boxing gym software',
    'muay thai gym app',
    // Feature-based long-tail
    'gym membership management software',
    'class scheduling software for gyms',
    'belt progression tracking software',
    'gym attendance tracking app',
    'gym billing software with Stripe',
    'martial arts school management system',
    'online gym management system',
    'gym CRM software',
    'sports club management platform',
    'multi-location gym software',
    'gym member portal',
    'white label gym software',
    // Commercial intent
    'best gym management software 2026',
    'best martial arts software UK',
    'affordable gym management app',
    'gym software with free trial',
    'ClubForge',
    'clubforgehq',
  ],
  authors: [{ name: 'ClubForge', url: 'https://clubforgehq.com' }],
  creator: 'ClubForge',
  publisher: 'ClubForge',
  manifest: '/api/manifest',
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
    site: '@clubforgehq',
    creator: '@clubforgehq',
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
  other: {
    'google-site-verification': 'Em_y84nNO9HuptqFLHNXL4iDENYuyxArwgfxdYMxToE',
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
        <link rel="alternate" hrefLang="en" href="https://clubforgehq.com" />
        <meta name="msvalidate.01" content="F910DE3CD3B5174E27B4D3E11E00DE9E" />
      </head>
      <body style={{ fontFamily: 'var(--font-sans)' }}>
        <OrganizationSchema />
        <WebSiteSchema />
        {children}
        <PublicBottomNav />
        <CookieConsent />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

