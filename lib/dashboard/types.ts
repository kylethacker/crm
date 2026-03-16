import type { ContactStatus, BookingStatus } from '@/lib/messages/types';
import type { AgentActivity, AgentActivityStatus } from '@/lib/activity/types';

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

export type CardInsight = {
  cardId: string;
  reason: string;
};

export type DashboardInsights = {
  summary: string;
  cards: CardInsight[];
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
