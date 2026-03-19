import { tool } from 'ai';
import { z } from 'zod';

let quoteCounter = 2012;

export const createQuoteTool = tool({
  description:
    'Create a new quote/estimate for a contact. Use this when proposing pricing, creating a proposal, or revising an existing quote. The quote is created as a draft for review before sending.',
  strict: true,
  inputSchema: z.object({
    contactName: z.string().describe('Full name of the contact'),
    items: z
      .array(
        z.object({
          description: z.string().describe('Line item description'),
          amount: z.number().describe('Amount in USD for this line item'),
        }),
      )
      .describe('Quote line items'),
    validDays: z
      .number()
      .default(30)
      .describe('Number of days the quote is valid'),
    notes: z.string().optional().describe('Optional notes or terms'),
    revisionOf: z
      .string()
      .optional()
      .describe('Quote number this is a revision of (e.g. QT-2010)'),
  }),
  execute: async ({ contactName, items, validDays, notes, revisionOf }) => {
    quoteCounter += 1;
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validDays);

    return {
      id: crypto.randomUUID(),
      quoteNumber: `QT-${quoteCounter}`,
      contactName,
      items,
      subtotal,
      total: subtotal,
      status: 'draft' as const,
      createdAt: new Date().toISOString(),
      validUntil: validUntil.toISOString().split('T')[0],
      notes: notes ?? undefined,
      revisionOf: revisionOf ?? undefined,
    };
  },
});
