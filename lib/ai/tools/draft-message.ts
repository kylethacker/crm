import { tool } from 'ai';
import { z } from 'zod';

export const draftMessageTool = tool({
  description:
    'Draft an SMS/text message to send to a contact. Use this to compose a message for review before sending. Always draft first so the user can review.',
  strict: true,
  inputSchema: z.object({
    contactName: z.string().describe('Full name of the contact'),
    contactPhone: z.string().describe('Phone number of the contact'),
    text: z.string().describe('The message body to send'),
    context: z
      .string()
      .optional()
      .describe('Brief context for why this message is being sent'),
  }),
  execute: async ({ contactName, contactPhone, text, context }) => {
    return {
      id: crypto.randomUUID(),
      contactName,
      contactPhone,
      text,
      context: context ?? undefined,
      status: 'draft' as const,
      createdAt: new Date().toISOString(),
    };
  },
});
