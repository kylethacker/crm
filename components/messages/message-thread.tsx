'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ArrowUpIcon, SparklesIcon } from '@/components/icons';
import type { Conversation, TextMessage } from '@/lib/messages/types';

type MessageThreadProps = {
  conversation: Conversation;
};

function formatMessageTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatDateSeparator(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function shouldShowDateSeparator(messages: TextMessage[], index: number) {
  if (index === 0) return true;
  const current = new Date(messages[index]!.timestamp).toDateString();
  const previous = new Date(messages[index - 1]!.timestamp).toDateString();
  return current !== previous;
}

function MessageBubble({ message }: { message: TextMessage }) {
  const isOutbound = message.direction === 'outbound';

  return (
    <div className={cn('flex', isOutbound ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
          isOutbound
            ? 'rounded-br-md bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
            : 'rounded-bl-md bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100',
        )}
      >
        <p>{message.text}</p>
        <div
          className={cn(
            'mt-1 flex items-center gap-1.5 text-xs',
            isOutbound ? 'justify-end text-neutral-400 dark:text-neutral-500' : 'text-neutral-400',
          )}
        >
          <span>{formatMessageTime(message.timestamp)}</span>
          {isOutbound && (
            <span>
              {message.status === 'read' && '-- Read'}
              {message.status === 'delivered' && '-- Delivered'}
              {message.status === 'sent' && '-- Sent'}
              {message.status === 'failed' && '-- Failed'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function generateSuggestion(conversation: Conversation): { text: string; cta: string; draft: string } | null {
  const { messages, contact, bookings } = conversation;
  if (messages.length === 0) return null;

  const lastMessage = messages[messages.length - 1]!;
  const firstName = contact.name.split(' ')[0];
  const upcomingBooking = bookings.find((b) => b.status === 'upcoming');

  if (lastMessage.direction === 'inbound') {
    const lower = lastMessage.text.toLowerCase();

    if (lower.includes('price') || lower.includes('pricing') || lower.includes('cost')) {
      return {
        text: `${firstName} asked about pricing. Send a clear breakdown of the relevant plan with a comparison to highlight the value of upgrading.`,
        cta: 'Send pricing details',
        draft: `Hey ${firstName}! Great question. Let me put together a pricing breakdown for you — I'll include a comparison so you can see exactly what you'd get at each tier. I'll send that over shortly. In the meantime, happy to jump on a quick call if you'd like to walk through it together!`,
      };
    }
    if (lower.includes('api') || lower.includes('update') || lower.includes('launch')) {
      return {
        text: `${firstName} is asking for a product update. Share the latest timeline and offer to loop them into the beta if available.`,
        cta: 'Share update',
        draft: `Hey ${firstName}! Thanks for asking — we're actively working on that and I'll get you the latest timeline. I'll also check if we can get you early access to the beta. Stay tuned!`,
      };
    }
    if (lower.includes('question') || lower.includes('help')) {
      return {
        text: `${firstName} reached out with questions. Respond promptly to build rapport — ask what they'd like to know and offer a quick call.`,
        cta: 'Reply with help',
        draft: `Hey ${firstName}! Thanks for reaching out — happy to help! What questions do you have? I can answer over text, or if it's easier, we could hop on a quick call. Whatever works best for you!`,
      };
    }
    if (lower.includes('demo') || lower.includes('call') || lower.includes('meet')) {
      const bookingNote = upcomingBooking
        ? ` I see we have "${upcomingBooking.title}" on the calendar for ${new Date(upcomingBooking.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${upcomingBooking.time} — does that still work for you?`
        : ' What day and time work best for you? I\'ll send over a calendar invite.';
      return {
        text: `${firstName} is open to meeting. Confirm the time and send a calendar invite with a brief agenda.`,
        cta: 'Confirm meeting',
        draft: `Sounds great, ${firstName}!${bookingNote} I'll put together a brief agenda so we make the most of our time.`,
      };
    }
    if (upcomingBooking) {
      return {
        text: `${firstName} has "${upcomingBooking.title}" coming up on ${new Date(upcomingBooking.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}. Acknowledge their message and remind them about the upcoming session.`,
        cta: 'Reply & remind',
        draft: `Hey ${firstName}! Thanks for the message. Just a heads up — we have "${upcomingBooking.title}" coming up on ${new Date(upcomingBooking.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${upcomingBooking.time}. Looking forward to it! Let me know if you need anything beforehand.`,
      };
    }
    return {
      text: `${firstName} is waiting for a reply. Respond to keep the conversation moving and maintain engagement.`,
      cta: 'Draft reply',
      draft: `Hey ${firstName}! Thanks for reaching out. Let me look into this and get back to you shortly!`,
    };
  }

  if (lastMessage.direction === 'outbound') {
    if (upcomingBooking) {
      return {
        text: `You're waiting on ${firstName}. Their next booking "${upcomingBooking.title}" is on ${new Date(upcomingBooking.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}. Consider a gentle follow-up if they haven't replied.`,
        cta: 'Follow up',
        draft: `Hey ${firstName}! Just checking in — wanted to make sure you got my last message. Also, a quick reminder about our "${upcomingBooking.title}" on ${new Date(upcomingBooking.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${upcomingBooking.time}. See you then!`,
      };
    }
    return {
      text: `No reply from ${firstName} yet. A friendly nudge in a day or two could help move things forward.`,
      cta: 'Follow up',
      draft: `Hey ${firstName}! Just wanted to follow up on my last message — let me know if you have any questions or if there's anything I can help with!`,
    };
  }

  return null;
}

function AiSuggestionCard({ conversation, onUseSuggestion }: { conversation: Conversation; onUseSuggestion: (text: string) => void }) {
  const suggestion = generateSuggestion(conversation);
  if (!suggestion) return null;

  return (
    <div className="mt-2 flex justify-end">
      <div className="max-w-[75%] rounded-2xl rounded-br-md border border-dashed border-neutral-300 px-4 py-2.5 dark:border-neutral-600">
        <div className="mb-1 flex items-center gap-1.5">
          <SparklesIcon width={12} height={12} className="text-neutral-400" />
          <span className="text-xs font-medium text-neutral-400">
            Suggested reply
          </span>
        </div>
        <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
          {suggestion.text}
        </p>
        <button
          type="button"
          onClick={() => onUseSuggestion(suggestion.draft)}
          className="mt-2 cursor-pointer rounded-md bg-neutral-900 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
        >
          {suggestion.cta}
        </button>
      </div>
    </div>
  );
}

export function MessageThread({ conversation }: MessageThreadProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation.contact.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    // Will be wired to Twilio later
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
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
    el.style.height = `${Math.min(el.scrollHeight, 150)}px`;
  };

  const { contact, messages } = conversation;

  return (
    <div className="flex h-full flex-col">
      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto flex max-w-2xl flex-col gap-2">
          {messages.map((message, i) => (
            <div key={message.id}>
              {shouldShowDateSeparator(messages, i) && (
                <div className="my-4 flex justify-center">
                  <span className="text-xs font-medium text-neutral-400">
                    {formatDateSeparator(message.timestamp)}
                  </span>
                </div>
              )}
              <MessageBubble message={message} />
            </div>
          ))}

          <AiSuggestionCard
            conversation={conversation}
            onUseSuggestion={(text) => {
              setInput(text);
              textareaRef.current?.focus();
            }}
          />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-neutral-200 p-4 dark:border-neutral-800">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-2xl items-end gap-2"
        >
          <div className="flex-1 overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder={`Text ${contact.name.split(' ')[0]}...`}
              rows={1}
              className="block w-full resize-none bg-transparent px-4 py-2.5 text-sm leading-relaxed outline-none placeholder:text-neutral-400 dark:text-white"
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim()}
            className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-neutral-900 text-white transition-colors hover:bg-neutral-700 disabled:cursor-default disabled:opacity-30 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            <ArrowUpIcon />
            <span className="sr-only">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
