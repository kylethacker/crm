import { tool } from 'ai';
import { z } from 'zod';

export const draftMessageTool = tool({
  description:
    'Draft an SMS/text message to send to a contact. Use this to compose a message for review before sending. Always draft first so the user can review. When editing a previously drafted message, set revisionOf to the original draft ID.',
  strict: true,
  inputSchema: z.object({
    contactName: z.string().describe('Full name of the contact'),
    contactPhone: z.string().describe('Phone number of the contact'),
    text: z.string().describe('The message body to send'),
    context: z
      .string()
      .optional()
      .describe('Brief context for why this message is being sent'),
    revisionOf: z
      .string()
      .optional()
      .describe('ID of the previous draft this is a revision of. Use when editing an existing draft.'),
  }),
  execute: async ({ contactName, contactPhone, text, context, revisionOf }) => {
    return {
      id: crypto.randomUUID(),
      contactName,
      contactPhone,
      text,
      context: context ?? undefined,
      revisionOf: revisionOf ?? undefined,
      status: 'draft' as const,
      createdAt: new Date().toISOString(),
    };
  },
});
