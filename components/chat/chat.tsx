'use client';

import { useState, useEffect, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { toast } from 'sonner';
import type { AgentName } from '@/lib/ai/agents';
import { Messages } from './messages';
import { ChatInput } from './chat-input';

export function Chat() {
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [agent, setAgent] = useState<AgentName>('assistant');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Use a ref so the transport's body callback always reads the latest agent.
  const agentRef = useRef(agent);
  agentRef.current = agent;

  const transportRef = useRef(
    new DefaultChatTransport({
      body: () => ({ agent: agentRef.current }),
    }),
  );

  const { messages, sendMessage, stop, status, error } = useChat({
    transport: transportRef.current,
    experimental_throttle: 50,
  });

  const isPending = status === 'submitted' || status === 'streaming';

  useEffect(() => {
    if (error) {
      toast.error('Something went wrong', { description: error.message });
    }
  }, [error]);

  const handleSubmit = (text: string) => {
    sendMessage({ text });
  };

  return (
    <>
      <Messages
        messages={messages}
        isPending={isPending}
        isStreaming={status === 'streaming'}
        scrollRef={scrollRef}
        onAtBottomChange={setIsAtBottom}
      />

      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-2 px-4 pb-4">
        <div className="pointer-events-none absolute inset-0 flex justify-center px-4">
          <div className="w-full max-w-3xl bg-gradient-to-t from-white from-85% to-transparent dark:from-neutral-950" />
        </div>

        {!isAtBottom && messages.length > 0 && (
          <button
            type="button"
            onClick={() =>
              scrollRef.current?.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth',
              })
            }
            className="relative z-10 cursor-pointer rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 shadow-sm transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            Go to latest message
          </button>
        )}

        <ChatInput
          onSubmit={handleSubmit}
          onStop={stop}
          isPending={isPending}
          agent={agent}
          onAgentChange={setAgent}
        />
      </div>
    </>
  );
}
