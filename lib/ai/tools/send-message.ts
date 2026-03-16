import { tool } from 'ai';
import { z } from 'zod';

export const sendMessageTool = tool({
  description:
    'Send a previously drafted text message to the contact. Only use after the user has reviewed and approved the message.',
  strict: true,
  inputSchema: z.object({
    messageId: z.string().describe('The ID of the drafted message to send'),
    contactName: z.string().describe('Name of the contact'),
    text: z.string().describe('The message text being sent'),
  }),
  execute: async ({ messageId, contactName, text }) => {
    return {
      messageId,
      contactName,
      text,
      status: 'sent' as const,
      sentAt: new Date().toISOString(),
    };
  },
});
