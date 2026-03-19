import { tool } from 'ai';
import { z } from 'zod';

export const logAgentActionTool = tool({
  description:
    'Record an action the agent has taken. Every agent should call this after completing work to feed the dashboard activity card and maintain an audit trail.',
  strict: true,
  inputSchema: z.object({
    actionType: z
      .enum([
        'message-sent',
        'invoice-sent',
        'review-requested',
        'booking-created',
        'follow-up-sent',
        'alert-raised',
        'briefing-created',
      ])
      .describe('Category of action taken'),
    description: z.string().describe('Human-readable description of what was done'),
    contactName: z
      .string()
      .optional()
      .describe('Contact this action relates to, if applicable'),
    outcome: z
      .string()
      .optional()
      .describe('Result or outcome of the action'),
  }),
  execute: async ({ actionType, description, contactName, outcome }) => {
    return {
      id: crypto.randomUUID(),
      logged: true as const,
      actionType,
      description,
      contactName: contactName ?? undefined,
      outcome: outcome ?? undefined,
      timestamp: new Date().toISOString(),
    };
  },
});
