import { tool } from 'ai';
import { z } from 'zod';

export const sendInvoiceTool = tool({
  description:
    'Send a previously created draft invoice to the contact. Only use after the user has reviewed and approved the invoice.',
  strict: true,
  inputSchema: z.object({
    invoiceId: z.string().describe('The ID of the invoice to send'),
    invoiceNumber: z.string().describe('The invoice number (e.g. INV-1043)'),
    contactName: z.string().describe('Name of the contact'),
    total: z.number().describe('Total amount of the invoice'),
  }),
  execute: async ({ invoiceId, invoiceNumber, contactName, total }) => {
    return {
      invoiceId,
      invoiceNumber,
      contactName,
      total,
      status: 'sent' as const,
      sentAt: new Date().toISOString(),
    };
  },
});
