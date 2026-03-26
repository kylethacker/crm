'use client';

import { useState, useRef } from 'react';
import { ArrowUpIcon } from '@/components/icons';
import type { Conversation } from '@/lib/messages/types';
import { useStartContactChat } from '@/lib/messages/use-start-contact-chat';
import { getQuickActions } from '@/lib/messages/constants';

type AiAssistInputProps = {
  conversation: Conversation;
};

export function AiAssistInput({ conversation }: AiAssistInputProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const startChat = useStartContactChat(conversation);
  const quickActions = getQuickActions(conversation);

  const firstName = conversation.contact.name.split(' ')[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    startChat(text);
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center px-6 pb-6">
      <div className="pointer-events-auto w-full max-w-lg rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
        <form onSubmit={handleSubmit} className="flex h-12 items-center gap-2 pl-4 pr-2.5">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmit(e); } }}
            placeholder={`How can I help with ${firstName}?`}
            className="min-w-0 flex-1 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-neutral-100 dark:placeholder:text-neutral-500"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-neutral-900 text-white transition-colors hover:bg-neutral-700 disabled:cursor-default disabled:opacity-30 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            <ArrowUpIcon />
            <span className="sr-only">Send</span>
          </button>
        </form>

        {quickActions.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5 px-3 pb-3">
            {quickActions.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => startChat(action.prompt)}
                className="cursor-pointer rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
              >
                {action.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
