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
  {
    id: '6',
    name: 'Alex Rivera',
    phone: '+1 (555) 678-9012',
    email: 'alex.rivera@gmail.com',
    status: 'lead',
    lastContacted: '2026-03-27T09:48:00Z',
    notes: 'Inquiring about full bathroom remodel — 80 sq ft master bath.',
    tags: ['inbound', 'remodel'],
    createdAt: '2026-03-27T09:30:00Z',
  },
  {
    id: '7',
    name: 'David Kim',
    phone: '+1 (555) 789-0123',
    email: 'david.kim@outlook.com',
    status: 'customer',
    lastContacted: '2026-03-20T10:00:00Z',
    notes: 'Sent $1,800 quote for bathroom tile replacement. Invoice #1033 ($2,500) overdue 31 days.',
    tags: ['tile', 'overdue'],
    createdAt: '2025-09-10T08:00:00Z',
  },
  {
    id: '8',
    name: 'Nora Sato',
    phone: '+1 (555) 890-1234',
    email: 'nora.sato@gmail.com',
    status: 'prospect',
    lastContacted: '2026-03-08T11:00:00Z',
    notes: 'Sent $2,200 quote for kitchen backsplash. Quote expires Mar 19.',
    tags: ['kitchen', 'quote-sent'],
    createdAt: '2026-02-28T14:00:00Z',
  },
  {
    id: '9',
    name: 'Rachel Kim',
    phone: '+1 (555) 901-2345',
    email: 'rachel.k@gmail.com',
    status: 'customer',
    lastContacted: '2026-03-26T08:15:00Z',
    notes: 'Left a 5-star Google review. Regular client — haircuts.',
    tags: ['review', 'regular'],
    createdAt: '2025-08-20T10:00:00Z',
  },
  {
    id: '10',
    name: 'Tom Brennan',
    phone: '+1 (555) 012-3456',
    email: 'tom.brennan@yahoo.com',
    status: 'customer',
    lastContacted: '2026-03-26T07:45:00Z',
    notes: 'Left a 4-star Google review — mentioned wait time issue.',
    tags: ['review'],
    createdAt: '2025-10-05T09:00:00Z',
  },
  {
    id: '11',
    name: 'Janet Liu',
    phone: '+1 (555) 321-6540',
    email: 'janet.liu@icloud.com',
    status: 'customer',
    lastContacted: '2026-03-25T19:30:00Z',
    notes: 'Left a 2-star review — unhappy with color treatment. Needs follow-up to make it right.',
    tags: ['review', 'needs-attention'],
    createdAt: '2025-11-12T11:00:00Z',
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
  '6': [
    { id: 'm17', contactId: '6', text: "Hi there! I'm looking to get my master bathroom completely remodeled — new tile, vanity, fixtures, the works. The room is about 80 sq ft. Could you give me a rough estimate and your availability for the next few weeks? Thanks!", direction: 'inbound', timestamp: '2026-03-27T09:30:00Z', status: 'read' },
  ],
  '7': [
    { id: 'm18', contactId: '7', text: 'Hey David, just sent over the tile replacement quote — let me know if you have any questions!', direction: 'outbound', timestamp: '2026-03-13T10:00:00Z', status: 'read' },
    { id: 'm19', contactId: '7', text: "Got it, thanks! I'll take a look this weekend.", direction: 'inbound', timestamp: '2026-03-13T10:30:00Z', status: 'read' },
  ],
  '8': [
    { id: 'm20', contactId: '8', text: "Hi Nora! Here's the quote for the kitchen backsplash we discussed. Let me know what you think!", direction: 'outbound', timestamp: '2026-03-08T11:00:00Z', status: 'delivered' },
  ],
  '9': [
    { id: 'm21', contactId: '9', text: 'Thanks for coming in today, Rachel! Hope you love the new cut.', direction: 'outbound', timestamp: '2026-03-25T16:00:00Z', status: 'read' },
    { id: 'm22', contactId: '9', text: 'I love it! You always nail it. Already left you a review on Google 😊', direction: 'inbound', timestamp: '2026-03-25T17:00:00Z', status: 'read' },
  ],
  '10': [
    { id: 'm23', contactId: '10', text: 'Thanks for coming in, Tom! Let me know if you need anything.', direction: 'outbound', timestamp: '2026-03-24T15:00:00Z', status: 'read' },
    { id: 'm24', contactId: '10', text: 'Haircut looks great, appreciate it. Just wish I didn\'t have to wait so long!', direction: 'inbound', timestamp: '2026-03-24T16:00:00Z', status: 'read' },
  ],
  '11': [
    { id: 'm25', contactId: '11', text: 'Hi Janet, how are you liking the color?', direction: 'outbound', timestamp: '2026-03-24T14:00:00Z', status: 'read' },
    { id: 'm26', contactId: '11', text: "Honestly, it came out way darker than I wanted. I showed you reference photos and it's nothing like them. Pretty disappointed.", direction: 'inbound', timestamp: '2026-03-25T10:00:00Z', status: 'read' },
    { id: 'm27', contactId: '11', text: "I'm really sorry to hear that, Janet. I'd love to get you back in for a correction at no charge — would this week work?", direction: 'outbound', timestamp: '2026-03-25T10:30:00Z', status: 'delivered' },
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
  '6': [],
  '7': [
    { id: 'b21', contactId: '7', title: 'Bathroom Tile Replacement', date: '2026-03-13', time: '10:00 AM', duration: 30, status: 'completed', amount: 1800, notes: 'Quote sent for tile replacement' },
    { id: 'b22', contactId: '7', title: 'Callback — Quote Discussion', date: '2026-03-27', time: '4:30 PM', duration: 30, status: 'upcoming', notes: 'Wants to discuss tile quote' },
  ],
  '8': [
    { id: 'b23', contactId: '8', title: 'Kitchen Backsplash Estimate', date: '2026-03-05', time: '11:00 AM', duration: 45, status: 'completed', amount: 0, notes: 'On-site measurement and discussion' },
  ],
  '9': [
    { id: 'b24', contactId: '9', title: 'Haircut', date: '2026-03-25', time: '3:00 PM', duration: 30, status: 'completed', amount: 450 },
    { id: 'b25', contactId: '9', title: 'Haircut', date: '2026-04-22', time: '3:00 PM', duration: 30, status: 'upcoming' },
  ],
  '10': [
    { id: 'b26', contactId: '10', title: 'Haircut', date: '2026-03-24', time: '2:00 PM', duration: 30, status: 'completed', amount: 400 },
  ],
  '11': [
    { id: 'b27', contactId: '11', title: 'Color Treatment', date: '2026-03-23', time: '1:00 PM', duration: 90, status: 'completed', amount: 1200 },
    { id: 'b28', contactId: '11', title: 'Color Correction (Complimentary)', date: '2026-03-28', time: '1:00 PM', duration: 90, status: 'upcoming', notes: 'Free fix-up for unsatisfactory color result' },
  ],
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
  '6': [
    { id: 'a34', type: 'message', description: 'Alex inquired about full bathroom remodel', timestamp: '2026-03-27T09:30:00Z' },
    { id: 'a35', type: 'created', description: 'Contact created', timestamp: '2026-03-27T09:30:00Z' },
  ],
  '7': [
    { id: 'a36', type: 'message', description: 'David confirmed he\'d review the tile quote', timestamp: '2026-03-13T10:30:00Z' },
    { id: 'a37', type: 'booking', description: 'Callback scheduled for Mar 27 at 4:30 PM', timestamp: '2026-03-27T08:15:00Z' },
    { id: 'a38', type: 'created', description: 'Contact created', timestamp: '2025-09-10T08:00:00Z' },
  ],
  '8': [
    { id: 'a39', type: 'booking', description: 'Kitchen backsplash estimate completed', timestamp: '2026-03-05T12:00:00Z' },
    { id: 'a40', type: 'message', description: 'Quote sent for kitchen backsplash — $2,200', timestamp: '2026-03-08T11:00:00Z' },
    { id: 'a41', type: 'created', description: 'Contact created', timestamp: '2026-02-28T14:00:00Z' },
  ],
  '9': [
    { id: 'a42', type: 'booking', description: 'Haircut completed', timestamp: '2026-03-25T15:30:00Z' },
    { id: 'a43', type: 'message', description: 'Rachel left a 5-star Google review', timestamp: '2026-03-25T17:00:00Z' },
    { id: 'a44', type: 'created', description: 'Contact created', timestamp: '2025-08-20T10:00:00Z' },
  ],
  '10': [
    { id: 'a45', type: 'booking', description: 'Haircut completed', timestamp: '2026-03-24T14:30:00Z' },
    { id: 'a46', type: 'message', description: 'Tom mentioned wait time issue', timestamp: '2026-03-24T16:00:00Z' },
    { id: 'a47', type: 'created', description: 'Contact created', timestamp: '2025-10-05T09:00:00Z' },
  ],
  '11': [
    { id: 'a48', type: 'booking', description: 'Color treatment completed — $120', timestamp: '2026-03-23T14:30:00Z' },
    { id: 'a49', type: 'message', description: 'Janet reported unhappy with color result', timestamp: '2026-03-25T10:00:00Z' },
    { id: 'a50', type: 'booking', description: 'Color correction scheduled for Mar 28', timestamp: '2026-03-25T10:30:00Z' },
    { id: 'a51', type: 'created', description: 'Contact created', timestamp: '2025-11-12T11:00:00Z' },
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
