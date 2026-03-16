'use client';

import { useState, useRef } from 'react';
import { ArrowUpIcon, XIcon } from '@/components/icons';
import type { Conversation } from '@/lib/messages/types';
import { useStartContactChat } from '@/lib/messages/use-start-contact-chat';
import { getQuickActions } from '@/lib/messages/constants';

type AiAssistSidebarProps = {
  conversation: Conversation;
  onClose: () => void;
};

export function AiAssistSidebar({ conversation, onClose }: AiAssistSidebarProps) {
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
    <div className="flex h-full w-80 shrink-0 flex-col border-l border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          AI Assist
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
        >
          <XIcon />
          <span className="sr-only">Close</span>
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <p className="text-center text-sm text-neutral-400 dark:text-neutral-500">
          Ask anything about {firstName}
        </p>
      </div>

      <div className="p-3">
        <div className="rounded-2xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.08)] dark:bg-neutral-900 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_4px_12px_rgba(0,0,0,0.3)]">
          <form onSubmit={handleSubmit} className="flex h-12 items-center gap-2 pl-4 pr-2.5">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Help with ${firstName}...`}
              autoFocus
              className="min-w-0 flex-1 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-neutral-100 dark:placeholder:text-neutral-500"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 transition-colors hover:bg-neutral-200 disabled:cursor-default disabled:opacity-30 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
            >
              <ArrowUpIcon />
              <span className="sr-only">Send</span>
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-1.5 px-3 pb-3">
            {quickActions.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => startChat(action.prompt)}
                className="cursor-pointer rounded-lg bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
