import { z } from 'zod';

export const quoteItemSchema = z.object({
  description: z.string().trim().min(1, 'Description is required'),
  amount: z.number().finite().min(0, 'Amount must be 0 or more'),
});

export const createQuoteInputSchema = z.object({
  contactName: z.string().trim().min(1).describe('Full name of the contact'),
  items: z
    .array(quoteItemSchema)
    .min(1, 'At least one line item is required')
    .describe('Quote line items'),
  validDays: z
    .number()
    .int()
    .min(1)
    .default(30)
    .describe('Number of days the quote is valid'),
  notes: z.string().optional().describe('Optional notes or terms'),
  revisionOf: z
    .string()
    .optional()
    .describe('Quote number this is a revision of (e.g. QT-2010)'),
});

export const quoteFormSchema = z.object({
  contactName: z.string().trim().min(1, 'Contact name is required'),
  items: z.array(quoteItemSchema).min(1, 'Add at least one line item'),
  validUntil: z.string().min(1, 'Valid until is required'),
  status: z.enum(['draft', 'sent', 'viewed', 'accepted', 'expired']),
  notes: z.union([z.literal(''), z.string().trim()]),
});

export type QuoteFormValues = z.infer<typeof quoteFormSchema>;

export function calculateQuoteTotals(items: Array<{ amount: number }>) {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  return { subtotal, total: subtotal };
}
