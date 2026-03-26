'use client';

import { useContactsStore } from '@/lib/contacts/store';
import { useInvoicesStore } from '@/lib/invoices/store';
import { useQuotesStore } from '@/lib/quotes/store';
import type { TableViewType } from '@/lib/views/types';
import { contactDrawerDefinition } from './contact/contact-drawer';
import { invoiceDrawerDefinition } from './invoice/invoice-drawer';
import { quoteDrawerDefinition } from './quote/quote-drawer';
import type { EntityDrawerDefinition } from './types';

export const drawerRegistry = {
  contacts: contactDrawerDefinition,
  invoices: invoiceDrawerDefinition,
  quotes: quoteDrawerDefinition,
} satisfies Record<TableViewType, EntityDrawerDefinition<any, any>>;

export function useEntityDrawerSubscriptions() {
  const { conversations } = useContactsStore();
  const { invoices } = useInvoicesStore();
  const { quotes } = useQuotesStore();
  return { conversations, invoices, quotes } as const;
}
