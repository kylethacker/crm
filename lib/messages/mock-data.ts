import type { Contact, TextMessage, Booking, ActivityEvent, Conversation } from './types';

const contacts: Contact[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    phone: '+1 (555) 123-4567',
    email: 'sarah.chen@acmecorp.com',
    company: 'Acme Corp',
    status: 'customer',
    lastContacted: '2026-03-08T14:30:00Z',
    notes: 'Key decision maker for the enterprise plan. Prefers communication via text. Follow up on Q2 renewal.',
    tags: ['enterprise', 'renewal-q2', 'vip'],
    createdAt: '2025-06-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    phone: '+1 (555) 234-5678',
    email: 'marcus@startupxyz.io',
    company: 'StartupXYZ',
    status: 'lead',
    lastContacted: '2026-03-07T09:15:00Z',
    notes: 'Interested in the pro plan. Has a team of 12. Wants a demo next week.',
    tags: ['pro-plan', 'demo-scheduled'],
    createdAt: '2026-02-20T08:00:00Z',
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    phone: '+1 (555) 345-6789',
    email: 'elena@designstudio.co',
    company: 'Design Studio Co',
    status: 'prospect',
    lastContacted: '2026-03-06T16:45:00Z',
    notes: 'Met at SaaS conference. Expressed interest in integrations.',
    tags: ['conference-lead', 'integrations'],
    createdAt: '2026-03-01T12:00:00Z',
  },
  {
    id: '4',
    name: 'James Wright',
    phone: '+1 (555) 456-7890',
    email: 'j.wright@techfirm.com',
    company: 'TechFirm Inc',
    status: 'customer',
    lastContacted: '2026-03-05T11:20:00Z',
    notes: 'On the starter plan. Might upgrade soon.',
    tags: ['starter', 'upsell-opportunity'],
    createdAt: '2025-11-10T09:00:00Z',
  },
  {
    id: '5',
    name: 'Priya Patel',
    phone: '+1 (555) 567-8901',
    email: 'priya@mediaco.com',
    company: 'MediaCo',
    status: 'lead',
    lastContacted: '2026-03-04T13:00:00Z',
    tags: ['inbound', 'website-signup'],
    createdAt: '2026-03-04T13:00:00Z',
  },
];

const messagesByContact: Record<string, TextMessage[]> = {
  '1': [
    { id: 'm1', contactId: '1', text: 'Hi Sarah! Just wanted to check in on how things are going with the platform.', direction: 'outbound', timestamp: '2026-03-08T14:00:00Z', status: 'read' },
    { id: 'm2', contactId: '1', text: 'Hey! Everything is going great. The team loves it. We actually wanted to talk about adding more seats.', direction: 'inbound', timestamp: '2026-03-08T14:05:00Z', status: 'read' },
    { id: 'm3', contactId: '1', text: "That's awesome to hear! How many additional seats are you thinking?", direction: 'outbound', timestamp: '2026-03-08T14:10:00Z', status: 'read' },
    { id: 'm4', contactId: '1', text: "Probably 15 more. We're expanding the marketing department.", direction: 'inbound', timestamp: '2026-03-08T14:15:00Z', status: 'read' },
    { id: 'm5', contactId: '1', text: "Perfect. I can get you a quote for that. With your current plan, you'd get a volume discount. I'll send it over by EOD.", direction: 'outbound', timestamp: '2026-03-08T14:20:00Z', status: 'delivered' },
    { id: 'm6', contactId: '1', text: 'Sounds good, thanks! Also, quick question - do you have any updates on the API v2 launch?', direction: 'inbound', timestamp: '2026-03-08T14:30:00Z', status: 'read' },
  ],
  '2': [
    { id: 'm7', contactId: '2', text: 'Hi Marcus, thanks for your interest! Would next Tuesday at 2pm work for a demo?', direction: 'outbound', timestamp: '2026-03-07T09:00:00Z', status: 'read' },
    { id: 'm8', contactId: '2', text: 'Tuesday works! Can we make it 3pm instead? I have a standup at 2.', direction: 'inbound', timestamp: '2026-03-07T09:10:00Z', status: 'read' },
    { id: 'm9', contactId: '2', text: '3pm is perfect. I\'ll send a calendar invite. Should I include anyone else from your team?', direction: 'outbound', timestamp: '2026-03-07T09:15:00Z', status: 'delivered' },
  ],
  '3': [
    { id: 'm10', contactId: '3', text: 'Hi Elena! Great meeting you at the SaaS conference. As promised, here\'s some info about our integration capabilities.', direction: 'outbound', timestamp: '2026-03-05T10:00:00Z', status: 'read' },
    { id: 'm11', contactId: '3', text: 'Thanks for reaching out! I was just telling my co-founder about your product. Can you send me a pricing breakdown?', direction: 'inbound', timestamp: '2026-03-05T14:30:00Z', status: 'read' },
    { id: 'm12', contactId: '3', text: 'Absolutely! I\'ll email that over. Would you also be open to a quick call this week to walk through the integration options?', direction: 'outbound', timestamp: '2026-03-06T09:00:00Z', status: 'read' },
    { id: 'm13', contactId: '3', text: 'Sure, Thursday afternoon works best for me.', direction: 'inbound', timestamp: '2026-03-06T16:45:00Z', status: 'read' },
  ],
  '4': [
    { id: 'm14', contactId: '4', text: "Hey James, noticed your team has been using the export feature a lot. Did you know the Pro plan includes automated reports?", direction: 'outbound', timestamp: '2026-03-05T11:00:00Z', status: 'read' },
    { id: 'm15', contactId: '4', text: "Oh interesting, I didn't know that. What's the price difference?", direction: 'inbound', timestamp: '2026-03-05T11:20:00Z', status: 'read' },
  ],
  '5': [
    { id: 'm16', contactId: '5', text: 'Hi! I signed up on your website and had a few questions about the platform.', direction: 'inbound', timestamp: '2026-03-04T13:00:00Z', status: 'read' },
  ],
};

const bookingsByContact: Record<string, Booking[]> = {
  '1': [
    { id: 'b1', contactId: '1', title: 'Quarterly Business Review', date: '2026-03-20', time: '10:00 AM', duration: 60, status: 'upcoming', notes: 'Discuss Q2 renewal and seat expansion' },
    { id: 'b15', contactId: '1', title: 'API v2 Launch Sync', date: '2026-03-17', time: '9:00 AM', duration: 45, status: 'upcoming', notes: 'Walk through new API endpoints' },
    { id: 'b2', contactId: '1', title: 'Onboarding - Marketing Team', date: '2026-02-10', time: '2:00 PM', duration: 45, status: 'completed', amount: 0 },
    { id: 'b3', contactId: '1', title: 'Enterprise Plan Demo', date: '2025-06-20', time: '11:00 AM', duration: 30, status: 'completed', amount: 0 },
    { id: 'b4', contactId: '1', title: 'Implementation Kickoff', date: '2025-07-01', time: '9:00 AM', duration: 90, status: 'completed', amount: 4500, notes: 'Enterprise plan signed' },
    { id: 'b5', contactId: '1', title: 'Q4 Check-in', date: '2025-12-15', time: '3:00 PM', duration: 30, status: 'completed', amount: 0 },
  ],
  '2': [
    { id: 'b6', contactId: '2', title: 'Product Demo', date: '2026-03-11', time: '3:00 PM', duration: 45, status: 'upcoming', notes: 'Pro plan demo for team of 12' },
    { id: 'b16', contactId: '2', title: 'Pro Plan Follow-up', date: '2026-03-18', time: '2:00 PM', duration: 30, status: 'upcoming', notes: 'Discuss pricing and next steps' },
    { id: 'b17', contactId: '2', title: 'Contract Review', date: '2026-03-21', time: '11:00 AM', duration: 45, status: 'upcoming' },
    { id: 'b7', contactId: '2', title: 'Discovery Call', date: '2026-02-25', time: '10:00 AM', duration: 30, status: 'completed', amount: 0 },
  ],
  '3': [
    { id: 'b8', contactId: '3', title: 'Integration Walkthrough', date: '2026-03-12', time: '2:00 PM', duration: 45, status: 'upcoming', notes: 'Walk through Zapier, API, and webhook options' },
    { id: 'b18', contactId: '3', title: 'Technical Deep Dive', date: '2026-03-19', time: '3:00 PM', duration: 60, status: 'upcoming', notes: 'Review webhook payload formats' },
  ],
  '4': [
    { id: 'b9', contactId: '4', title: 'Pro Plan Upgrade Call', date: '2026-03-14', time: '11:00 AM', duration: 30, status: 'upcoming', amount: 0 },
    { id: 'b19', contactId: '4', title: 'Team Training Session', date: '2026-03-17', time: '1:00 PM', duration: 60, status: 'upcoming', notes: 'Onboard 3 new team members' },
    { id: 'b20', contactId: '4', title: 'March Check-in', date: '2026-03-20', time: '2:00 PM', duration: 30, status: 'upcoming' },
    { id: 'b10', contactId: '4', title: 'Starter Plan Onboarding', date: '2025-11-15', time: '1:00 PM', duration: 45, status: 'completed', amount: 1200, notes: 'Starter plan signed' },
    { id: 'b11', contactId: '4', title: 'Follow-up Training', date: '2025-12-01', time: '10:00 AM', duration: 30, status: 'completed', amount: 0 },
    { id: 'b12', contactId: '4', title: 'Monthly Check-in', date: '2026-01-15', time: '2:00 PM', duration: 30, status: 'no-show' },
    { id: 'b13', contactId: '4', title: 'Monthly Check-in (Rescheduled)', date: '2026-01-22', time: '2:00 PM', duration: 30, status: 'completed', amount: 0 },
    { id: 'b14', contactId: '4', title: 'February Check-in', date: '2026-02-20', time: '11:00 AM', duration: 30, status: 'cancelled', notes: 'Client requested to cancel' },
  ],
  '5': [],
};

const activityByContact: Record<string, ActivityEvent[]> = {
  '1': [
    { id: 'a1', type: 'message', description: 'Sarah asked about API v2 launch', timestamp: '2026-03-08T14:30:00Z' },
    { id: 'a2', type: 'message', description: 'You sent a quote for 15 additional seats', timestamp: '2026-03-08T14:20:00Z' },
    { id: 'a3', type: 'booking', description: 'Quarterly Business Review scheduled for Mar 20', timestamp: '2026-03-08T10:00:00Z' },
    { id: 'a4', type: 'tag-added', description: 'Tag "vip" added', timestamp: '2026-03-01T09:00:00Z' },
    { id: 'a5', type: 'booking', description: 'Onboarding - Marketing Team completed', timestamp: '2026-02-10T15:00:00Z' },
    { id: 'a6', type: 'note', description: 'Updated notes: Follow up on Q2 renewal', timestamp: '2026-02-05T11:00:00Z' },
    { id: 'a7', type: 'booking', description: 'Q4 Check-in completed', timestamp: '2025-12-15T15:30:00Z' },
    { id: 'a8', type: 'status-change', description: 'Status changed from Lead to Customer', timestamp: '2025-07-01T09:00:00Z' },
    { id: 'a9', type: 'booking', description: 'Implementation Kickoff completed — $4,500', timestamp: '2025-07-01T10:30:00Z' },
    { id: 'a10', type: 'booking', description: 'Enterprise Plan Demo completed', timestamp: '2025-06-20T11:30:00Z' },
    { id: 'a11', type: 'created', description: 'Contact created', timestamp: '2025-06-15T10:00:00Z' },
  ],
  '2': [
    { id: 'a12', type: 'message', description: 'You scheduled a demo for Tuesday at 3pm', timestamp: '2026-03-07T09:15:00Z' },
    { id: 'a13', type: 'booking', description: 'Product Demo scheduled for Mar 11', timestamp: '2026-03-07T09:20:00Z' },
    { id: 'a14', type: 'booking', description: 'Discovery Call completed', timestamp: '2026-02-25T10:30:00Z' },
    { id: 'a15', type: 'tag-added', description: 'Tag "demo-scheduled" added', timestamp: '2026-02-25T11:00:00Z' },
    { id: 'a16', type: 'created', description: 'Contact created', timestamp: '2026-02-20T08:00:00Z' },
  ],
  '3': [
    { id: 'a17', type: 'message', description: 'Elena confirmed Thursday afternoon for a call', timestamp: '2026-03-06T16:45:00Z' },
    { id: 'a18', type: 'booking', description: 'Integration Walkthrough scheduled for Mar 12', timestamp: '2026-03-06T09:30:00Z' },
    { id: 'a19', type: 'message', description: 'You sent integration capabilities info', timestamp: '2026-03-05T10:00:00Z' },
    { id: 'a20', type: 'tag-added', description: 'Tag "conference-lead" added', timestamp: '2026-03-01T12:00:00Z' },
    { id: 'a21', type: 'created', description: 'Contact created', timestamp: '2026-03-01T12:00:00Z' },
  ],
  '4': [
    { id: 'a22', type: 'message', description: 'James asked about Pro plan pricing', timestamp: '2026-03-05T11:20:00Z' },
    { id: 'a23', type: 'booking', description: 'Pro Plan Upgrade Call scheduled for Mar 14', timestamp: '2026-03-05T12:00:00Z' },
    { id: 'a24', type: 'booking', description: 'February Check-in cancelled by client', timestamp: '2026-02-20T11:00:00Z' },
    { id: 'a25', type: 'booking', description: 'Monthly Check-in (Rescheduled) completed', timestamp: '2026-01-22T14:30:00Z' },
    { id: 'a26', type: 'booking', description: 'Monthly Check-in — no show', timestamp: '2026-01-15T14:00:00Z' },
    { id: 'a27', type: 'booking', description: 'Follow-up Training completed', timestamp: '2025-12-01T10:30:00Z' },
    { id: 'a28', type: 'status-change', description: 'Status changed from Lead to Customer', timestamp: '2025-11-15T13:00:00Z' },
    { id: 'a29', type: 'booking', description: 'Starter Plan Onboarding completed — $1,200', timestamp: '2025-11-15T13:45:00Z' },
    { id: 'a30', type: 'created', description: 'Contact created', timestamp: '2025-11-10T09:00:00Z' },
  ],
  '5': [
    { id: 'a31', type: 'message', description: 'Priya reached out with questions about the platform', timestamp: '2026-03-04T13:00:00Z' },
    { id: 'a32', type: 'tag-added', description: 'Tag "website-signup" added', timestamp: '2026-03-04T13:00:00Z' },
    { id: 'a33', type: 'created', description: 'Contact created', timestamp: '2026-03-04T13:00:00Z' },
  ],
};

export function getConversations(): Conversation[] {
  return contacts.map((contact) => ({
    contact,
    messages: messagesByContact[contact.id] ?? [],
    bookings: bookingsByContact[contact.id] ?? [],
    activity: activityByContact[contact.id] ?? [],
    unreadCount: contact.id === '1' ? 1 : contact.id === '5' ? 1 : 0,
  }));
}

export function getConversation(contactId: string): Conversation | undefined {
  const contact = contacts.find((c) => c.id === contactId);
  if (!contact) return undefined;
  return {
    contact,
    messages: messagesByContact[contact.id] ?? [],
    bookings: bookingsByContact[contact.id] ?? [],
    activity: activityByContact[contact.id] ?? [],
    unreadCount: 0,
  };
}

export function findConversationByName(name: string): Conversation | undefined {
  const contact = contacts.find((c) => c.name.toLowerCase() === name.toLowerCase());
  if (!contact) return undefined;
  return {
    contact,
    messages: messagesByContact[contact.id] ?? [],
    bookings: bookingsByContact[contact.id] ?? [],
    activity: activityByContact[contact.id] ?? [],
    unreadCount: 0,
  };
}
