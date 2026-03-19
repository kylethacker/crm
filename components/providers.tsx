'use client';

import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { ChatHistoryProvider } from '@/lib/chat/chat-history-context';
import { ActiveAgentsProvider } from '@/lib/marketplace/active-agents-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ActiveAgentsProvider>
        <ChatHistoryProvider>
          {children}
        </ChatHistoryProvider>
      </ActiveAgentsProvider>
      <Toaster position="bottom-right" richColors />
    </ThemeProvider>
  );
}
