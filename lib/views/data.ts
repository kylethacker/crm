'use client';

import { useMemo } from 'react';
import {
  getContactConversation,
  getContactConversationsSnapshot,
  useContactsStore,
} from '@/lib/contacts/store';
import { getInvoiceById, getInvoicesSnapshot, useInvoicesStore } from '@/lib/invoices/store';
import type { Invoice } from '@/lib/invoices/mock-data';
import type { Conversation } from '@/lib/messages/types';
import { getQuoteById, getQuotesSnapshot, useQuotesStore } from '@/lib/quotes/store';
import type { Quote } from '@/lib/quotes/types';
import type { TableViewType } from './types';

// ── Contacts ─────────────────────────────────────────────────────────────────

export type ContactRow = {
  contactId: string;
  name: string;
  status: string;
  daysSinceContact: number | null;
  totalRevenue: number;
  upcomingBookingCount: number;
};

function fetchContacts(
  filters: Record<string, unknown>,
  conversations: Conversation[],
): ContactRow[] {
  const now = Date.now();

  let results = conversations.map((conv) => {
    const { contact, bookings } = conv;
    const daysSinceContact = contact.lastContacted
      ? Math.floor((now - new Date(contact.lastContacted).getTime()) / (1000 * 60 * 60 * 24))
      : null;
    const totalRevenue = bookings
      .filter((b) => b.status === 'completed' && b.amount)
      .reduce((sum, b) => sum + (b.amount ?? 0), 0);
    const upcomingBookingCount = bookings.filter((b) => b.status === 'upcoming').length;

    return {
      contactId: contact.id,
      name: contact.name,
      status: contact.status,
      daysSinceContact,
      totalRevenue,
      upcomingBookingCount,
    };
  });

  if (filters.status) {
    results = results.filter((r) => r.status === filters.status);
  }

  return results;
}

// ── Invoices ─────────────────────────────────────────────────────────────────

export type InvoiceRow = {
  id: string;
  invoiceNumber: string;
  contactName: string;
  total: number;
  status: string;
  dueDate: string;
  daysPastDue: number;
};

function fetchInvoices(filters: Record<string, unknown>, invoices: Invoice[]): InvoiceRow[] {
  const today = new Date().toISOString().split('T')[0]!;

  let results = invoices.map((inv) => {
    const daysPastDue =
      inv.status !== 'paid' && inv.dueDate < today
        ? Math.floor((Date.now() - new Date(inv.dueDate + 'T00:00:00').getTime()) / (1000 * 60 * 60 * 24))
        : 0;
    return {
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      contactName: inv.contactName,
      total: inv.total,
      status: inv.status,
      dueDate: inv.dueDate,
      daysPastDue,
    };
  });

  if (filters.status) {
    results = results.filter((r) => r.status === filters.status);
  }
  if (filters.contactName) {
    results = results.filter((r) => r.contactName.toLowerCase() === String(filters.contactName).toLowerCase());
  }
  if (filters.overdueOnly) {
    results = results.filter((r) => r.daysPastDue > 0);
  }

  return results;
}

// ── Quotes ───────────────────────────────────────────────────────────────────

export type QuoteRow = {
  id: string;
  quoteNumber: string;
  contactName: string;
  total: number;
  status: string;
  validUntil: string;
  isExpired: boolean;
};

function fetchQuotes(filters: Record<string, unknown>, quotes: Quote[]): QuoteRow[] {
  const today = new Date().toISOString().split('T')[0]!;

  let results = quotes.map((q) => ({
    id: q.id,
    quoteNumber: q.quoteNumber,
    contactName: q.contactName,
    total: q.total,
    status: q.status,
    validUntil: q.validUntil,
    isExpired: q.validUntil < today && q.status !== 'accepted',
  }));

  if (filters.status) {
    results = results.filter((r) => r.status === filters.status);
  }
  if (filters.contactName) {
    results = results.filter((r) => r.contactName.toLowerCase() === String(filters.contactName).toLowerCase());
  }

  return results;
}

// ── Public API ───────────────────────────────────────────────────────────────

export function fetchViewData(type: TableViewType, filters: Record<string, unknown>): unknown[] {
  switch (type) {
    case 'contacts':
      return fetchContacts(filters, getContactConversationsSnapshot());
    case 'invoices':
      return fetchInvoices(filters, getInvoicesSnapshot());
    case 'quotes':
      return fetchQuotes(filters, getQuotesSnapshot());
  }
}

export function useViewData(type: TableViewType, filters: Record<string, unknown>) {
  const { conversations } = useContactsStore();
  const { invoices } = useInvoicesStore();
  const { quotes } = useQuotesStore();

  return useMemo(() => {
    switch (type) {
      case 'contacts':
        return fetchContacts(filters, conversations);
      case 'invoices':
        return fetchInvoices(filters, invoices);
      case 'quotes':
        return fetchQuotes(filters, quotes);
    }
  }, [conversations, filters, invoices, quotes, type]);
}

/** Stable row key for React lists and `getViewDetail`. */
export function getViewRowId(type: TableViewType, row: Record<string, unknown>): string {
  if (type === 'contacts') return String(row.contactId);
  return String(row.id);
}

export type ViewDetail =
  | { type: 'contacts'; data: Conversation }
  | { type: 'invoices'; data: Invoice }
  | { type: 'quotes'; data: Quote };

export function getViewDetail(type: TableViewType, id: string): ViewDetail | undefined {
  switch (type) {
    case 'contacts': {
      const conv = getContactConversation(id);
      return conv ? { type: 'contacts', data: conv } : undefined;
    }
    case 'invoices': {
      const inv = getInvoiceById(id);
      return inv ? { type: 'invoices', data: inv } : undefined;
    }
    case 'quotes': {
      const q = getQuoteById(id);
      return q ? { type: 'quotes', data: q } : undefined;
    }
  }
}

export function useViewDetail(type: TableViewType, id: string | null) {
  const { conversations } = useContactsStore();
  const { invoices } = useInvoicesStore();
  const { quotes } = useQuotesStore();

  return useMemo(() => {
    if (!id) return undefined;
    return getViewDetail(type, id);
  }, [conversations, id, invoices, quotes, type]);
}
