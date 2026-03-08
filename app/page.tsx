import { Suspense } from 'react';
import { ChatHeader } from '@/components/chat/chat-header';
import { Chat } from '@/components/chat/chat';

export default function Home() {
  return (
    <div className="relative h-dvh">
      <ChatHeader />
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center text-sm text-neutral-400 dark:text-neutral-600">
            Loading…
          </div>
        }
      >
        <Chat />
      </Suspense>
    </div>
  );
}
