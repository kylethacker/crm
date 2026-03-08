import { ThemeToggle } from '@/components/theme-toggle';

export async function ChatHeader() {
  'use cache';

  return (
    <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950">
      <h1 className="text-sm font-semibold tracking-tight">AI Chat</h1>
      <ThemeToggle />
    </header>
  );
}
