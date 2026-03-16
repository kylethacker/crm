import { tool } from 'ai';
import { z } from 'zod';
import { getConversations } from '@/lib/messages/mock-data';

export const getTodayScheduleTool = tool({
  description:
    'Get today\'s schedule including all bookings and pending action items. Use this for morning briefings or when the user asks what they have coming up today.',
  strict: true,
  inputSchema: z.object({}),
  execute: async () => {
    const conversations = getConversations();
    const today = new Date().toISOString().split('T')[0]!;

    const todayBookings: Array<{
      title: string;
      contactName: string;
      time: string;
      duration: number;
      notes?: string;
    }> = [];

    const upcomingBookings: Array<{
      title: string;
      contactName: string;
      date: string;
      time: string;
    }> = [];

    const pendingFollowUps: Array<{
      contactName: string;
      lastContactDate: string;
      daysSince: number;
      reason: string;
    }> = [];

    let unreadMessages = 0;
    const unreadFrom: string[] = [];

    for (const conv of conversations) {
      for (const booking of conv.bookings) {
        if (booking.status === 'upcoming') {
          if (booking.date === today) {
            todayBookings.push({
              title: booking.title,
              contactName: conv.contact.name,
              time: booking.time,
              duration: booking.duration,
              notes: booking.notes,
            });
          } else if (booking.date > today) {
            upcomingBookings.push({
              title: booking.title,
              contactName: conv.contact.name,
              date: booking.date,
              time: booking.time,
            });
          }
        }
      }

      if (conv.unreadCount > 0) {
        unreadMessages += conv.unreadCount;
        unreadFrom.push(conv.contact.name);
      }

      if (conv.contact.lastContacted) {
        const lastContact = new Date(conv.contact.lastContacted);
        const daysSince = Math.floor(
          (Date.now() - lastContact.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (daysSince >= 5) {
          pendingFollowUps.push({
            contactName: conv.contact.name,
            lastContactDate: conv.contact.lastContacted,
            daysSince,
            reason:
              daysSince >= 14
                ? 'At risk — no contact in 2+ weeks'
                : daysSince >= 7
                  ? 'Cooling — no contact in 1+ week'
                  : 'Due for follow-up',
          });
        }
      }
    }

    todayBookings.sort((a, b) => a.time.localeCompare(b.time));
    upcomingBookings.sort((a, b) => a.date.localeCompare(b.date));
    pendingFollowUps.sort((a, b) => b.daysSince - a.daysSince);

    return {
      date: today,
      todayBookings,
      upcomingBookings: upcomingBookings.slice(0, 5),
      pendingFollowUps,
      unreadMessages,
      unreadFrom,
    };
  },
});
