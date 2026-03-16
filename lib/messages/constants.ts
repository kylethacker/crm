import type { Conversation } from './types';

export type QuickAction = {
  id: string;
  label: string;
  prompt: string;
  priority?: 'high' | 'normal';
};

export function getQuickActions(conversation: Conversation): QuickAction[] {
  const { contact, messages, bookings } = conversation;
  const firstName = contact.name.split(' ')[0];
  const lastInbound = [...messages].reverse().find((m) => m.direction === 'inbound');
  const upcomingBooking = bookings.find((b) => b.status === 'upcoming');
  const hasRevenue = bookings.some((b) => b.amount && b.status === 'completed');
  const hasNoShow = bookings.some((b) => b.status === 'no-show');

  const actions: QuickAction[] = [];

  // Overdue response: last inbound message >24h old
  if (lastInbound) {
    const hoursSince = (Date.now() - new Date(lastInbound.timestamp).getTime()) / (1000 * 60 * 60);
    if (hoursSince > 24) {
      actions.push({
        id: 'overdue-response',
        label: `Respond to ${firstName}`,
        prompt: `Draft a response to ${firstName}'s message. It's been over ${Math.floor(hoursSince / 24)} day${Math.floor(hoursSince / 24) !== 1 ? 's' : ''} since they last messaged.`,
        priority: 'high',
      });
    }
  }

  // Payment follow-up: completed booking without invoice
  const completedWithAmount = bookings.filter((b) => b.status === 'completed' && b.amount && b.amount > 0);
  if (completedWithAmount.length > 0 && (hasRevenue || contact.status === 'customer')) {
    actions.push({
      id: 'invoice',
      label: 'Invoice',
      prompt: `Draft an invoice for ${contact.name}. Look at their booking history and recent conversation to determine what to invoice for, and suggest appropriate line items.`,
    });
  }

  if (lastInbound) {
    actions.push({
      id: 'follow-up',
      label: 'Follow up',
      prompt: `Draft a follow-up message to ${firstName}. Consider our recent conversation and figure out the best thing to say next.`,
    });
  }

  if (upcomingBooking) {
    actions.push({
      id: 'prep',
      label: `Prep for ${upcomingBooking.title.length > 20 ? upcomingBooking.title.slice(0, 20) + '...' : upcomingBooking.title}`,
      prompt: `Help me prepare for my upcoming "${upcomingBooking.title}" with ${firstName} on ${upcomingBooking.date}. Summarize what I need to know and suggest an agenda.`,
    });
  }

  if (contact.status === 'lead' || contact.status === 'prospect') {
    actions.push({
      id: 'nurture',
      label: 'Nurture',
      prompt: `${firstName} is a ${contact.status}. Based on our conversation history, draft a message to move this relationship forward. Consider what they've expressed interest in.`,
    });
  }

  // Re-engagement: no messages in 14+ days for a customer
  if (contact.status === 'customer' && contact.lastContacted) {
    const daysSince = Math.floor(
      (Date.now() - new Date(contact.lastContacted).getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysSince >= 14) {
      actions.push({
        id: 're-engage',
        label: 'Check in',
        prompt: `${firstName} is a customer we haven't contacted in ${daysSince} days. Draft a friendly check-in message to re-engage them.`,
      });
    }
  }

  // No-show follow-up
  if (hasNoShow) {
    actions.push({
      id: 'no-show',
      label: 'No-show follow-up',
      prompt: `${firstName} had a no-show recently. Draft a friendly follow-up message to reschedule.`,
    });
  }

  return actions;
}
