import { tool } from 'ai';
import { z } from 'zod';

export const escalateToOwnerTool = tool({
  description:
    'Flag something for the business owner\'s personal attention. Use this for edge cases: VIP customers at risk, complex discount requests, overdue invoices 15+ days, or situations requiring human judgment.',
  strict: true,
  inputSchema: z.object({
    urgency: z
      .enum(['low', 'medium', 'high'])
      .describe('How urgent is this escalation'),
    reason: z.string().describe('Why this needs human attention'),
    contactName: z
      .string()
      .optional()
      .describe('Contact this escalation is about, if applicable'),
    suggestedAction: z
      .string()
      .describe('What the agent recommends the owner do'),
  }),
  execute: async ({ urgency, reason, contactName, suggestedAction }) => {
    return {
      id: crypto.randomUUID(),
      escalated: true as const,
      urgency,
      reason,
      contactName: contactName ?? undefined,
      suggestedAction,
      timestamp: new Date().toISOString(),
    };
  },
});
