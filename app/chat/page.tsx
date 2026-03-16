import { Suspense } from 'react';
import { Chat } from '@/components/chat/chat';

export const metadata = {
  title: 'Chat',
};

export default function ChatPage() {
  return (
    <div className="relative h-full">
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
