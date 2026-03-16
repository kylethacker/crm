import { tool } from 'ai';
import { z } from 'zod';

export const addTagTool = tool({
  description:
    'Add a tag to a contact for categorization. Use this to label clients (e.g. "vip", "enterprise", "at-risk").',
  strict: true,
  inputSchema: z.object({
    contactId: z.string().describe('The ID of the contact'),
    contactName: z.string().describe('Full name of the contact'),
    tag: z.string().describe('The tag to add (lowercase, hyphenated, e.g. "vip", "needs-follow-up")'),
  }),
  execute: async ({ contactId, contactName, tag }) => {
    return {
      contactId,
      contactName,
      tag: tag.toLowerCase().replace(/\s+/g, '-'),
      addedAt: new Date().toISOString(),
      success: true,
    };
  },
});
