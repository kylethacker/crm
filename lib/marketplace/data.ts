import type { AgentDefinition, ActiveAgent } from './types';

// ── Agent definitions ────────────────────────────────────────────────────────
// Each agent: what it monitors, what tools it uses, what it does.

export const agentDefinitions: AgentDefinition[] = [
  {
    id: 'speed-to-lead',
    name: 'Lead Responder',
    role: 'Responds to new leads instantly',
    problem: 'I lose leads because I can\'t respond fast enough',
    does: 'Watches for new inquiries — web forms, texts, missed calls. Drafts a personalized response and sends it within 60 seconds. If the lead is ready to book, it books them.',
    triggers: [
      { type: 'event', description: 'When a new lead comes in' },
    ],
    tools: ['draftMessage', 'sendMessage', 'createBooking', 'getContactSummary', 'getContacts', 'getCalendarSlots', 'getBusinessConfig', 'logAgentAction', 'escalateToOwner'],
    defaultAutonomy: 'draft-approve',
    icon: '⚡',
    price: 29,
    expectedOutcome: '3x faster lead response on average',
    highlights: [
      'Responds to new leads within 60 seconds',
      'Personalizes messages based on inquiry context',
      'Books ready-to-go leads automatically',
      'Escalates complex inquiries to you',
    ],
  },
  {
    id: 'deal-closer',
    name: 'Deal Closer',
    role: 'Follows up on every open quote',
    problem: 'I forget to follow up and lose deals',
    does: 'Checks for open quotes and proposals daily. Drafts follow-ups based on how long it\'s been and whether the client has been active. Knows when to escalate to you for a personal touch.',
    triggers: [
      { type: 'schedule', description: 'Every morning at 9am' },
      { type: 'event', description: 'When a quote is viewed' },
    ],
    tools: ['draftMessage', 'sendMessage', 'getContactSummary', 'getContacts', 'getQuotes', 'getInvoices', 'createQuote', 'createInvoice', 'getBusinessConfig', 'logAgentAction', 'escalateToOwner'],
    defaultAutonomy: 'draft-approve',
    icon: '🤝',
    price: 39,
    expectedOutcome: 'Recovers $2,300/mo in forgotten deals',
    highlights: [
      'Monitors every open quote daily',
      'Times follow-ups based on client engagement',
      'Detects when a quote has been viewed',
      'Knows when to loop you in for the personal touch',
    ],
  },
  {
    id: 'reputation-builder',
    name: 'Reputation Builder',
    role: 'Gets you more 5-star reviews',
    problem: 'My online reputation doesn\'t reflect how good we are',
    does: 'After a completed booking, sends a friendly review request to happy customers. Waits for the right moment — not too soon, not too late. Can respond to reviews in your voice.',
    triggers: [
      { type: 'event', description: 'When a booking is completed' },
    ],
    tools: ['draftMessage', 'sendMessage', 'getContactSummary', 'getReviewStatus', 'sendReviewRequest', 'getBusinessConfig', 'logAgentAction', 'escalateToOwner'],
    defaultAutonomy: 'auto',
    icon: '⭐',
    price: 19,
    expectedOutcome: '4-6 new five-star reviews per month',
    highlights: [
      'Sends review requests after completed bookings',
      'Picks the right moment — not too soon, not too late',
      'Direct links to Google and Yelp',
      'Tracks your rating and review count over time',
    ],
  },
  {
    id: 'slot-filler',
    name: 'Slot Filler',
    role: 'Fills last-minute cancellations',
    problem: 'I have empty slots on my calendar this week',
    does: 'Checks your calendar each morning for gaps. Finds contacts who are overdue for a visit and sends them a personalized "we had an opening" message.',
    triggers: [
      { type: 'schedule', description: 'Every morning at 8am' },
      { type: 'event', description: 'When a booking is cancelled' },
    ],
    tools: ['draftMessage', 'sendMessage', 'getContactSummary', 'getContacts', 'getCalendarSlots', 'createBooking', 'getBusinessConfig', 'logAgentAction', 'escalateToOwner'],
    defaultAutonomy: 'draft-approve',
    icon: '📅',
    price: 24,
    expectedOutcome: 'Fills 8-12 empty slots per month',
    highlights: [
      'Scans your calendar each morning for gaps',
      'Finds overdue-for-a-visit contacts to fill slots',
      'Sends personalized "we had an opening" messages',
      'Reacts instantly when bookings get cancelled',
    ],
  },
  {
    id: 'friendly-collector',
    name: 'Friendly Collector',
    role: 'Gets you paid without the awkward conversation',
    problem: 'Collecting payment is awkward and I have overdue invoices',
    does: 'Monitors unpaid invoices. Sends friendly reminders at smart intervals — gentle at first, more direct as time goes on. Matches the tone to your relationship with the client.',
    triggers: [
      { type: 'schedule', description: 'Every morning at 10am' },
    ],
    tools: ['draftMessage', 'sendMessage', 'getContactSummary', 'getInvoices', 'createInvoice', 'sendInvoice', 'getBusinessConfig', 'logAgentAction', 'escalateToOwner'],
    defaultAutonomy: 'draft-approve',
    icon: '💰',
    price: 29,
    expectedOutcome: 'Cuts average days-to-payment by 40%',
    highlights: [
      'Monitors all unpaid invoices automatically',
      'Escalates tone gradually — friendly to firm',
      'Matches tone to your relationship with the client',
      'Flags invoices 15+ days overdue for your attention',
    ],
  },
  {
    id: 'churn-preventer',
    name: 'Churn Preventer',
    role: 'Saves customers before they leave',
    problem: 'I don\'t know which customers I\'m about to lose',
    does: 'Tracks how often each customer visits. When a regular breaks their pattern, drafts a personal "we miss you" message. Flags VIP customers for your personal attention.',
    triggers: [
      { type: 'schedule', description: 'Every Monday morning' },
    ],
    tools: ['draftMessage', 'sendMessage', 'getContactSummary', 'getContacts', 'getWeekSummary', 'addNote', 'getBusinessConfig', 'logAgentAction', 'escalateToOwner'],
    defaultAutonomy: 'draft-approve',
    icon: '🛡️',
    price: 34,
    expectedOutcome: 'Saves 2-3 at-risk customers per month',
    highlights: [
      'Tracks visit frequency for every customer',
      'Detects when a regular breaks their pattern',
      'Drafts personal "we miss you" re-engagement messages',
      'Flags VIP customers for your personal attention',
    ],
  },
  {
    id: 'week-planner',
    name: 'Week Planner',
    role: 'Plans your week so you don\'t have to',
    problem: 'I spend Sunday night planning my week and it takes forever',
    does: 'Every Sunday evening, pulls together your week: who to follow up with, bookings to prep for, revenue vs. goals, overdue invoices. Gives you the 3 most impactful things to do Monday.',
    triggers: [
      { type: 'schedule', description: 'Every Sunday at 6pm' },
    ],
    tools: ['getContactSummary', 'getContacts', 'getCalendarSlots', 'getInvoices', 'getQuotes', 'getWeekSummary', 'getBusinessConfig', 'logAgentAction'],
    defaultAutonomy: 'auto',
    icon: '📋',
    price: 0,
    expectedOutcome: 'Saves 2+ hours of planning every week',
    highlights: [
      'Weekly briefing every Sunday evening',
      'Surfaces follow-ups, bookings, and revenue at a glance',
      'Identifies the 3 most impactful things for Monday',
      'Tracks overdue invoices and at-risk contacts',
    ],
  },
];

const agentIndex = new Map(agentDefinitions.map((a) => [a.id, a]));

export function getAgentDef(id: string): AgentDefinition | undefined {
  return agentIndex.get(id);
}

// ── Active agents (mock state) ───────────────────────────────────────────────

export const activeAgents: ActiveAgent[] = [
  {
    agentId: 'reputation-builder',
    autonomy: 'auto',
    activatedAt: '2026-02-15',
    paused: false,
    outcomes: { 'reviews collected': 34, 'avg rating': 4.8 },
    recentActions: [
      { id: 'a1', agentId: 'reputation-builder', description: 'Sent review request to Sarah Johnson after her haircut', tool: 'sendMessage', status: 'executed', createdAt: '2026-03-17T14:30:00Z', contactName: 'Sarah Johnson' },
      { id: 'a2', agentId: 'reputation-builder', description: 'Sent review request to Mike Chen after consultation', tool: 'sendMessage', status: 'executed', createdAt: '2026-03-16T11:00:00Z', contactName: 'Mike Chen' },
      { id: 'a6', agentId: 'reputation-builder', description: 'Review request sent to Angela Rivera — completed color treatment', tool: 'sendMessage', status: 'executed', createdAt: '2026-03-14T16:45:00Z', contactName: 'Angela Rivera' },
      { id: 'a7', agentId: 'reputation-builder', description: 'Skipped review request for Tom Walsh — last visit was a no-show', tool: 'logAgentAction', status: 'executed', createdAt: '2026-03-13T10:00:00Z', contactName: 'Tom Walsh' },
      { id: 'a8', agentId: 'reputation-builder', description: 'Review request sent to Priya Patel after styling appointment', tool: 'sendMessage', status: 'executed', createdAt: '2026-03-11T15:20:00Z', contactName: 'Priya Patel' },
      { id: 'a9', agentId: 'reputation-builder', description: 'Sent follow-up to James Lee who opened but didn\'t leave a review', tool: 'sendMessage', status: 'executed', createdAt: '2026-03-09T09:30:00Z', contactName: 'James Lee' },
      { id: 'a10', agentId: 'reputation-builder', description: 'New 5-star review detected from Rachel Kim on Google', tool: 'getReviewStatus', status: 'executed', createdAt: '2026-03-07T12:00:00Z', contactName: 'Rachel Kim' },
    ],
  },
  {
    agentId: 'deal-closer',
    autonomy: 'draft-approve',
    activatedAt: '2026-03-01',
    paused: false,
    outcomes: { 'deals closed': 8, 'revenue recovered': 18400 },
    recentActions: [
      { id: 'a3', agentId: 'deal-closer', description: 'Follow-up drafted for David Kim — quote opened but no response in 5 days', tool: 'draftMessage', status: 'proposed', createdAt: '2026-03-18T09:00:00Z', contactName: 'David Kim' },
      { id: 'a4', agentId: 'deal-closer', description: 'Sent follow-up to Lisa Tran — quote accepted, invoice sent', tool: 'sendMessage', status: 'executed', createdAt: '2026-03-17T09:15:00Z', contactName: 'Lisa Tran' },
      { id: 'a11', agentId: 'deal-closer', description: 'Reminder drafted for Nora Sato — quote expires in 2 days', tool: 'draftMessage', status: 'proposed', createdAt: '2026-03-17T09:00:00Z', contactName: 'Nora Sato' },
      { id: 'a12', agentId: 'deal-closer', description: 'Follow-up sent to Carlos Mendez — closed $2,400 kitchen remodel quote', tool: 'sendMessage', status: 'executed', createdAt: '2026-03-15T10:30:00Z', contactName: 'Carlos Mendez' },
      { id: 'a13', agentId: 'deal-closer', description: 'Created invoice for Emily Watson — $850 consultation package', tool: 'createInvoice', status: 'executed', createdAt: '2026-03-13T14:00:00Z', contactName: 'Emily Watson' },
      { id: 'a14', agentId: 'deal-closer', description: 'Quote viewed by Brian Park — scheduled follow-up for tomorrow', tool: 'logAgentAction', status: 'executed', createdAt: '2026-03-12T08:45:00Z', contactName: 'Brian Park' },
      { id: 'a15', agentId: 'deal-closer', description: 'Escalated Jordan Blake to owner — high-value quote ($5,200) stalled 10+ days', tool: 'escalateToOwner', status: 'executed', createdAt: '2026-03-10T09:00:00Z', contactName: 'Jordan Blake' },
      { id: 'a16', agentId: 'deal-closer', description: 'Follow-up sent to Amy Nguyen — she replied with questions, drafted answers', tool: 'draftMessage', status: 'executed', createdAt: '2026-03-08T11:15:00Z', contactName: 'Amy Nguyen' },
    ],
  },
  {
    agentId: 'week-planner',
    autonomy: 'auto',
    activatedAt: '2026-01-20',
    paused: false,
    outcomes: { 'briefings sent': 8 },
    recentActions: [
      { id: 'a5', agentId: 'week-planner', description: 'Weekly briefing sent — 4 follow-ups, 6 bookings, $2.1k outstanding', tool: 'getContactSummary', status: 'executed', createdAt: '2026-03-16T18:00:00Z' },
      { id: 'a17', agentId: 'week-planner', description: 'Weekly briefing sent — 3 follow-ups, 8 bookings, $1.4k outstanding', tool: 'getContactSummary', status: 'executed', createdAt: '2026-03-09T18:00:00Z' },
      { id: 'a18', agentId: 'week-planner', description: 'Weekly briefing sent — 5 follow-ups, 4 bookings, $3.2k outstanding', tool: 'getContactSummary', status: 'executed', createdAt: '2026-03-02T18:00:00Z' },
      { id: 'a19', agentId: 'week-planner', description: 'Weekly briefing sent — 2 follow-ups, 7 bookings, revenue on track', tool: 'getContactSummary', status: 'executed', createdAt: '2026-02-23T18:00:00Z' },
      { id: 'a20', agentId: 'week-planner', description: 'Weekly briefing sent — flagged 2 at-risk customers for outreach', tool: 'getContactSummary', status: 'executed', createdAt: '2026-02-16T18:00:00Z' },
      { id: 'a21', agentId: 'week-planner', description: 'Weekly briefing sent — 6 follow-ups, 5 bookings, $2.8k outstanding', tool: 'getContactSummary', status: 'executed', createdAt: '2026-02-09T18:00:00Z' },
    ],
  },
];

const activeIndex = new Map(activeAgents.map((a) => [a.agentId, a]));

export function getActiveAgent(agentId: string): ActiveAgent | undefined {
  return activeIndex.get(agentId);
}

/** Agents not yet activated — the gaps */
const activeIds = new Set(activeAgents.map((a) => a.agentId));
export const availableAgents: AgentDefinition[] = agentDefinitions.filter((a) => !activeIds.has(a.id));

// ── Pending approvals across all agents ──────────────────────────────────────

export function getPendingApprovals() {
  return activeAgents.flatMap((a) => a.recentActions.filter((act) => act.status === 'proposed'));
}

// ── Shared helpers ───────────────────────────────────────────────────────────

export function buildHirePrompt(agent: AgentDefinition): string {
  return `I want to add a ${agent.name} to my team. The problem I'm trying to solve: "${agent.problem}". Set it up for me.`;
}

export function formatTopOutcome(outcomes: Record<string, number>): string | null {
  const entry = Object.entries(outcomes)[0];
  if (!entry) return null;
  return `${entry[1].toLocaleString()} ${entry[0]}`;
}
