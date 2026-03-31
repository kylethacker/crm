import { getConversations } from '@/lib/messages/mock-data';
import { activeAgents, agentDefinitions, getAgentDef, buildHirePrompt, formatTopOutcome } from '@/lib/marketplace/data';
import { getCrmStats, getBusinessPulseStats, getReviewStats } from './stats';
import { inferCategory } from './types';
import type { ActionQueueCard, GreetingData } from './types';
import type { ScenarioId } from '@/lib/demo/scenarios';
import type { Conversation } from '@/lib/messages/types';
import type { ActiveAgent } from '@/lib/marketplace/types';

export type BriefingItem = {
  label: string;
  detail: string;
  contactName?: string;
  action?: {
    label: string;
    prompt: string;
  };
};

export type TeamReport = {
  agentName: string;
  agentId: string;
  outcome: string;
};

export type TeamGap = {
  problem: string;
  agentName: string;
  prompt: string;
};

export type DailyBriefing = {
  greeting: string;
  greetingData: GreetingData;
  urgentItems: BriefingItem[];
  todaySchedule: BriefingItem[];
  followUps: BriefingItem[];
  wins: BriefingItem[];
  teamReports: TeamReport[];
  teamGaps: TeamGap[];
  pendingApprovals: number;
  actionQueue: ActionQueueCard[];
};

export function getDailyBriefing(opts?: {
  scenarioId?: ScenarioId;
  conversations?: Conversation[];
  activeAgentOverrides?: ActiveAgent[];
  ownerName?: string;
}): DailyBriefing {
  const conversations = opts?.conversations ?? getConversations();
  const scenarioAgents = opts?.activeAgentOverrides ?? activeAgents;
  const ownerName = opts?.ownerName ?? 'Kyle';
  const stats = getCrmStats(conversations);
  const reviewStats = getReviewStats();
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const hour = today.getHours();

  // ── Rich greeting ──
  const timeGreeting =
    hour < 12
      ? 'Good morning'
      : hour < 17
        ? 'Good afternoon'
        : 'Good evening';

  const urgentItems: BriefingItem[] = [];
  const todaySchedule: BriefingItem[] = [];
  const followUps: BriefingItem[] = [];
  const wins: BriefingItem[] = [];

  for (const conv of conversations) {
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

  followUps.sort((a, b) => {
    const aDays = parseInt(a.detail);
    const bDays = parseInt(b.detail);
    return bDays - aDays;
  });

  // ── Build the rich greeting sentence ──
  const pendingApprovals = scenarioAgents.flatMap((a) => a.recentActions.filter((act) => act.status === 'proposed'));
  const pendingCount = pendingApprovals.length;

  // Build context fragments for the greeting
  const fragments: string[] = [];

  if (urgentItems.length > 0) {
    fragments.push(`${urgentItems.length} message${urgentItems.length !== 1 ? 's' : ''} waiting`);
  }

  if (pendingCount > 0) {
    fragments.push(`${pendingCount} item${pendingCount !== 1 ? 's' : ''} need${pendingCount === 1 ? 's' : ''} your approval`);
  }

  if (todaySchedule.length > 0) {
    const nextAppt = todaySchedule[0]!;
    fragments.push(`next appointment at ${nextAppt.label.split(' — ')[0]}`);
  }

  if (wins.length > 0) {
    const totalWinRevenue = wins.reduce((sum, w) => {
      const match = w.label.match(/\$([0-9,]+)/);
      return sum + (match ? parseInt(match[1]!.replace(',', '')) : 0);
    }, 0);
    if (totalWinRevenue > 0) {
      fragments.push(`$${totalWinRevenue.toLocaleString()} earned this week`);
    }
  }

  const upcomingBookingsThisWeek = conversations.flatMap((c) =>
    c.bookings.filter((b) => {
      if (b.status !== 'upcoming') return false;
      const d = new Date(b.date);
      const diff = Math.floor((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diff >= 0 && diff <= 7;
    }),
  );
  if (upcomingBookingsThisWeek.length > 0) {
    fragments.push(`${upcomingBookingsThisWeek.length} appointment${upcomingBookingsThisWeek.length !== 1 ? 's' : ''} booked this week`);
  }

  if (todaySchedule.length > 0 && !fragments.some((f) => f.includes('appointment at'))) {
    fragments.push(`${todaySchedule.length} callback${todaySchedule.length !== 1 ? 's' : ''} scheduled for today`);
  }

  let greetingText: string;
  if (fragments.length === 0) {
    greetingText = `${timeGreeting}, ${ownerName}. You're all caught up.`;
  } else if (fragments.length <= 2) {
    greetingText = `${timeGreeting}, ${ownerName}. ${fragments.map((f) => f.charAt(0).toUpperCase() + f.slice(1)).join('. ')}.`;
  } else {
    const first = fragments[0]!.charAt(0).toUpperCase() + fragments[0]!.slice(1);
    const rest = fragments.slice(1, 3).join(', ');
    greetingText = `${timeGreeting}, ${ownerName}. ${first} — ${rest}.`;
  }

  const greeting = greetingText;

  // ── Team agent reports ──
  const teamReports: TeamReport[] = [];
  for (const a of scenarioAgents) {
    if (a.paused) continue;
    const def = getAgentDef(a.agentId);
    if (!def) continue;
    const outcome = formatTopOutcome(a.outcomes);
    if (outcome) {
      teamReports.push({ agentName: def.name, agentId: def.id, outcome });
    }
  }

  // ── Team gaps ──
  const scenarioActiveIds = new Set(scenarioAgents.map((a) => a.agentId));
  const scenarioAvailableAgents = agentDefinitions.filter((a) => !scenarioActiveIds.has(a.id));

  let teamGaps: TeamGap[];
  if (opts?.scenarioId === 'fresh') {
    const freshAgentOrder = ['speed-to-lead', 'deal-closer', 'receptionist'];
    teamGaps = freshAgentOrder
      .map((id) => agentDefinitions.find((a) => a.id === id))
      .filter(Boolean)
      .map((def) => ({ problem: def!.does, agentName: def!.name, prompt: buildHirePrompt(def!) }));
  } else {
    teamGaps = scenarioAvailableAgents.slice(0, 2).map((def) => ({
      problem: def.does,
      agentName: def.name,
      prompt: buildHirePrompt(def),
    }));
  }

  // ── Build Action Queue Cards ──
  const scenarioId = opts?.scenarioId;
  const actionQueue = buildActionQueue({
    urgentItems,
    todaySchedule,
    followUps,
    wins,
    teamReports,
    teamGaps,
    pendingApprovals,
    scenarioId,
  });

  return {
    greeting,
    greetingData: { text: greetingText },
    urgentItems,
    todaySchedule,
    followUps,
    wins,
    teamReports,
    teamGaps,
    pendingApprovals: pendingCount,
    actionQueue,
  };
}

// ── Action Queue Builder ──────────────────────────────────────────────────────

function buildActionQueue({
  urgentItems,
  todaySchedule,
  followUps,
  wins,
  teamReports,
  teamGaps,
  pendingApprovals,
  scenarioId,
}: {
  urgentItems: BriefingItem[];
  todaySchedule: BriefingItem[];
  followUps: BriefingItem[];
  wins: BriefingItem[];
  teamReports: TeamReport[];
  teamGaps: TeamGap[];
  pendingApprovals: import('@/lib/marketplace/types').AgentAction[];
  scenarioId?: ScenarioId;
}): ActionQueueCard[] {
  const cards: ActionQueueCard[] = [];
  let idCounter = 0;
  const nextId = () => `aq-${++idCounter}`;

  // Approval cards from pending agent actions
  for (const action of pendingApprovals) {
    const agentDef = getAgentDef(action.agentId);
    const category = inferCategory(action.tool, action.agentId);
    const draftData = getActionDraftData(action.id);

    const draft = draftData?.draft ?? null;
    const inboundMessage = draftData?.inboundMessage;
    // Use enriched context summary if available, fall back to agent description for follow-ups
    const contextSummary = draftData?.contextSummary
      ?? (!inboundMessage && action.agentId !== 'review-responder' ? action.description : undefined);

    cards.push({
      id: nextId(),
      type: 'approval',
      category,
      timestamp: action.createdAt,
      contactName: action.contactName,
      headline: action.contactName ?? agentDef?.name ?? 'Agent action',
      body: action.description,
      draftContent: draft ?? action.description,
      inboundMessage,
      contextSummary,
      attachments: draftData?.attachments,
      actions: [
        { label: 'Approve', variant: 'primary' },
        { label: 'Edit', variant: 'secondary' },
      ],
      urgency: category === 'Review' ? 85 : 90,
      agentId: action.agentId,
      agentName: agentDef?.name,
    });
  }

  // Follow-ups -> approval cards (churn preventer — hidden for now)
  for (const item of ([] as typeof followUps).slice(0, 3)) {
    const daysSince = parseInt(item.detail);
    const firstName = item.contactName?.split(' ')[0] ?? 'there';
    cards.push({
      id: nextId(),
      type: 'approval',
      category: 'Follow-up',
      timestamp: new Date().toISOString(),
      contactName: item.contactName,
      headline: item.contactName ?? 'Follow-up needed',
      body: item.detail,
      contextSummary: `Last interaction ${daysSince} days ago. ${daysSince >= 14 ? 'Regular customer going quiet — at risk of churning.' : 'Due for a check-in to keep the relationship warm.'}`,
      draftContent: `Hi ${firstName}, just checking in — it's been a while since we last connected. I'd love to see how things are going and if there's anything I can help with. Would you like to schedule a time to chat?`,
      actions: [
        { label: 'Approve', variant: 'primary' },
        { label: 'Edit', variant: 'secondary', prompt: item.action?.prompt },
      ],
      urgency: daysSince >= 14 ? 70 : 50,
      agentId: 'churn-preventer',
      agentName: 'Churn Preventer',
    });
  }

  // Wins — informational only, not shown as action queue cards

  // Team reports (Brief insight cards) — removed for now

  // Market Scout activation card for the "busy" scenario
  if (scenarioId === 'busy') {
    const marketScout = getAgentDef('market-scout');
    if (marketScout) {
      cards.push({
        id: nextId(),
        type: 'activation',
        category: 'Brief',
        timestamp: new Date().toISOString(),
        headline: marketScout.name,
        body: marketScout.does,
        actions: [
          { label: 'Set up', variant: 'primary', prompt: buildHirePrompt(marketScout) },
          { label: 'Dismiss', variant: 'secondary' },
        ],
        urgency: 80,
        agentName: marketScout.name,
      });
    }
  }

  // Skip activation / setup cards for "handled" — everything is already done
  if (scenarioId !== 'handled') {
    if (scenarioId === 'fresh') {
      // "Just Started" gets a curated onboarding sequence
      cards.push({
        id: nextId(),
        type: 'activation',
        category: 'Brief',
        timestamp: new Date().toISOString(),
        headline: 'Publish your website',
        body: 'Go live so customers can find you, book online, and request quotes — all from one page.',
        actions: [
          { label: 'Set up', variant: 'primary', prompt: 'Help me publish my business website. Walk me through the steps to get it live.' },
          { label: 'Dismiss', variant: 'secondary' },
        ],
        urgency: 50,
      });

      cards.push({
        id: nextId(),
        type: 'activation',
        category: 'Brief',
        timestamp: new Date().toISOString(),
        headline: 'Connect Google Business Profile',
        body: 'Link your Google Business Profile so agents can respond to reviews, track your rating, and improve your local search ranking automatically.',
        actions: [
          { label: 'Connect', variant: 'primary', prompt: 'Help me connect my Google Business Profile. Walk me through the setup process.' },
          { label: 'Dismiss', variant: 'secondary' },
        ],
        urgency: 45,
      });

      let gapUrgency = 40;
      for (const gap of teamGaps) {
        cards.push({
          id: nextId(),
          type: 'activation',
          category: 'Brief',
          timestamp: new Date().toISOString(),
          headline: gap.agentName,
          body: gap.problem,
          actions: [
            { label: 'Set up', variant: 'primary', prompt: gap.prompt },
            { label: 'Dismiss', variant: 'secondary' },
          ],
          urgency: gapUrgency,
          agentName: gap.agentName,
        });
        gapUrgency -= 5;
      }
    } else {
      // Other scenarios: team gaps as activation cards
      for (const gap of teamGaps) {
        cards.push({
          id: nextId(),
          type: 'activation',
          category: 'Brief',
          timestamp: new Date().toISOString(),
          headline: gap.agentName,
          body: gap.problem,
          actions: [
            { label: 'Set up', variant: 'primary', prompt: gap.prompt },
            { label: 'Dismiss', variant: 'secondary' },
          ],
          urgency: 30,
          agentName: gap.agentName,
        });
      }
    }
  }

  // Sort by urgency (highest first)
  cards.sort((a, b) => b.urgency - a.urgency);

  return cards;
}

// ── Review response drafts (mock) ────────────────────────────────────────────

type DraftWithContext = {
  draft: string;
  inboundMessage?: string;
  contextSummary?: string;
  attachments?: import('./types').CardAttachment[];
};

const actionDraftData: Record<string, DraftWithContext> = {
  // ── Speed-to-lead responses ──
  'sl-alex': {
    inboundMessage: `Hi there! I'm looking to get my master bathroom completely remodeled — new tile, vanity, fixtures, the works. The room is about 80 sq ft. Could you give me a rough estimate and your availability for the next few weeks? Thanks!`,
    draft: `Hi Alex, thanks for reaching out! An 80 sq ft full bathroom remodel typically runs between $8,000–$12,000 depending on materials and fixtures. I've put together an itemized estimate for you — take a look and let me know if you'd like to adjust anything. I have availability starting the week of April 7. Want me to pencil you in for a walkthrough? — Kyle`,
    attachments: [
      { type: 'invoice', id: 'inv-lead-alex', label: 'Estimate #1044', meta: '$9,850' },
    ],
  },
  'sl-priya': {
    inboundMessage: `Hi! I signed up on your website and had a few questions about the platform.`,
    draft: `Hi Priya, welcome! I'd love to help answer your questions. What are you looking to use the platform for? If it's easier, I can hop on a quick call this week — just let me know what works for you. — Kyle`,
  },
  // ── Review responses ──
  rr1: {
    inboundMessage: `Amazing experience! The salon was spotless and Kyle was so attentive to what I wanted. Best haircut I've had in years. Will definitely be coming back!`,
    draft: `Thank you so much, Rachel! It means a lot to hear that. I'm glad you loved the haircut and noticed the effort we put into keeping the space clean and welcoming. Can't wait to see you again! — Kyle`,
  },
  rr2: {
    inboundMessage: `Great haircut, but had to wait 20 minutes past my appointment time. Otherwise really happy with the result. The staff was friendly and the cut itself was exactly what I asked for.`,
    draft: `Thanks for the kind words about the haircut, Tom! I'm really sorry about the wait — that's not the experience I want for you. I'm working on tightening up the schedule so that doesn't happen again. Hope to see you back soon. — Kyle`,
  },
  rr3: {
    inboundMessage: `Wasn't happy with the color treatment. It came out way darker than I asked for. I showed reference photos and everything. Really disappointed.`,
    draft: `Janet, I'm sorry the color didn't turn out the way you wanted — that's really frustrating. I'd love the chance to make it right. Could you give me a call or text so we can schedule a fix-up at no charge? Your satisfaction matters a lot to me. — Kyle`,
  },
  // ── Deal closer follow-ups ──
  a3: {
    contextSummary: `Sent a $1,800 quote for bathroom tile replacement on Mar 13. David opened the quote on Mar 15 but hasn't responded. This is the first follow-up.`,
    draft: `Hey David, just checking in on the tile replacement quote I sent over last week. I saw you had a chance to look it over — happy to answer any questions or adjust the scope if needed. No rush, just didn't want it to slip through the cracks. — Kyle`,
  },
  a11: {
    contextSummary: `Sent a $2,200 quote for kitchen backsplash installation on Mar 8. Nora hasn't opened or responded. Quote expires Mar 19 — 2 days from now.`,
    draft: `Hi Nora, wanted to give you a heads up that the quote I sent for your kitchen backsplash is expiring in a couple days. If you're still interested, I'd love to get you on the schedule — I have some openings next week. Let me know! — Kyle`,
  },
  // ── Invoice collection reminders ──
  fc1: {
    contextSummary: `Invoice INV-1033 for $2,500 (Pro Plan + Data Migration) was due Feb 24. Now 31 days overdue. Two reminders already sent — no response. This is the 3rd reminder with a firmer tone.`,
    draft: `Hi David, I wanted to follow up on invoice #1033 for $2,500 — it's now about a month past due. I know things get busy, but I'd really appreciate getting this squared away. If there's an issue with the amount or you need to set up a payment plan, I'm happy to work something out. Could you let me know where things stand? — Kyle`,
  },
  fc2: {
    contextSummary: `Invoice INV-1038 for $950 (Platform Setup & Configuration) was due Mar 10. Now 17 days overdue. This is the first reminder.`,
    draft: `Hey Priya, just a friendly heads up — invoice #1038 for $950 is a couple weeks past due. Totally understand if it slipped through the cracks! Here's the link to pay online, or let me know if you have any questions about the charge. — Kyle`,
  },
};

function getActionDraftData(actionId: string): DraftWithContext | null {
  return actionDraftData[actionId] ?? null;
}

/** Convert pending AgentActions into ActionQueueCards (reusable by agent detail page) */
export function actionsToCards(actions: import('@/lib/marketplace/types').AgentAction[]): ActionQueueCard[] {
  let idCounter = 0;
  return actions.map((action) => {
    const agentDef = getAgentDef(action.agentId);
    const category = inferCategory(action.tool, action.agentId);
    const draftData = getActionDraftData(action.id);
    const draft = draftData?.draft ?? null;
    const inboundMessage = draftData?.inboundMessage;
    const contextSummary = draftData?.contextSummary
      ?? (!inboundMessage && action.agentId !== 'review-responder' ? action.description : undefined);

    return {
      id: `agent-card-${idCounter++}`,
      type: 'approval' as const,
      category,
      timestamp: action.createdAt,
      contactName: action.contactName,
      headline: action.contactName ?? agentDef?.name ?? 'Agent action',
      body: action.description,
      draftContent: draft ?? action.description,
      inboundMessage,
      contextSummary,
      attachments: draftData?.attachments,
      actions: [
        { label: 'Approve', variant: 'primary' as const },
        { label: 'Edit', variant: 'secondary' as const },
      ],
      urgency: category === 'Review' ? 85 : 90,
      agentId: action.agentId,
      agentName: agentDef?.name,
    };
  });
}


