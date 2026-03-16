'use client';

import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { ChatHistoryProvider } from '@/lib/chat/chat-history-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ChatHistoryProvider>
        {children}
      </ChatHistoryProvider>
      <Toaster position="bottom-right" richColors />
    </ThemeProvider>
  );
}
