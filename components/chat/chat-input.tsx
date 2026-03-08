'use client';

import { useState, useRef } from 'react';
import { ArrowUpIcon, StopIcon } from '@/components/icons';
import { type AgentName, AGENT_NAMES, AGENT_DISPLAY } from '@/lib/ai/agents';

type ChatInputProps = {
  onSubmit: (text: string) => void;
  onStop: () => void;
  isPending: boolean;
  agent: AgentName;
  onAgentChange: (agent: AgentName) => void;
};

export function ChatInput({
  onSubmit,
  onStop,
  isPending,
  agent,
  onAgentChange,
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isPending) return;

    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    onSubmit(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-950"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Message AI Chat..."
          autoFocus
          rows={2}
          className="block w-full resize-none bg-transparent px-4 pt-3 pb-2 text-sm leading-relaxed outline-none placeholder:text-neutral-400 disabled:cursor-not-allowed disabled:opacity-50 dark:text-white"
        />
        <div className="flex items-center justify-between px-3 pb-3">
          <AgentSelector agent={agent} onAgentChange={onAgentChange} />

          {isPending ? (
            <button
              type="button"
              onClick={onStop}
              className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-neutral-900 text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              <StopIcon />
              <span className="sr-only">Stop</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-neutral-900 text-white transition-colors hover:bg-neutral-700 disabled:cursor-default disabled:opacity-30 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              <ArrowUpIcon />
              <span className="sr-only">Send</span>
            </button>
          )}
        </div>
      </form>

      <p className="relative text-center text-xs text-neutral-400 dark:text-neutral-600">
        AI can make mistakes. Verify important information.
      </p>
    </>
  );
}

function AgentSelector({
  agent,
  onAgentChange,
}: {
  agent: AgentName;
  onAgentChange: (agent: AgentName) => void;
}) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Select agent">
      {AGENT_NAMES.map((name) => {
        const isActive = agent === name;
        const { label } = AGENT_DISPLAY[name];

        return (
          <button
            key={name}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onAgentChange(name)}
            className={`cursor-pointer rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              isActive
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
