import { tool } from 'ai';
import { calculateQuoteTotals, createQuoteInputSchema } from '@/lib/quotes/schema';

let quoteCounter = 2012;

export const createQuoteTool = tool({
  description:
    'Create a new quote/estimate for a contact. Use this when proposing pricing, creating a proposal, or revising an existing quote. The quote is created as a draft for review before sending.',
  strict: true,
  inputSchema: createQuoteInputSchema,
  execute: async ({ contactName, items, validDays, notes, revisionOf }) => {
    quoteCounter += 1;
    const { subtotal, total } = calculateQuoteTotals(items);
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validDays);

    return {
      id: crypto.randomUUID(),
      quoteNumber: `QT-${quoteCounter}`,
      contactName,
      items,
      subtotal,
      total,
      status: 'draft' as const,
      createdAt: new Date().toISOString(),
      validUntil: validUntil.toISOString().split('T')[0],
      notes: notes ?? undefined,
      revisionOf: revisionOf ?? undefined,
    };
  },
});
