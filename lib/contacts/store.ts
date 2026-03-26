'use client';

import { useSyncExternalStore } from 'react';
import { getConversations } from '@/lib/messages/mock-data';
import type { ActivityEvent, Contact, Conversation } from '@/lib/messages/types';
import type { ContactFormValues } from './schema';

const STORAGE_KEY = 'crm-contact-records';

function cloneSeed<T>(value: T): T {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as T;
}

function buildSeedSnapshot() {
  return cloneSeed(getConversations());
}

let snapshot = buildSeedSnapshot();
const listeners = new Set<() => void>();

function hydrate() {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    snapshot = raw ? (JSON.parse(raw) as Conversation[]) : buildSeedSnapshot();
  } catch {
    snapshot = buildSeedSnapshot();
  }
}

hydrate();

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // storage unavailable
  }
}

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return snapshot;
}

const SERVER_SNAPSHOT = buildSeedSnapshot();
function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

function normalizeOptionalString(value: string) {
  const next = value.trim();
  return next.length > 0 ? next : undefined;
}

function normalizeTags(value: string) {
  const tags = value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
  return tags.length > 0 ? tags : undefined;
}

function createActivity(type: ActivityEvent['type'], description: string): ActivityEvent {
  return {
    id: crypto.randomUUID(),
    type,
    description,
    timestamp: new Date().toISOString(),
  };
}

function buildContact(values: ContactFormValues, existing?: Contact): Contact {
  return {
    id: existing?.id ?? crypto.randomUUID(),
    name: values.name.trim(),
    phone: values.phone.trim(),
    email: normalizeOptionalString(values.email),
    company: normalizeOptionalString(values.company),
    status: values.status,
    lastContacted: existing?.lastContacted,
    notes: normalizeOptionalString(values.notes),
    tags: normalizeTags(values.tags),
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };
}

export function getContactConversationsSnapshot() {
  return snapshot;
}

export function getContactConversation(id: string) {
  return snapshot.find((conversation) => conversation.contact.id === id);
}

export function createContact(values: ContactFormValues) {
  const record: Conversation = {
    contact: buildContact(values),
    messages: [],
    bookings: [],
    activity: [createActivity('created', 'Contact created')],
    unreadCount: 0,
  };

  snapshot = [record, ...snapshot];
  persist();
  emit();
  return record;
}

export function updateContact(id: string, values: ContactFormValues) {
  let updatedRecord: Conversation | undefined;

  snapshot = snapshot.map((conversation) => {
    if (conversation.contact.id !== id) return conversation;

    const nextContact = buildContact(values, conversation.contact);
    const nextActivity = [...conversation.activity];

    if (conversation.contact.status !== nextContact.status) {
      nextActivity.unshift(
        createActivity(
          'status-change',
          `Status changed from ${conversation.contact.status} to ${nextContact.status}`,
        ),
      );
    } else {
      nextActivity.unshift(createActivity('note', 'Contact details updated'));
    }

    updatedRecord = {
      ...conversation,
      contact: nextContact,
      activity: nextActivity,
    };
    return updatedRecord;
  });

  if (!updatedRecord) return undefined;
  persist();
  emit();
  return updatedRecord;
}

export function useContactsStore() {
  const conversations = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    conversations,
    create: createContact,
    update: updateContact,
    getById: getContactConversation,
  } as const;
}
