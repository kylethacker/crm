'use client';

import { useState } from 'react';
import { type AgentName, AGENT_NAMES, AGENT_DISPLAY } from '@/lib/ai/agents';
import { ChatComposer } from './chat-composer';

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

  return (
    <>
      <ChatComposer
        value={input}
        onChange={setInput}
        onSubmit={() => {
          const text = input.trim();
          if (!text) return;
          setInput('');
          onSubmit(text);
        }}
        onStop={onStop}
        isPending={isPending}
        placeholder="Message AI Chat..."
        autoFocus
        rows={2}
        className="w-full max-w-3xl"
        footer={<AgentSelector agent={agent} onAgentChange={onAgentChange} />}
      />
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
