import { createAgentUIStreamResponse } from 'ai';
import { z } from 'zod';
import { agents, AGENT_NAMES } from '@/lib/ai/agents';
import { getConversations } from '@/lib/messages/mock-data';
import { getCrmStats } from '@/lib/dashboard/stats';

const uiMessageSchema = z
  .object({
    id: z.string(),
    role: z.enum(['user', 'assistant', 'system']),
    parts: z.array(z.record(z.unknown())),
  })
  .passthrough();

const reviewItemContextSchema = z.object({
  type: z.literal('review-item'),
  sourceId: z.string(),
  agentId: z.string(),
  agentName: z.string(),
  description: z.string(),
  detail: z.string().optional(),
  preview: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  contentPreviews: z.array(z.object({
    title: z.string(),
    caption: z.string(),
    platform: z.string(),
    scheduledLabel: z.string(),
    color: z.string(),
  })).optional(),
  status: z.string(),
});

const analyticsContextSchema = z.object({
  type: z.literal('analytics'),
  sourceId: z.string(),
  description: z.string(),
  totalVisitors: z.number(),
  pageViews: z.number(),
  bounceRate: z.number(),
  avgSessionDuration: z.string(),
  trafficSources: z.array(z.object({ source: z.string(), visitors: z.number(), pct: z.number() })),
  topPages: z.array(z.object({ path: z.string(), views: z.number(), avgTime: z.string() })),
});

const dashboardCardContextSchema = z.object({
  type: z.literal('dashboard-card'),
  sourceId: z.string(),
  cardType: z.string(),
  title: z.string(),
  summary: z.string(),
});

const artifactContextSchema = z.discriminatedUnion('type', [
  reviewItemContextSchema,
  analyticsContextSchema,
  dashboardCardContextSchema,
]).optional();

const contactContextSchema = z.object({
  contactId: z.string(),
  name: z.string(),
  phone: z.string(),
  email: z.string().optional(),
  company: z.string().optional(),
  status: z.enum(['lead', 'customer', 'prospect']),
  tags: z.array(z.string()).optional(),
  revenue: z.number().optional(),
  notes: z.string().optional(),
  recentMessages: z.array(z.object({
    text: z.string(),
    direction: z.enum(['inbound', 'outbound']),
    timestamp: z.string(),
  })).optional(),
  bookings: z.array(z.object({
    id: z.string().optional(),
    title: z.string(),
    date: z.string(),
    time: z.string(),
    status: z.string(),
    amount: z.number().optional(),
    notes: z.string().optional(),
  })).optional(),
  recentActivity: z.array(z.object({
    type: z.string(),
    description: z.string(),
    timestamp: z.string(),
  })).optional(),
}).optional();

const chatRequestSchema = z.object({
  messages: z.array(uiMessageSchema).min(1),
  agent: z.enum(AGENT_NAMES).default('operator'),
  artifactContext: artifactContextSchema,
  contactContext: contactContextSchema,
});

function buildBusinessContext(): string {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0]!;
  const conversations = getConversations();
  const stats = getCrmStats();

  // Today's bookings
  const todayBookings: string[] = [];
  const upcomingBookings: string[] = [];
  for (const conv of conversations) {
    for (const booking of conv.bookings) {
      if (booking.status === 'upcoming') {
        if (booking.date === todayStr) {
          todayBookings.push(`  - ${booking.time}: ${booking.title} with ${conv.contact.name}`);
        } else if (booking.date > todayStr) {
          upcomingBookings.push(`  - ${booking.date} ${booking.time}: ${booking.title} with ${conv.contact.name}`);
        }
      }
    }
  }

  // Unread messages
  const unreadContacts: string[] = [];
  let totalUnread = 0;
  for (const conv of conversations) {
    if (conv.unreadCount > 0) {
      totalUnread += conv.unreadCount;
      unreadContacts.push(conv.contact.name);
    }
  }

  // Contacts needing follow-up
  const followUps: string[] = [];
  for (const conv of conversations) {
    if (conv.contact.lastContacted) {
      const daysSince = Math.floor(
        (today.getTime() - new Date(conv.contact.lastContacted).getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysSince >= 5) {
        const urgency = daysSince >= 14 ? 'AT RISK' : daysSince >= 7 ? 'cooling' : 'due';
        followUps.push(`  - ${conv.contact.name} (${daysSince} days, ${urgency})`);
      }
    }
  }

  const lines = [
    '## Today\'s Business Context',
    `- Date: ${todayStr}`,
    `- Today's bookings: ${todayBookings.length === 0 ? 'None' : ''}`,
    ...todayBookings,
    `- Upcoming bookings: ${upcomingBookings.length === 0 ? 'None' : ''}`,
    ...upcomingBookings.slice(0, 5),
    `- Pending invoices: ${stats.totalRevenue > 0 ? `$${stats.totalRevenue.toLocaleString()} total revenue` : 'None tracked'}`,
    `- Unread messages: ${totalUnread === 0 ? 'None' : `${totalUnread} from ${unreadContacts.join(', ')}`}`,
    `- Contacts needing follow-up:${followUps.length === 0 ? ' All caught up' : ''}`,
    ...followUps,
    `- Total contacts: ${stats.totalContacts} (${stats.contactsByStatus.customer} customers, ${stats.contactsByStatus.lead} leads, ${stats.contactsByStatus.prospect} prospects)`,
  ];

  return lines.join('\n');
}

function buildArtifactSystemMessage(ctx: z.infer<typeof artifactContextSchema>): string | null {
  if (!ctx) return null;

  if (ctx.type === 'review-item') {
    const lines = [
      `The user is reviewing an item from the "${ctx.agentName}" agent.`,
      `Status: ${ctx.status}`,
      `Description: ${ctx.description}`,
    ];
    if (ctx.detail) lines.push(`Detail: ${ctx.detail}`);
    if (ctx.preview?.length) {
      for (const block of ctx.preview) {
        lines.push(`${block.label}: ${block.value}`);
      }
    }
    if (ctx.contentPreviews?.length) {
      lines.push('');
      lines.push('Content:');
      for (const cp of ctx.contentPreviews) {
        lines.push(`- [${cp.platform}] "${cp.title}" (${cp.scheduledLabel}): ${cp.caption}`);
      }
    }
    lines.push('Help the user understand, evaluate, or provide feedback on this item.');
    return lines.join('\n');
  }

  if (ctx.type === 'dashboard-card') {
    return [
      `The user wants to discuss their ${ctx.title} dashboard data.`,
      '',
      ctx.summary,
      '',
      'Help the user understand this data, identify trends, and suggest actionable next steps.',
    ].join('\n');
  }

  const lines = [
    'The user wants to discuss their website analytics.',
    '',
    '## Overview',
    `- Total visitors: ${ctx.totalVisitors.toLocaleString()}`,
    `- Page views: ${ctx.pageViews.toLocaleString()}`,
    `- Bounce rate: ${ctx.bounceRate}%`,
    `- Avg. session duration: ${ctx.avgSessionDuration}`,
    '',
    '## Traffic Sources',
    ...ctx.trafficSources.map((s) => `- ${s.source}: ${s.visitors.toLocaleString()} visitors (${s.pct}%)`),
    '',
    '## Top Pages',
    ...ctx.topPages.map((p) => `- ${p.path}: ${p.views.toLocaleString()} views, avg. ${p.avgTime}`),
    '',
    'Help the user understand their website performance, identify trends, and suggest improvements.',
  ];
  return lines.join('\n');
}

function buildContactSystemMessage(ctx: z.infer<typeof contactContextSchema>) {
  if (!ctx) return null;
  const lines: string[] = [];

  lines.push(`You are an AI agent managing the relationship with ${ctx.name}.`);
  lines.push('');

  lines.push('## Contact Profile');
  lines.push(`- Name: ${ctx.name}`);
  lines.push(`- Phone: ${ctx.phone}`);
  lines.push(`- Status: ${ctx.status}`);
  if (ctx.email) lines.push(`- Email: ${ctx.email}`);
  if (ctx.company) lines.push(`- Company: ${ctx.company}`);
  if (ctx.tags?.length) lines.push(`- Tags: ${ctx.tags.join(', ')}`);
  if (ctx.revenue != null) lines.push(`- Total revenue: $${ctx.revenue.toLocaleString()}`);
  if (ctx.notes) lines.push(`- Notes: ${ctx.notes}`);

  // Send all messages, not just last 8
  if (ctx.recentMessages?.length) {
    lines.push('');
    lines.push('## Full Conversation History');
    for (const msg of ctx.recentMessages) {
      const who = msg.direction === 'inbound' ? ctx.name.split(' ')[0] : 'You';
      lines.push(`[${msg.timestamp}] ${who}: ${msg.text}`);
    }
  }

  // Calculate total revenue from bookings
  if (ctx.bookings?.length) {
    const completedRevenue = ctx.bookings
      .filter((b) => b.status === 'completed' && b.amount)
      .reduce((sum, b) => sum + (b.amount ?? 0), 0);

    lines.push('');
    lines.push('## Bookings');
    if (completedRevenue > 0) {
      lines.push(`Total revenue from completed bookings: $${completedRevenue.toLocaleString()}`);
    }
    for (const b of ctx.bookings) {
      const parts = [`${b.title} — ${b.date} ${b.time} (${b.status})`];
      if (b.amount) parts.push(`$${b.amount.toLocaleString()}`);
      if (b.notes) parts.push(b.notes);
      lines.push(`- ${parts.join(' · ')}`);
    }
  }

  if (ctx.recentActivity?.length) {
    lines.push('');
    lines.push('## Recent Activity');
    for (const a of ctx.recentActivity) {
      lines.push(`- [${a.timestamp}] ${a.description}`);
    }
  }

  // Relationship health
  if (ctx.recentMessages?.length) {
    const lastMsg = ctx.recentMessages[ctx.recentMessages.length - 1]!;
    const daysSince = Math.floor(
      (Date.now() - new Date(lastMsg.timestamp).getTime()) / (1000 * 60 * 60 * 24),
    );
    const health = daysSince < 7 ? 'Active' : daysSince < 14 ? 'Cooling' : 'At Risk';
    lines.push('');
    lines.push(`## Relationship Health: ${health}`);
    lines.push(`Days since last contact: ${daysSince}`);
  }

  lines.push('');
  lines.push('## Your Role');
  lines.push('You are a proactive CRM agent. You have full context on this relationship.');
  lines.push('- Reference specific details from the conversation history and bookings when relevant.');
  lines.push('- When creating invoices, infer line items from booking history and conversation context. Don\'t ask the user for details you already have.');
  lines.push('- When drafting messages, match the tone and style of previous conversations.');
  lines.push('- Use the contact\'s first name in messages.');
  lines.push('- Suggest next steps proactively based on the relationship status and recent activity.');
  lines.push('');
  lines.push('## Available Tools');
  lines.push('- `createInvoice` — Create an invoice. Infer details from context when possible.');
  lines.push('- `draftMessage` — Draft an SMS message to send to the contact. Always draft before sending.');
  lines.push('- `sendInvoice` — Mark a draft invoice as sent. Use after creating and confirming with the user.');
  lines.push('- `sendMessage` — Send a drafted message. Use after drafting and confirming with the user.');
  lines.push('- `recordPayment` — Record a payment against an invoice.');
  lines.push('- `createBooking` — Schedule a new appointment.');
  lines.push('- `cancelBooking` — Cancel an existing appointment.');
  lines.push('- `updateContactStatus` — Change the contact\'s status.');
  lines.push('- `addNote` — Add a note to the contact record.');
  lines.push('- `addTag` — Add a tag to the contact.');

  return lines.join('\n');
}

export async function POST(req: Request) {
  try {
    const { messages, agent: agentName, artifactContext, contactContext } = chatRequestSchema.parse(
      await req.json(),
    );

    const systemMessages: typeof messages = [];

    // Always inject business context
    const businessContext = buildBusinessContext();
    systemMessages.push({
      id: 'business-context',
      role: 'system' as const,
      parts: [{ type: 'text' as const, text: businessContext }],
    });

    if (artifactContext) {
      systemMessages.push({
        id: 'artifact-context',
        role: 'system' as const,
        parts: [{ type: 'text' as const, text: buildArtifactSystemMessage(artifactContext)! }],
      });
    }

    if (contactContext) {
      systemMessages.push({
        id: 'contact-context',
        role: 'system' as const,
        parts: [{ type: 'text' as const, text: buildContactSystemMessage(contactContext)! }],
      });
    }

    const uiMessages = [...systemMessages, ...messages];

    return createAgentUIStreamResponse({
      agent: agents[agentName],
      uiMessages,
      abortSignal: req.signal,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid request body' }, { status: 400 });
    }

    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
