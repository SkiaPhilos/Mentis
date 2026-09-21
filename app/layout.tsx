import type { Metadata, Viewport } from 'next';
import { EB_Garamond, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { OfflineIndicator } from '@/components/pwa/OfflineIndicator';

const scholarlySerif = EB_Garamond({
  subsets: ['latin'],
  variable: '--font-scholarly-serif',
  display: 'swap',
});

const scholarlySans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-scholarly-sans',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#173B2D',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'Mentis — Your Personal Scholarly World',
  description: 'An academic sanctuary combining books, notes, intelligent study helpers, and an interactive schedule.',
  applicationName: 'Mentis',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Mentis',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'Mentis — Your Personal Scholarly World',
    description: 'An academic sanctuary combining books, notes, intelligent study helpers, and an interactive schedule.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mentis — Your Personal Scholarly World',
    description: 'An academic sanctuary combining books, notes, intelligent study helpers, and an interactive schedule.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${scholarlySerif.variable} ${scholarlySans.variable}`}>
      <body className="bg-[#F3EEDB] text-[#202820] antialiased selection:bg-[#A9C9A9]/50 selection:text-[#173B2D]" suppressHydrationWarning>
        {children}
        <OfflineIndicator />
      </body>
    </html>
  );
}
