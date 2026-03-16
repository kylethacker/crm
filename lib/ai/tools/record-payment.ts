import { tool } from 'ai';
import { z } from 'zod';

export const recordPaymentTool = tool({
  description:
    'Record a payment against an invoice. Use this when a client has paid an invoice.',
  strict: true,
  inputSchema: z.object({
    invoiceId: z.string().describe('The ID of the invoice being paid'),
    invoiceNumber: z.string().describe('The invoice number (e.g. INV-1043)'),
    contactName: z.string().describe('Name of the contact who paid'),
    amount: z.number().describe('Payment amount in USD'),
    paymentMethod: z.string().optional().describe('Payment method (e.g. "credit card", "cash", "bank transfer")'),
  }),
  execute: async ({ invoiceId, invoiceNumber, contactName, amount, paymentMethod }) => {
    return {
      id: crypto.randomUUID(),
      invoiceId,
      invoiceNumber,
      contactName,
      amount,
      paymentMethod: paymentMethod ?? 'not specified',
      status: 'paid' as const,
      paidAt: new Date().toISOString(),
      success: true,
    };
  },
});
