import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Providers } from '@/components/providers';
import { AppSidebar } from '@/components/app-sidebar';
import { DevResetButton } from '@/components/dev-reset-button';
import './globals.css';

// ── Fonts ─────────────────────────────────────────────────────────────────────

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// ── Metadata ──────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default: 'AI CRM',
    template: '%s | AI CRM',
  },
  description: 'Your AI-powered CRM coworker for small businesses.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

// ── Root layout ───────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/*
       * `isolate` establishes a new stacking context so Base UI portals
       * (Dialog, Popover, Tooltip) always paint above page content.
       * `relative` is required for iOS 26+ Safari viewport coverage.
       */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} relative isolate bg-white text-neutral-950 antialiased dark:bg-neutral-950 dark:text-neutral-50`}
      >
        <Providers>
          <div className="flex h-dvh">
            <AppSidebar />
            <main className="min-w-0 flex-1">{children}</main>
          </div>
          <DevResetButton />
        </Providers>
      </body>
    </html>
  );
}
