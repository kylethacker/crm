import { tool } from 'ai';
import { z } from 'zod';
import { getConversations } from '@/lib/messages/mock-data';
import { mockInvoices } from '@/lib/invoices/mock-data';

export const getWeekSummaryTool = tool({
  description:
    'Get an aggregated summary for a given week: bookings by day, revenue status, contact health, and top priorities. Use this for weekly planning and briefings.',
  strict: true,
  inputSchema: z.object({
    weekStartDate: z
      .string()
      .describe('Start date of the week in YYYY-MM-DD format (typically a Monday)'),
  }),
  execute: async ({ weekStartDate }) => {
    const conversations = getConversations();
    const weekStart = new Date(weekStartDate + 'T00:00:00');
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const weekEndStr = weekEnd.toISOString().split('T')[0]!;

    // Bookings this week
    const weekBookings: Array<{
      day: string;
      title: string;
      contactName: string;
      time: string;
    }> = [];

    const newLeads: string[] = [];
    const atRisk: string[] = [];
    const needsFollowUp: string[] = [];

    for (const conv of conversations) {
      const { contact, bookings } = conv;

      for (const booking of bookings) {
        if (
          booking.status === 'upcoming' &&
          booking.date >= weekStartDate &&
          booking.date <= weekEndStr
        ) {
          weekBookings.push({
            day: booking.date,
            title: booking.title,
            contactName: contact.name,
            time: booking.time,
          });
        }
      }

      // Contact health
      if (contact.lastContacted) {
        const daysSince = Math.floor(
          (Date.now() - new Date(contact.lastContacted).getTime()) / (1000 * 60 * 60 * 24),
        );
        if (daysSince >= 14) atRisk.push(contact.name);
        else if (daysSince >= 7) needsFollowUp.push(contact.name);
      }

      if (contact.status === 'lead') {
        const createdDaysAgo = Math.floor(
          (Date.now() - new Date(contact.createdAt).getTime()) / (1000 * 60 * 60 * 24),
        );
        if (createdDaysAgo <= 14) newLeads.push(contact.name);
      }
    }

    // Revenue from invoices
    const collected = mockInvoices
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);
    const outstanding = mockInvoices
      .filter((inv) => inv.status === 'sent')
      .reduce((sum, inv) => sum + inv.total, 0);
    const overdue = mockInvoices
      .filter((inv) => inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.total, 0);

    // Build top priorities
    const topPriorities: Array<{
      action: string;
      contactName: string;
      reason: string;
      urgency: 'low' | 'medium' | 'high';
    }> = [];

    // Overdue invoices are high priority
    for (const inv of mockInvoices.filter((i) => i.status === 'overdue')) {
      const daysPast = Math.floor(
        (Date.now() - new Date(inv.dueDate + 'T00:00:00').getTime()) / (1000 * 60 * 60 * 24),
      );
      topPriorities.push({
        action: 'Collect payment',
        contactName: inv.contactName,
        reason: `Invoice ${inv.invoiceNumber} ($${inv.total}) is ${daysPast} days overdue`,
        urgency: daysPast > 14 ? 'high' : 'medium',
      });
    }

    // At-risk contacts
    for (const name of atRisk) {
      topPriorities.push({
        action: 'Re-engage customer',
        contactName: name,
        reason: 'No contact in 14+ days — at risk of churning',
        urgency: 'high',
      });
    }

    // Follow-ups
    for (const name of needsFollowUp) {
      topPriorities.push({
        action: 'Follow up',
        contactName: name,
        reason: 'No contact in 7+ days',
        urgency: 'medium',
      });
    }

    // Sort by urgency
    const urgencyOrder = { high: 0, medium: 1, low: 2 };
    topPriorities.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

    // Group bookings by day
    const bookingsByDay: Record<string, number> = {};
    for (const b of weekBookings) {
      bookingsByDay[b.day] = (bookingsByDay[b.day] ?? 0) + 1;
    }

    return {
      weekStartDate,
      bookings: {
        total: weekBookings.length,
        byDay: bookingsByDay,
        details: weekBookings,
      },
      revenue: {
        collected,
        outstanding,
        overdue,
      },
      contacts: {
        newLeads,
        atRisk,
        needsFollowUp,
      },
      topPriorities: topPriorities.slice(0, 5),
    };
  },
});
