import { tool } from 'ai';
import { z } from 'zod';
import { mockInvoices } from '@/lib/invoices/mock-data';

export const getInvoicesTool = tool({
  description:
    'Query invoices by status or contact. Use this to find overdue invoices, check payment status, or get a financial overview.',
  strict: true,
  inputSchema: z.object({
    status: z
      .enum(['draft', 'sent', 'paid', 'overdue'])
      .optional()
      .describe('Filter by invoice status'),
    contactName: z.string().optional().describe('Filter by contact name'),
    overdueOnly: z
      .boolean()
      .default(false)
      .describe('Only return overdue invoices'),
    limit: z.number().default(10).describe('Maximum number of invoices to return'),
  }),
  execute: async ({ status, contactName, overdueOnly, limit }) => {
    const today = new Date().toISOString().split('T')[0]!;

    let results = mockInvoices.map((inv) => {
      const daysPastDue =
        inv.status !== 'paid' && inv.dueDate < today
          ? Math.floor(
              (Date.now() - new Date(inv.dueDate + 'T00:00:00').getTime()) /
                (1000 * 60 * 60 * 24),
            )
          : 0;

      return {
        invoiceNumber: inv.invoiceNumber,
        contactName: inv.contactName,
        total: inv.total,
        status: inv.status,
        dueDate: inv.dueDate,
        daysPastDue,
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
    if (overdueOnly) {
      results = results.filter((r) => r.daysPastDue > 0);
    }

    return results.slice(0, limit);
  },
});
