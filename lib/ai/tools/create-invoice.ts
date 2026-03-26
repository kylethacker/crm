import { tool } from 'ai';
import { calculateInvoiceTotals, createInvoiceInputSchema } from '@/lib/invoices/schema';

let invoiceCounter = 1042;

export const createInvoiceTool = tool({
  description:
    'Create a new invoice for a contact. Use this when the user wants to send an invoice, bill a client, or create a payment request. When editing a previously created invoice, set revisionOf to the original invoice ID.',
  strict: true,
  inputSchema: createInvoiceInputSchema,
  execute: async ({ contactName, items, taxRate, dueDate, notes, revisionOf }) => {
    invoiceCounter += 1;
    const { subtotal, tax, total } = calculateInvoiceTotals(items, taxRate);

    return {
      id: crypto.randomUUID(),
      invoiceNumber: `INV-${invoiceCounter}`,
      contactName,
      items,
      subtotal,
      tax,
      total,
      taxRate,
      status: 'draft' as const,
      createdAt: new Date().toISOString(),
      dueDate,
      notes: notes ?? undefined,
      revisionOf: revisionOf ?? undefined,
    };
  },
});
