import { tool } from 'ai';
import { z } from 'zod';
import { mockQuotes } from '@/lib/quotes/mock-data';

export const getQuotesTool = tool({
  description:
    'Query quotes/estimates by status or contact. Use this to find open quotes needing follow-up, check which quotes have been viewed, or review expired proposals.',
  strict: true,
  inputSchema: z.object({
    status: z
      .enum(['draft', 'sent', 'viewed', 'accepted', 'expired'])
      .optional()
      .describe('Filter by quote status'),
    contactName: z.string().optional().describe('Filter by contact name'),
    limit: z.number().default(10).describe('Maximum number of quotes to return'),
  }),
  execute: async ({ status, contactName, limit }) => {
    const today = new Date().toISOString().split('T')[0]!;

    let results = mockQuotes.map((q) => {
      const daysOpen = Math.floor(
        (Date.now() - new Date(q.createdAt).getTime()) / (1000 * 60 * 60 * 24),
      );

      return {
        quoteNumber: q.quoteNumber,
        contactName: q.contactName,
        total: q.total,
        status: q.status,
        sentDate: q.sentDate ?? null,
        viewedDate: q.viewedDate ?? null,
        daysOpen,
        items: q.items,
        validUntil: q.validUntil,
        isExpired: q.validUntil < today && q.status !== 'accepted',
      };
    });

    if (status) {
      results = results.filter((r) => r.status === status);
    }
    if (contactName) {
      results = results.filter(
        (r) => r.contactName.toLowerCase() === contactName.toLowerCase(),
      );
    }

    return results.slice(0, limit);
  },
});
