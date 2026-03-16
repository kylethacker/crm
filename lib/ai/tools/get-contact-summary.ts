import { tool } from 'ai';
import { z } from 'zod';
import { findConversationByName, getConversations } from '@/lib/messages/mock-data';

export const getContactSummaryTool = tool({
  description:
    'Look up a contact by name and return their full profile including messages, bookings, activity, and relationship health. Use this when the user asks about a specific person.',
  strict: true,
  inputSchema: z.object({
    name: z.string().describe('The name (or partial name) of the contact to look up'),
  }),
  execute: async ({ name }) => {
    // Try exact match first
    let conversation = findConversationByName(name);

    // Try partial match
    if (!conversation) {
      const conversations = getConversations();
      conversation = conversations.find((c) =>
        c.contact.name.toLowerCase().includes(name.toLowerCase()),
      );
    }

    if (!conversation) {
      return { found: false as const, name, message: `No contact found matching "${name}"` };
    }

    const { contact, messages, bookings, activity } = conversation;

    const totalRevenue = bookings
      .filter((b) => b.status === 'completed' && b.amount)
      .reduce((sum, b) => sum + (b.amount ?? 0), 0);

    const daysSinceContact = contact.lastContacted
      ? Math.floor(
          (Date.now() - new Date(contact.lastContacted).getTime()) / (1000 * 60 * 60 * 24),
        )
      : null;

    const relationshipHealth =
      daysSinceContact === null
        ? 'unknown'
        : daysSinceContact < 7
          ? 'active'
          : daysSinceContact < 14
            ? 'cooling'
            : 'at-risk';

    return {
      found: true as const,
      contact: {
        id: contact.id,
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        company: contact.company,
        status: contact.status,
        tags: contact.tags,
        notes: contact.notes,
        createdAt: contact.createdAt,
      },
      totalRevenue,
      daysSinceContact,
      relationshipHealth,
      messageCount: messages.length,
      recentMessages: messages.slice(-5).map((m) => ({
        text: m.text,
        direction: m.direction,
        timestamp: m.timestamp,
      })),
      upcomingBookings: bookings
        .filter((b) => b.status === 'upcoming')
        .map((b) => ({
          title: b.title,
          date: b.date,
          time: b.time,
          notes: b.notes,
        })),
      completedBookings: bookings.filter((b) => b.status === 'completed').length,
      recentActivity: activity.slice(0, 5).map((a) => ({
        type: a.type,
        description: a.description,
        timestamp: a.timestamp,
      })),
    };
  },
});
