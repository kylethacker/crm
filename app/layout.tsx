import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Providers } from '@/components/providers';
import { AppSidebar } from '@/components/app-sidebar';
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
  title: 'Dashboard',
  description: 'Your AI-powered CRM coworker for small businesses.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f8f9' },
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
        className={`${geistSans.variable} ${geistMono.variable} relative isolate bg-app-canvas text-neutral-950 antialiased dark:bg-neutral-950 dark:text-neutral-50`}
      >
        <Providers>
          <div className="flex h-dvh">
            <AppSidebar />
            <main className="h-full min-w-0 flex-1 overflow-y-auto bg-app-canvas dark:bg-neutral-950">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
