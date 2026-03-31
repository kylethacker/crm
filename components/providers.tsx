'use client';

import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { ChatHistoryProvider } from '@/lib/chat/chat-history-context';
import { ActiveAgentsProvider } from '@/lib/marketplace/active-agents-context';
import { ScenarioProvider } from '@/lib/demo/scenario-context';
import { ViewsProvider } from '@/lib/views/context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ScenarioProvider>
        <ActiveAgentsProvider>
          <ChatHistoryProvider>
            <ViewsProvider>
              {children}
            </ViewsProvider>
          </ChatHistoryProvider>
        </ActiveAgentsProvider>
      </ScenarioProvider>
      <Toaster position="bottom-right" richColors />
    </ThemeProvider>
  );
}
