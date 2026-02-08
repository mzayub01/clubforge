import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "@/styles/globals.css";
import PublicBottomNav from "@/components/PublicBottomNav";

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
  title: "ClubForge | Gym & Martial Arts Management Platform",
  description: "The all-in-one SaaS platform for martial arts gyms. Manage memberships, classes, belt progression, and more.",
  keywords: ["gym management", "martial arts software", "dojo management", "membership management", "SaaS", "BJJ"],
  authors: [{ name: "ClubForge" }],
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
    title: "ClubForge | Gym & Martial Arts Management",
    description: "The all-in-one SaaS platform for martial arts gyms and fitness centers.",
    type: "website",
    locale: "en_GB",
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
      </body>
    </html>
  );
}

