import type { ActiveAgent, AgentAction } from '@/lib/marketplace/types';
import type { Contact, TextMessage, Booking, ActivityEvent, Conversation } from '@/lib/messages/types';

// ── Scenario definitions ─────────────────────────────────────────────────────

export type ScenarioId = 'busy' | 'handled' | 'fresh';

export type ScenarioMeta = {
  id: ScenarioId;
  name: string;
  description: string;
  ownerName: string;
  ownerFullName: string;
};

export const SCENARIOS: ScenarioMeta[] = [
  { id: 'busy', name: '10k a Month', description: '8 approvals, active leads', ownerName: 'Kyle', ownerFullName: 'Kyle Thacker' },
  { id: 'handled', name: 'All Handled', description: 'Agents ran everything', ownerName: 'Mia', ownerFullName: 'Mia Chen' },
  { id: 'fresh', name: 'Just Started', description: 'New business, no setup yet', ownerName: 'Alex', ownerFullName: 'Alex Rivera' },
];

export function getScenarioMeta(id: ScenarioId): ScenarioMeta {
  return SCENARIOS.find((s) => s.id === id)!;
}

// ── Scenario data loaders ────────────────────────────────────────────────────

export function getScenarioConversations(id: ScenarioId): Conversation[] {
  switch (id) {
    case 'busy': return getBusyConversations();
    case 'handled': return getHandledConversations();
    case 'fresh': return getFreshConversations();
  }
}

export function getScenarioActiveAgents(id: ScenarioId): ActiveAgent[] {
  switch (id) {
    case 'busy': return getBusyActiveAgents();
    case 'handled': return getHandledActiveAgents();
    case 'fresh': return [];
  }
}

// ── Busy scenario (current data — re-exports) ───────────────────────────────

function getBusyConversations(): Conversation[] {
  // Dynamically import to avoid circular deps
  const { getConversations } = require('@/lib/messages/mock-data');
  return getConversations();
}

function getBusyActiveAgents(): ActiveAgent[] {
  const { activeAgents } = require('@/lib/marketplace/data');
  return activeAgents;
}

// ── "All Handled" scenario — Mia's Salon ────────────────────────────────────

const handledContacts: Contact[] = [
  {
    id: 'h1', name: 'Lena Brooks', phone: '+1 (555) 111-2222', email: 'lena.b@gmail.com',
    status: 'customer', lastContacted: '2026-03-27T10:00:00Z',
    notes: 'Regular — every 6 weeks for cut & color.',
    tags: ['regular', 'color'], createdAt: '2025-04-10T10:00:00Z',
  },
  {
    id: 'h2', name: 'Derek Pham', phone: '+1 (555) 222-3333', email: 'derek.pham@yahoo.com',
    status: 'customer', lastContacted: '2026-03-26T14:00:00Z',
    notes: 'Referred by Lena. Prefers Saturday mornings.',
    tags: ['referral'], createdAt: '2025-09-01T08:00:00Z',
  },
  {
    id: 'h3', name: 'Sofia Ruiz', phone: '+1 (555) 333-4444', email: 'sofia@theruiz.co',
    status: 'customer', lastContacted: '2026-03-25T16:00:00Z',
    notes: 'Bridal party in April — needs 4 updos.',
    tags: ['bridal', 'event'], createdAt: '2026-01-15T09:00:00Z',
  },
  {
    id: 'h4', name: 'Marcus Cole', phone: '+1 (555) 444-5555',
    status: 'lead', lastContacted: '2026-03-27T08:30:00Z',
    tags: ['walk-in'], createdAt: '2026-03-27T08:30:00Z',
  },
];

const handledMessages: Record<string, TextMessage[]> = {
  h1: [
    { id: 'hm1', contactId: 'h1', text: 'See you Thursday at 2!', direction: 'outbound', timestamp: '2026-03-27T10:00:00Z', status: 'delivered' },
  ],
  h2: [
    { id: 'hm2', contactId: 'h2', text: 'Thanks for yesterday, love the cut!', direction: 'inbound', timestamp: '2026-03-26T14:00:00Z', status: 'read' },
    { id: 'hm3', contactId: 'h2', text: 'So glad you like it Derek! See you next time.', direction: 'outbound', timestamp: '2026-03-26T14:30:00Z', status: 'delivered' },
  ],
  h3: [
    { id: 'hm4', contactId: 'h3', text: 'Hi! Can we schedule the trial run for the updos?', direction: 'inbound', timestamp: '2026-03-25T16:00:00Z', status: 'read' },
    { id: 'hm5', contactId: 'h3', text: 'Absolutely! How about next Saturday at 11am?', direction: 'outbound', timestamp: '2026-03-25T16:30:00Z', status: 'delivered' },
  ],
  h4: [
    { id: 'hm6', contactId: 'h4', text: 'Hi, do you have any openings today?', direction: 'inbound', timestamp: '2026-03-27T08:30:00Z', status: 'read' },
    { id: 'hm7', contactId: 'h4', text: "Hey Marcus! We have a 1pm slot open. Want me to book that for you?", direction: 'outbound', timestamp: '2026-03-27T08:31:00Z', status: 'delivered' },
    { id: 'hm8', contactId: 'h4', text: 'Perfect, 1pm works!', direction: 'inbound', timestamp: '2026-03-27T08:35:00Z', status: 'read' },
  ],
};

const handledBookings: Record<string, Booking[]> = {
  h1: [{ id: 'hb1', contactId: 'h1', title: 'Cut & Color', date: '2026-03-30', time: '2:00 PM', duration: 90, status: 'upcoming' }],
  h2: [
    { id: 'hb2', contactId: 'h2', title: 'Haircut', date: '2026-03-26', time: '11:00 AM', duration: 30, status: 'completed', amount: 1000 },
    { id: 'hb5', contactId: 'h2', title: 'Callback — Follow-up', date: '2026-03-28', time: '4:00 PM', duration: 15, status: 'upcoming', notes: 'Quick check-in call' },
  ],
  h3: [{ id: 'hb3', contactId: 'h3', title: 'Bridal Trial — Updos', date: '2026-04-02', time: '11:00 AM', duration: 120, status: 'upcoming', notes: '4 updos for bridal party' }],
  h4: [{ id: 'hb4', contactId: 'h4', title: 'Haircut', date: '2026-03-27', time: '1:00 PM', duration: 30, status: 'completed', amount: 0 }],
};

const handledActivity: Record<string, ActivityEvent[]> = {
  h1: [{ id: 'ha1', type: 'message', description: 'Confirmed Thursday appointment', timestamp: '2026-03-27T10:00:00Z' }],
  h2: [{ id: 'ha2', type: 'message', description: 'Derek said he loved the cut', timestamp: '2026-03-26T14:00:00Z' }],
  h3: [{ id: 'ha3', type: 'message', description: 'Scheduled bridal trial run', timestamp: '2026-03-25T16:30:00Z' }],
  h4: [{ id: 'ha4', type: 'message', description: 'Walk-in booked for 1pm', timestamp: '2026-03-27T08:35:00Z' }],
};

function getHandledConversations(): Conversation[] {
  return handledContacts.map((contact) => ({
    contact,
    messages: handledMessages[contact.id] ?? [],
    bookings: handledBookings[contact.id] ?? [],
    activity: handledActivity[contact.id] ?? [],
    unreadCount: 0,
  }));
}

function getHandledActiveAgents(): ActiveAgent[] {
  const now = new Date().toISOString();
  return [
    {
      agentId: 'speed-to-lead',
      autonomy: 'auto' as const,
      activatedAt: '2026-01-10',
      paused: false,
      outcomes: { 'leads responded': 112, 'avg response time (sec)': 14, 'conversations started': 89 },
      recentActions: [
        { id: 'ha-sl1', agentId: 'speed-to-lead', description: 'Auto-responded to walk-in inquiry from Marcus Cole', tool: 'sendMessage', status: 'executed' as const, createdAt: '2026-03-27T08:31:00Z', contactName: 'Marcus Cole' },
        { id: 'ha-sl2', agentId: 'speed-to-lead', description: 'Auto-responded to Instagram DM from Tina Alvarez', tool: 'sendMessage', status: 'executed' as const, createdAt: '2026-03-26T19:00:00Z', contactName: 'Tina Alvarez' },
        { id: 'ha-sl3', agentId: 'speed-to-lead', description: 'Auto-responded to website form — Jordan Lee asking about balayage', tool: 'sendMessage', status: 'executed' as const, createdAt: '2026-03-26T11:00:00Z', contactName: 'Jordan Lee' },
      ],
    },
    {
      agentId: 'review-responder',
      autonomy: 'auto' as const,
      activatedAt: '2026-01-15',
      paused: false,
      outcomes: { 'reviews responded': 47, 'avg response time (hrs)': 1.3 },
      recentActions: [
        { id: 'ha-rr1', agentId: 'review-responder', description: 'Responded to 5-star Google review', tool: 'sendMessage', status: 'executed' as const, createdAt: '2026-03-27T07:00:00Z', contactName: 'Derek Pham' },
        { id: 'ha-rr2', agentId: 'review-responder', description: 'Responded to 4-star Google review', tool: 'sendMessage', status: 'executed' as const, createdAt: '2026-03-25T10:00:00Z', contactName: 'Sofia Ruiz' },
      ],
    },
    {
      agentId: 'reputation-builder',
      autonomy: 'auto' as const,
      activatedAt: '2026-02-01',
      paused: false,
      outcomes: { 'reviews collected': 52, 'avg rating': 4.9 },
      recentActions: [
        { id: 'ha-rb1', agentId: 'reputation-builder', description: 'Sent review request after haircut', tool: 'sendMessage', status: 'executed' as const, createdAt: '2026-03-26T15:00:00Z', contactName: 'Derek Pham' },
        { id: 'ha-rb2', agentId: 'reputation-builder', description: 'Sent review request after color treatment', tool: 'sendMessage', status: 'executed' as const, createdAt: '2026-03-25T17:00:00Z', contactName: 'Lena Brooks' },
      ],
    },
    {
      agentId: 'receptionist',
      autonomy: 'auto' as const,
      activatedAt: '2026-01-10',
      paused: false,
      outcomes: { 'bookings managed': 340, 'reminders sent': 520 },
      recentActions: [
        { id: 'ha-rx1', agentId: 'receptionist', description: 'Booked walk-in slot for Marcus Cole at 1pm', tool: 'createBooking', status: 'executed' as const, createdAt: '2026-03-27T08:35:00Z', contactName: 'Marcus Cole' },
        { id: 'ha-rx2', agentId: 'receptionist', description: 'Sent appointment reminder to Lena Brooks', tool: 'sendMessage', status: 'executed' as const, createdAt: '2026-03-27T08:00:00Z', contactName: 'Lena Brooks' },
        { id: 'ha-rx3', agentId: 'receptionist', description: 'Confirmed bridal trial with Sofia Ruiz', tool: 'sendMessage', status: 'executed' as const, createdAt: '2026-03-25T16:30:00Z', contactName: 'Sofia Ruiz' },
      ],
    },
    {
      agentId: 'friendly-collector',
      autonomy: 'auto' as const,
      activatedAt: '2026-02-15',
      paused: false,
      outcomes: { 'reminders sent': 28, 'collected ($)': 8400 },
      recentActions: [
        { id: 'ha-fc1', agentId: 'friendly-collector', description: 'Payment received from Lena Brooks — $180', tool: 'logAgentAction', status: 'executed' as const, createdAt: '2026-03-26T12:00:00Z', contactName: 'Lena Brooks' },
      ],
    },
  ];
}

// ── "Just Started" scenario — Fresh Start Studio ────────────────────────────

const freshContacts: Contact[] = [
  {
    id: 'f1', name: 'Mom', phone: '+1 (555) 000-1111',
    status: 'customer', lastContacted: '2026-03-26T18:00:00Z',
    notes: 'Test contact', tags: ['test'], createdAt: '2026-03-25T10:00:00Z',
  },
];

function getFreshConversations(): Conversation[] {
  return freshContacts.map((contact) => ({
    contact,
    messages: [
      { id: 'fm1', contactId: 'f1', text: 'Testing 1 2 3!', direction: 'outbound' as const, timestamp: '2026-03-26T18:00:00Z', status: 'delivered' as const },
    ],
    bookings: [],
    activity: [
      { id: 'fa1', type: 'created' as const, description: 'Contact created', timestamp: '2026-03-25T10:00:00Z' },
    ],
    unreadCount: 0,
  }));
}
