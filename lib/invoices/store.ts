'use client';

import { useSyncExternalStore } from 'react';
import { mockInvoices, type Invoice } from './mock-data';
import { calculateInvoiceTotals, type InvoiceFormValues } from './schema';

const STORAGE_KEY = 'crm-invoice-records';

function cloneSeed<T>(value: T): T {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as T;
}

function buildSeedSnapshot() {
  return cloneSeed(mockInvoices);
}

let snapshot = buildSeedSnapshot();
const listeners = new Set<() => void>();

function hydrate() {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    snapshot = raw ? (JSON.parse(raw) as Invoice[]) : buildSeedSnapshot();
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

function nextInvoiceNumber(records: Invoice[]) {
  const max = records.reduce((highest, invoice) => {
    const parsed = Number.parseInt(invoice.invoiceNumber.replace(/\D/g, ''), 10);
    return Number.isFinite(parsed) ? Math.max(highest, parsed) : highest;
  }, 0);
  return `INV-${max + 1}`;
}

function normalizeNotes(value: string) {
  const next = value.trim();
  return next.length > 0 ? next : undefined;
}

function buildInvoice(values: InvoiceFormValues, existing?: Invoice): Invoice {
  const { subtotal, tax, total } = calculateInvoiceTotals(values.items, values.taxRate);
  return {
    id: existing?.id ?? crypto.randomUUID(),
    invoiceNumber: existing?.invoiceNumber ?? nextInvoiceNumber(snapshot),
    contactName: values.contactName.trim(),
    items: values.items.map((item) => ({
      description: item.description.trim(),
      amount: item.amount,
    })),
    subtotal,
    tax,
    total,
    status: values.status,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    dueDate: values.dueDate,
    paidAt: values.status === 'paid' ? existing?.paidAt ?? new Date().toISOString() : undefined,
    notes: normalizeNotes(values.notes),
  };
}

export function getInvoicesSnapshot() {
  return snapshot;
}

export function getInvoiceById(id: string) {
  return snapshot.find((invoice) => invoice.id === id);
}

export function createInvoice(values: InvoiceFormValues) {
  const invoice = buildInvoice(values);
  snapshot = [invoice, ...snapshot];
  persist();
  emit();
  return invoice;
}

export function updateInvoice(id: string, values: InvoiceFormValues) {
  let updatedInvoice: Invoice | undefined;

  snapshot = snapshot.map((invoice) => {
    if (invoice.id !== id) return invoice;
    updatedInvoice = buildInvoice(values, invoice);
    return updatedInvoice;
  });

  if (!updatedInvoice) return undefined;
  persist();
  emit();
  return updatedInvoice;
}

export function useInvoicesStore() {
  const invoices = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    invoices,
    create: createInvoice,
    update: updateInvoice,
    getById: getInvoiceById,
  } as const;
}
