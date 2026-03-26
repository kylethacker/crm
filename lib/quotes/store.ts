'use client';

import { useSyncExternalStore } from 'react';
import { mockQuotes } from './mock-data';
import { calculateQuoteTotals, type QuoteFormValues } from './schema';
import type { Quote } from './types';

const STORAGE_KEY = 'crm-quote-records';

function cloneSeed<T>(value: T): T {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as T;
}

function buildSeedSnapshot() {
  return cloneSeed(mockQuotes);
}

let snapshot = buildSeedSnapshot();
const listeners = new Set<() => void>();

function hydrate() {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    snapshot = raw ? (JSON.parse(raw) as Quote[]) : buildSeedSnapshot();
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

function nextQuoteNumber(records: Quote[]) {
  const max = records.reduce((highest, quote) => {
    const parsed = Number.parseInt(quote.quoteNumber.replace(/\D/g, ''), 10);
    return Number.isFinite(parsed) ? Math.max(highest, parsed) : highest;
  }, 0);
  return `QT-${max + 1}`;
}

function normalizeNotes(value: string) {
  const next = value.trim();
  return next.length > 0 ? next : undefined;
}

function buildQuote(values: QuoteFormValues, existing?: Quote): Quote {
  const now = new Date().toISOString();
  const { subtotal, total } = calculateQuoteTotals(values.items);
  const sentDate =
    values.status === 'draft'
      ? undefined
      : existing?.sentDate ?? now;
  const viewedDate =
    values.status === 'viewed' || values.status === 'accepted'
      ? existing?.viewedDate ?? now
      : existing?.viewedDate;
  const acceptedDate =
    values.status === 'accepted'
      ? existing?.acceptedDate ?? now
      : undefined;

  return {
    id: existing?.id ?? crypto.randomUUID(),
    quoteNumber: existing?.quoteNumber ?? nextQuoteNumber(snapshot),
    contactName: values.contactName.trim(),
    items: values.items.map((item) => ({
      description: item.description.trim(),
      amount: item.amount,
    })),
    subtotal,
    total,
    status: values.status,
    createdAt: existing?.createdAt ?? now,
    sentDate,
    viewedDate,
    acceptedDate,
    validUntil: values.validUntil,
    notes: normalizeNotes(values.notes),
  };
}

export function getQuotesSnapshot() {
  return snapshot;
}

export function getQuoteById(id: string) {
  return snapshot.find((quote) => quote.id === id);
}

export function createQuote(values: QuoteFormValues) {
  const quote = buildQuote(values);
  snapshot = [quote, ...snapshot];
  persist();
  emit();
  return quote;
}

export function updateQuote(id: string, values: QuoteFormValues) {
  let updatedQuote: Quote | undefined;

  snapshot = snapshot.map((quote) => {
    if (quote.id !== id) return quote;
    updatedQuote = buildQuote(values, quote);
    return updatedQuote;
  });

  if (!updatedQuote) return undefined;
  persist();
  emit();
  return updatedQuote;
}

export function useQuotesStore() {
  const quotes = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    quotes,
    create: createQuote,
    update: updateQuote,
    getById: getQuoteById,
  } as const;
}
