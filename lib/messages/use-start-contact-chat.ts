'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useChatHistory } from '@/lib/chat/chat-history-context';
import type { ContactContext } from '@/lib/chat/chat-history';
import type { Conversation } from './types';

export function buildContactContext(conversation: Conversation): ContactContext {
  const { contact, messages, bookings, activity } = conversation;

  const revenue = bookings
    ?.filter((b) => b.amount && b.status === 'completed')
    .reduce((sum, b) => sum + (b.amount ?? 0), 0);

  // Send all messages for full context
  const recentMessages = messages.map((m) => ({
    text: m.text,
    direction: m.direction,
    timestamp: m.timestamp,
  }));

  const bookingSummaries = bookings.map((b) => ({
    title: b.title,
    date: b.date,
    time: b.time,
    status: b.status,
    amount: b.amount,
    notes: b.notes,
  }));

  const recentActivity = activity.slice(0, 6).map((a) => ({
    type: a.type,
    description: a.description,
    timestamp: a.timestamp,
  }));

  return {
    contactId: contact.id,
    name: contact.name,
    phone: contact.phone,
    email: contact.email,
    company: contact.company,
    status: contact.status,
    tags: contact.tags,
    notes: contact.notes,
    ...(revenue != null && revenue > 0 && { revenue }),
    ...(recentMessages.length > 0 && { recentMessages }),
    ...(bookingSummaries.length > 0 && { bookings: bookingSummaries }),
    ...(recentActivity.length > 0 && { recentActivity }),
  };
}

export function useStartContactChat(conversation: Conversation) {
  const router = useRouter();
  const { createSession } = useChatHistory();

  const startChat = useCallback(
    (initialMessage?: string) => {
      const contactContext = buildContactContext(conversation);
      createSession({ contactContext, initialMessage });
      router.push('/chat');
    },
    [conversation, createSession, router],
  );

  return startChat;
}
