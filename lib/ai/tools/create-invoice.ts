import { tool } from 'ai';
import { z } from 'zod';

let invoiceCounter = 1042;

export const createInvoiceTool = tool({
  description:
    'Create a new invoice for a contact. Use this when the user wants to send an invoice, bill a client, or create a payment request.',
  strict: true,
  inputSchema: z.object({
    contactName: z.string().describe('Full name of the contact to invoice'),
    items: z
      .array(
        z.object({
          description: z.string().describe('Line item description'),
          amount: z.number().describe('Amount in USD for this line item'),
        }),
      )
      .describe('Invoice line items'),
    taxRate: z
      .number()
      .default(0)
      .describe('Tax rate as a percentage (e.g. 8.5 for 8.5%)'),
    dueDate: z.string().describe('Due date in YYYY-MM-DD format'),
    notes: z.string().optional().describe('Optional notes for the invoice'),
  }),
  execute: async ({ contactName, items, taxRate, dueDate, notes }) => {
    invoiceCounter += 1;
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const tax = Math.round(subtotal * (taxRate / 100) * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

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
    };
  },
});
