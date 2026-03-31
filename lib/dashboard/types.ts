import type { ContactStatus, BookingStatus } from '@/lib/messages/types';
import type { AgentActivity, AgentActivityStatus } from '@/lib/activity/types';

// ── Action Queue Types ───────────────────────────────────────────────────────

export type ActionCardCategory = 'Lead' | 'Review' | 'Follow-up' | 'Invoice' | 'Social' | 'Content' | 'Brief';

export type ActionCardType = 'approval' | 'outcome' | 'insight' | 'activation';

export type CardAttachment = {
  type: 'invoice' | 'quote';
  id: string;
  label: string;
  /** e.g. "$1,250" for an invoice */
  meta?: string;
};

export type ActionQueueCard = {
  id: string;
  type: ActionCardType;
  category: ActionCardCategory;
  timestamp: string;
  contactName?: string;
  headline: string;
  body: string;
  /** Full draft content shown inline for approval cards */
  draftContent?: string;
  /** The original inbound message from the customer (review text, inquiry, etc.) */
  inboundMessage?: string;
  /** For follow-ups / cases with no direct inbound: a one-liner summary of the context */
  contextSummary?: string;
  /** Linked artifacts (invoices, quotes) the user can tap to view */
  attachments?: CardAttachment[];
  /** Up to 2 action buttons */
  actions: { label: string; variant: 'primary' | 'secondary'; prompt?: string }[];
  /** Urgency score for sorting (higher = more urgent) */
  urgency: number;
  /** Agent that generated this card */
  agentId?: string;
  agentName?: string;
};

// ── Category Colors (shared across action cards & autocompleted) ─────────

export const categoryColors: Record<ActionCardCategory, { pill: string; border: string }> = {
  Lead: {
    pill: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    border: 'border-l-blue-500',
  },
  Review: {
    pill: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    border: 'border-l-amber-500',
  },
  'Follow-up': {
    pill: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    border: 'border-l-purple-500',
  },
  Invoice: {
    pill: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    border: 'border-l-green-500',
  },
  Social: {
    pill: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
    border: 'border-l-pink-500',
  },
  Content: {
    pill: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
    border: 'border-l-cyan-500',
  },
  Brief: {
    pill: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300',
    border: 'border-l-neutral-400',
  },
};

// ── Category Inference ──────────────────────────────────────────────────

export function inferCategory(tool: string, agentId: string): ActionCardCategory {
  if (agentId.includes('reputation') || agentId.includes('review') || tool === 'sendReviewRequest' || tool === 'getReviewStatus') return 'Review';
  if (agentId.includes('deal') || tool === 'createInvoice' || tool === 'sendInvoice') return 'Invoice';
  if (agentId.includes('lead') || agentId.includes('speed')) return 'Lead';
  if (agentId.includes('churn') || agentId.includes('follow')) return 'Follow-up';
  if (agentId.includes('blog') || agentId.includes('content')) return 'Content';
  if (agentId.includes('social')) return 'Social';
  if (agentId.includes('collector') || agentId.includes('friendly')) return 'Invoice';
  if (agentId.includes('receptionist')) return 'Lead';
  return 'Brief';
}

// ── Business Pulse Types ─────────────────────────────────────────────────────

export type BusinessPulseStats = {
  leads: {
    thisWeek: number;
    lastWeek: number;
  };
  revenue: {
    thisMonth: number;
    outstanding: number;
  };
  reputation: {
    rating: number;
    newReviewsThisWeek: number;
  };
};

// ── Greeting Types ───────────────────────────────────────────────────────────

export type GreetingData = {
  text: string;
};

export type ContactsByStatus = Record<ContactStatus, number>;

export type BookingsByStatus = Record<BookingStatus, number>;

export type UpcomingBooking = {
  id: string;
  title: string;
  contactName: string;
  date: string;
  time: string;
};

export type RevenuePayment = {
  contactName: string;
  amount: number;
  date: string;
};

export type CrmStats = {
  totalContacts: number;
  contactsByStatus: ContactsByStatus;
  totalMessages: number;
  inboundMessages: number;
  outboundMessages: number;
  totalRevenue: number;
  revenuePayments: RevenuePayment[];
  bookingsByStatus: BookingsByStatus;
  upcomingBookings: UpcomingBooking[];
};

export type AgentCreditUsage = {
  agentId: string;
  agentName: string;
  credits: number;
  runs: number;
};

export type AgentActivityStats = {
  totalActivities: number;
  totalCredits: number;
  byStatus: Record<AgentActivityStatus, number>;
  creditsByAgent: AgentCreditUsage[];
  needsAttention: AgentActivity[];
  recentActivity: AgentActivity[];
};

export type AgentActionSummary = {
  agentId: string;
  agentName: string;
  completedCount: number;
  pendingCount: number;
  latestDescription: string;
};

export type ReviewStats = {
  totalCollected: number;
  averageRating: number;
  pendingRequests: number;
  recentReviews: { client: string; rating: number; snippet: string }[];
  flaggedCount: number;
};

export type PipelineItem = {
  client: string;
  daysSince: number;
  status: 'identified' | 'contacted' | 'converted' | 'no-response';
  offer?: string;
};

export type PipelineStats = {
  dormantCount: number;
  contactedCount: number;
  convertedCount: number;
  items: PipelineItem[];
};


export type TrafficSource = {
  source: string;
  visitors: number;
  pct: number;
};

export type TopPage = {
  path: string;
  views: number;
  avgTime: string;
};

export type DailyVisitors = {
  date: string;
  visitors: number;
};

export type WebsiteAnalyticsStats = {
  totalVisitors: number;
  pageViews: number;
  bounceRate: number;
  avgSessionDuration: string;
  topPages: TopPage[];
  trafficSources: TrafficSource[];
  dailyVisitors: DailyVisitors[];
};
