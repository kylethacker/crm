import { tool } from 'ai';
import { updateContactStatusInputSchema } from '@/lib/contacts/schema';

export const updateContactStatusTool = tool({
  description:
    'Update the status of a contact in the CRM. Use this when a lead converts to a customer, a prospect becomes a lead, etc.',
  strict: true,
  inputSchema: updateContactStatusInputSchema,
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
