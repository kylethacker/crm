'use client';

import { useRouter } from 'next/navigation';
import { useChatHistory } from '@/lib/chat/chat-history-context';

type PromptCardProps = {
  title: string;
  labels: string[];
  cta: string;
  emptyText?: string;
  prompt: string;
};

export function PromptCard({ title, labels, cta, emptyText, prompt }: PromptCardProps) {
  const router = useRouter();
  const { createSession } = useChatHistory();

  if (labels.length === 0) {
    if (!emptyText) return null;
    return (
      <div className="flex min-h-[120px] w-full flex-col rounded-xl border border-neutral-200 bg-white px-5 py-4 dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
          {title}
        </h3>
        <p className="mt-auto text-sm text-neutral-400 dark:text-neutral-500">
          {emptyText}
        </p>
      </div>
    );
  }

  const handleClick = () => {
    createSession({ initialMessage: prompt });
    router.push('/chat');
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex min-h-[120px] w-full cursor-pointer flex-col rounded-xl border border-neutral-200 bg-white px-5 py-4 text-left transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800/70"
    >
      <h3 className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
        {title}
      </h3>
      <div className="mt-3 flex flex-col gap-1">
        {labels.map((label, i) => (
          <p key={i} className="min-w-0 truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {label}
          </p>
        ))}
      </div>
      <span className="mt-auto pt-3 text-xs text-neutral-400 dark:text-neutral-500">
        {cta}
      </span>
    </button>
  );
}
