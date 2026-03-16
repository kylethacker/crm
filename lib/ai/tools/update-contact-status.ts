import { tool } from 'ai';
import { z } from 'zod';

export const updateContactStatusTool = tool({
  description:
    'Update the status of a contact in the CRM. Use this when a lead converts to a customer, a prospect becomes a lead, etc.',
  strict: true,
  inputSchema: z.object({
    contactId: z.string().describe('The ID of the contact to update'),
    newStatus: z.enum(['lead', 'customer', 'prospect']).describe('The new status for the contact'),
    reason: z.string().optional().describe('Brief reason for the status change'),
  }),
  execute: async ({ contactId, newStatus, reason }) => {
    return {
      contactId,
      newStatus,
      reason: reason ?? undefined,
      updatedAt: new Date().toISOString(),
      success: true,
    };
  },
});
