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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center px-6 pb-6">
      <div className="pointer-events-auto w-full max-w-lg rounded-3xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_16px_24px_rgba(0,0,0,0.05),0_4px_16px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.05)] dark:bg-neutral-900 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_16px_24px_rgba(0,0,0,0.3),0_4px_16px_rgba(0,0,0,0.4),0_2px_4px_rgba(0,0,0,0.2)]">
        <form onSubmit={handleSubmit} className="flex h-14 items-center gap-2 pl-5 pr-3">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`How can I help with ${firstName}?`}
            className="min-w-0 flex-1 bg-transparent text-base text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-neutral-100 dark:placeholder:text-neutral-500"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-2xl bg-neutral-100 text-neutral-500 transition-colors hover:bg-neutral-200 disabled:cursor-default disabled:opacity-30 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
          >
            <ArrowUpIcon />
            <span className="sr-only">Send</span>
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 px-4 pb-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => startChat(action.prompt)}
              className="cursor-pointer rounded-xl bg-neutral-100 px-3 py-1 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
