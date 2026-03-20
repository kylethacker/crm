import { getConversations } from '@/lib/messages/mock-data';
import { mockInvoices } from '@/lib/invoices/mock-data';
import { mockQuotes } from '@/lib/quotes/mock-data';
import type { TableViewType } from './types';

// ── Contacts ─────────────────────────────────────────────────────────────────

export type ContactRow = {
  name: string;
  status: string;
  daysSinceContact: number | null;
  totalRevenue: number;
  upcomingBookingCount: number;
};

function fetchContacts(filters: Record<string, unknown>): ContactRow[] {
  const conversations = getConversations();
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

    return { name: contact.name, status: contact.status, daysSinceContact, totalRevenue, upcomingBookingCount };
  });

  if (filters.status) {
    results = results.filter((r) => r.status === filters.status);
  }

  return results;
}

// ── Invoices ─────────────────────────────────────────────────────────────────

export type InvoiceRow = {
  invoiceNumber: string;
  contactName: string;
  total: number;
  status: string;
  dueDate: string;
  daysPastDue: number;
};

function fetchInvoices(filters: Record<string, unknown>): InvoiceRow[] {
  const today = new Date().toISOString().split('T')[0]!;

  let results = mockInvoices.map((inv) => {
    const daysPastDue =
      inv.status !== 'paid' && inv.dueDate < today
        ? Math.floor((Date.now() - new Date(inv.dueDate + 'T00:00:00').getTime()) / (1000 * 60 * 60 * 24))
        : 0;
    return { invoiceNumber: inv.invoiceNumber, contactName: inv.contactName, total: inv.total, status: inv.status, dueDate: inv.dueDate, daysPastDue };
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
  quoteNumber: string;
  contactName: string;
  total: number;
  status: string;
  validUntil: string;
  isExpired: boolean;
};

function fetchQuotes(filters: Record<string, unknown>): QuoteRow[] {
  const today = new Date().toISOString().split('T')[0]!;

  let results = mockQuotes.map((q) => ({
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
      return fetchContacts(filters);
    case 'invoices':
      return fetchInvoices(filters);
    case 'quotes':
      return fetchQuotes(filters);
  }
}
