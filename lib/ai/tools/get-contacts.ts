import { tool } from 'ai';
import { z } from 'zod';
import { getConversations } from '@/lib/messages/mock-data';

export const getContactsTool = tool({
  description:
    'Bulk-query contacts with filters. Use this to find contacts by status, tag, or engagement recency. Great for identifying at-risk customers, overdue follow-ups, or leads needing attention.',
  strict: true,
  inputSchema: z.object({
    status: z
      .enum(['lead', 'customer', 'prospect'])
      .optional()
      .describe('Filter by contact status'),
    tag: z.string().optional().describe('Filter by tag (e.g. "vip", "renewal-q2")'),
    minDaysSinceContact: z
      .number()
      .optional()
      .describe('Only return contacts not contacted in at least this many days'),
    sortBy: z
      .enum(['lastContacted', 'revenue', 'createdAt'])
      .default('lastContacted')
      .describe('Sort order for results'),
    limit: z.number().default(10).describe('Maximum number of contacts to return'),
  }),
  execute: async ({ status, tag, minDaysSinceContact, sortBy, limit }) => {
    const conversations = getConversations();
    const now = Date.now();

    let results = conversations.map((conv) => {
      const { contact, bookings, messages } = conv;
      const daysSinceContact = contact.lastContacted
        ? Math.floor((now - new Date(contact.lastContacted).getTime()) / (1000 * 60 * 60 * 24))
        : null;
      const totalRevenue = bookings
        .filter((b) => b.status === 'completed' && b.amount)
        .reduce((sum, b) => sum + (b.amount ?? 0), 0);
      const upcomingBookingCount = bookings.filter((b) => b.status === 'upcoming').length;
      const lastMessage = messages[messages.length - 1];

      return {
        name: contact.name,
        phone: contact.phone,
        status: contact.status,
        tags: contact.tags ?? [],
        daysSinceContact,
        totalRevenue,
        upcomingBookingCount,
        createdAt: contact.createdAt,
        lastMessageSnippet: lastMessage
          ? `${lastMessage.direction === 'inbound' ? '←' : '→'} ${lastMessage.text.slice(0, 80)}`
          : null,
      };
    });

    if (status) {
      results = results.filter((r) => r.status === status);
    }
    if (tag) {
      results = results.filter((r) => r.tags.includes(tag));
    }
    if (minDaysSinceContact !== undefined) {
      results = results.filter(
        (r) => r.daysSinceContact !== null && r.daysSinceContact >= minDaysSinceContact,
      );
    }

    results.sort((a, b) => {
      if (sortBy === 'revenue') return b.totalRevenue - a.totalRevenue;
      if (sortBy === 'createdAt') return b.createdAt.localeCompare(a.createdAt);
      // lastContacted: most overdue first
      return (b.daysSinceContact ?? 999) - (a.daysSinceContact ?? 999);
    });

    return results.slice(0, limit);
  },
});
