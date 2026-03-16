import { tool } from 'ai';
import { z } from 'zod';

export const addNoteTool = tool({
  description:
    'Add a note to a contact record. Use this to record important information from conversations, meetings, or observations about a client.',
  strict: true,
  inputSchema: z.object({
    contactId: z.string().describe('The ID of the contact'),
    contactName: z.string().describe('Full name of the contact'),
    note: z.string().describe('The note content to add'),
  }),
  execute: async ({ contactId, contactName, note }) => {
    return {
      id: crypto.randomUUID(),
      contactId,
      contactName,
      note,
      createdAt: new Date().toISOString(),
      success: true,
    };
  },
});
