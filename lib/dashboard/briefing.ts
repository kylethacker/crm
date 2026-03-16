import { getConversations } from '@/lib/messages/mock-data';
import { getCrmStats } from './stats';

export type BriefingItem = {
  label: string;
  detail: string;
  contactName?: string;
  action?: {
    label: string;
    prompt: string;
  };
};

export type DailyBriefing = {
  greeting: string;
  urgentItems: BriefingItem[];
  todaySchedule: BriefingItem[];
  followUps: BriefingItem[];
  wins: BriefingItem[];
};

export function getDailyBriefing(): DailyBriefing {
  const conversations = getConversations();
  const stats = getCrmStats();
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const hour = today.getHours();

  const greeting =
    hour < 12
      ? 'Good morning, Kyle'
      : hour < 17
        ? 'Good afternoon, Kyle'
        : 'Good evening, Kyle';

  const urgentItems: BriefingItem[] = [];
  const todaySchedule: BriefingItem[] = [];
  const followUps: BriefingItem[] = [];
  const wins: BriefingItem[] = [];

  for (const conv of conversations) {
    // Unread messages = urgent
    if (conv.unreadCount > 0) {
      const lastInbound = [...conv.messages].reverse().find((m) => m.direction === 'inbound');
      urgentItems.push({
        label: `Unread message from ${conv.contact.name}`,
        detail: lastInbound ? `"${lastInbound.text.slice(0, 80)}${lastInbound.text.length > 80 ? '...' : ''}"` : 'New message',
        contactName: conv.contact.name,
        action: {
          label: 'Respond',
          prompt: `Draft a response to ${conv.contact.name}'s latest message`,
        },
      });
    }

    for (const booking of conv.bookings) {
      // Today's bookings
      if (booking.status === 'upcoming' && booking.date === todayStr) {
        todaySchedule.push({
          label: `${booking.time} — ${booking.title}`,
          detail: `with ${conv.contact.name}${booking.notes ? ` · ${booking.notes}` : ''}`,
          contactName: conv.contact.name,
          action: {
            label: 'Prep',
            prompt: `Help me prepare for my "${booking.title}" with ${conv.contact.name} today. Summarize what I need to know and suggest an agenda.`,
          },
        });
      }

      // Completed bookings with revenue = wins
      if (booking.status === 'completed' && booking.amount && booking.amount > 0) {
        const bookingDate = new Date(booking.date);
        const daysSince = Math.floor(
          (today.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (daysSince <= 7) {
          wins.push({
            label: `$${booking.amount.toLocaleString()} from ${conv.contact.name}`,
            detail: booking.title,
            contactName: conv.contact.name,
          });
        }
      }
    }

    // Follow-ups
    if (conv.contact.lastContacted) {
      const daysSince = Math.floor(
        (today.getTime() - new Date(conv.contact.lastContacted).getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysSince >= 7) {
        followUps.push({
          label: conv.contact.name,
          detail: `${daysSince} days since last contact${daysSince >= 14 ? ' — at risk' : ''}`,
          contactName: conv.contact.name,
          action: {
            label: 'Reach out',
            prompt: `Draft a check-in message to ${conv.contact.name}. It's been ${daysSince} days since we last talked.`,
          },
        });
      }
    }
  }

  // Sort follow-ups by urgency
  followUps.sort((a, b) => {
    const aDays = parseInt(a.detail);
    const bDays = parseInt(b.detail);
    return bDays - aDays;
  });

  return {
    greeting,
    urgentItems,
    todaySchedule,
    followUps,
    wins,
  };
}
