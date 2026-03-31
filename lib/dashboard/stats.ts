import { getConversations } from '@/lib/messages/mock-data';
import { getAgentActivities } from '@/lib/activity/mock-data';
import { agentNameMap } from '@/lib/apps/data';
import type { AgentActivityStatus } from '@/lib/activity/types';
import type { Conversation } from '@/lib/messages/types';
import type {
  CrmStats,
  AgentActivityStats,
  AgentCreditUsage,
  AgentActionSummary,
  ReviewStats,
  PipelineStats,
  ContactsByStatus,
  BookingsByStatus,
  WebsiteAnalyticsStats,
  BusinessPulseStats,
} from './types';

export function getCrmStats(conversationsOverride?: Conversation[]): CrmStats {
  const conversations = conversationsOverride ?? getConversations();

  const contactsByStatus: ContactsByStatus = { lead: 0, customer: 0, prospect: 0 };
  const bookingsByStatus: BookingsByStatus = { upcoming: 0, completed: 0, cancelled: 0, 'no-show': 0 };

  let totalMessages = 0;
  let inboundMessages = 0;
  let outboundMessages = 0;
  let totalRevenue = 0;

  const revenuePayments: CrmStats['revenuePayments'] = [];
  const upcomingBookings: CrmStats['upcomingBookings'] = [];

  for (const conv of conversations) {
    contactsByStatus[conv.contact.status]++;

    for (const msg of conv.messages) {
      totalMessages++;
      if (msg.direction === 'inbound') inboundMessages++;
      else outboundMessages++;
    }

    for (const booking of conv.bookings) {
      bookingsByStatus[booking.status]++;

      if (booking.status === 'completed' && booking.amount) {
        totalRevenue += booking.amount;
        revenuePayments.push({
          contactName: conv.contact.name,
          amount: booking.amount,
          date: booking.date,
        });
      }

      if (booking.status === 'upcoming') {
        upcomingBookings.push({
          id: booking.id,
          title: booking.title,
          contactName: conv.contact.name,
          date: booking.date,
          time: booking.time,
        });
      }
    }
  }

  revenuePayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  upcomingBookings.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return {
    totalContacts: conversations.length,
    contactsByStatus,
    totalMessages,
    inboundMessages,
    outboundMessages,
    totalRevenue,
    revenuePayments,
    bookingsByStatus,
    upcomingBookings,
  };
}

export function getAgentActivityStats(): AgentActivityStats {
  const activities = getAgentActivities();

  const byStatus: Record<AgentActivityStatus, number> = {
    completed: 0,
    running: 0,
    'needs-approval': 0,
    failed: 0,
  };

  const creditMap = new Map<string, { credits: number; runs: number }>();

  for (const act of activities) {
    byStatus[act.status]++;

    const entry = creditMap.get(act.agentId) ?? { credits: 0, runs: 0 };
    entry.credits += act.creditsUsed;
    entry.runs++;
    creditMap.set(act.agentId, entry);
  }

  const creditsByAgent: AgentCreditUsage[] = [...creditMap.entries()]
    .map(([agentId, { credits, runs }]) => ({
      agentId,
      agentName: agentNameMap.get(agentId) ?? agentId,
      credits,
      runs,
    }))
    .sort((a, b) => b.credits - a.credits);

  const totalCredits = creditsByAgent.reduce((sum, a) => sum + a.credits, 0);

  const needsAttention = activities.filter(
    (a) => a.status === 'needs-approval' || a.status === 'failed',
  );

  const recentActivity = activities.slice(0, 6);

  return {
    totalActivities: activities.length,
    totalCredits,
    byStatus,
    creditsByAgent,
    needsAttention,
    recentActivity,
  };
}

export function getAgentActionSummaries(): AgentActionSummary[] {
  const activities = getAgentActivities();
  const map = new Map<string, { completed: number; pending: number; latest: string }>();

  for (const act of activities) {
    const entry = map.get(act.agentId) ?? { completed: 0, pending: 0, latest: '' };
    if (act.status === 'completed') entry.completed++;
    else entry.pending++;
    if (!entry.latest) entry.latest = act.description;
    map.set(act.agentId, entry);
  }

  return [...map.entries()]
    .map(([agentId, data]) => ({
      agentId,
      agentName: agentNameMap.get(agentId) ?? agentId,
      completedCount: data.completed,
      pendingCount: data.pending,
      latestDescription: data.latest,
    }))
    .sort((a, b) => b.completedCount + b.pendingCount - (a.completedCount + a.pendingCount));
}

export function getReviewStats(): ReviewStats {
  return {
    totalCollected: 24,
    averageRating: 4.7,
    pendingRequests: 3,
    flaggedCount: 1,
    recentReviews: [
      { client: 'Sarah Johnson', rating: 5, snippet: 'Amazing service, will definitely be back!' },
      { client: 'Amy Chen', rating: 5, snippet: 'So professional and friendly. Highly recommend.' },
      { client: 'Lisa Park', rating: 4, snippet: 'Great work, just a bit of a wait time.' },
      { client: 'Mike Chen', rating: 5, snippet: 'Best experience I\'ve had. 10/10.' },
    ],
  };
}

export function getWebsiteAnalyticsStats(): WebsiteAnalyticsStats {
  return {
    totalVisitors: 1_284,
    pageViews: 3_621,
    bounceRate: 42,
    avgSessionDuration: '2m 18s',
    topPages: [
      { path: '/', views: 1_102, avgTime: '1m 45s' },
      { path: '/services', views: 874, avgTime: '2m 32s' },
      { path: '/book', views: 623, avgTime: '3m 10s' },
      { path: '/about', views: 412, avgTime: '1m 05s' },
      { path: '/contact', views: 310, avgTime: '1m 52s' },
    ],
    trafficSources: [
      { source: 'Organic', visitors: 542, pct: 42 },
      { source: 'Direct', visitors: 361, pct: 28 },
      { source: 'Social', visitors: 245, pct: 19 },
      { source: 'Referral', visitors: 136, pct: 11 },
    ],
    dailyVisitors: [
      { date: 'Feb 27', visitors: 72 },
      { date: 'Feb 28', visitors: 85 },
      { date: 'Mar 1', visitors: 98 },
      { date: 'Mar 2', visitors: 74 },
      { date: 'Mar 3', visitors: 65 },
      { date: 'Mar 4', visitors: 91 },
      { date: 'Mar 5', visitors: 110 },
      { date: 'Mar 6', visitors: 102 },
      { date: 'Mar 7', visitors: 88 },
      { date: 'Mar 8', visitors: 79 },
      { date: 'Mar 9', visitors: 95 },
      { date: 'Mar 10', visitors: 118 },
      { date: 'Mar 11', visitors: 105 },
      { date: 'Mar 12', visitors: 112 },
    ],
  };
}

export function getBusinessPulseStats(): BusinessPulseStats {
  const conversations = getConversations();
  const reviewStats = getReviewStats();

  // Count leads this week vs last week
  let leadsThisWeek = 0;
  let leadsLastWeek = 0;
  const now = new Date();
  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(now.getDate() - now.getDay());
  startOfThisWeek.setHours(0, 0, 0, 0);
  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

  for (const conv of conversations) {
    if (conv.contact.status === 'lead') {
      // Use the first message date as a proxy for when the lead came in
      const firstMsg = conv.messages[0];
      if (firstMsg) {
        const msgDate = new Date(firstMsg.timestamp);
        if (msgDate >= startOfThisWeek) leadsThisWeek++;
        else if (msgDate >= startOfLastWeek) leadsLastWeek++;
      }
    }
  }

  // If mock data doesn't have enough date-based leads, use reasonable defaults
  if (leadsThisWeek === 0) leadsThisWeek = 8;
  if (leadsLastWeek === 0) leadsLastWeek = 5;

  // Revenue this month and outstanding
  let revenueThisMonth = 0;
  let outstanding = 0;
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  for (const conv of conversations) {
    for (const booking of conv.bookings) {
      if (booking.status === 'completed' && booking.amount) {
        const bookingDate = new Date(booking.date);
        if (bookingDate >= startOfMonth) {
          revenueThisMonth += booking.amount;
        }
      }
      if (booking.status === 'upcoming' && booking.amount) {
        outstanding += booking.amount;
      }
    }
  }

  // Ensure reasonable mock values
  if (revenueThisMonth === 0) revenueThisMonth = 4200;
  if (outstanding === 0) outstanding = 850;

  return {
    leads: {
      thisWeek: leadsThisWeek,
      lastWeek: leadsLastWeek,
    },
    revenue: {
      thisMonth: revenueThisMonth,
      outstanding,
    },
    reputation: {
      rating: reviewStats.averageRating,
      newReviewsThisWeek: reviewStats.recentReviews.length,
    },
  };
}

export function getPipelineStats(): PipelineStats {
  return {
    dormantCount: 5,
    contactedCount: 3,
    convertedCount: 1,
    items: [
      { client: 'Amy Chen', daysSince: 45, status: 'converted', offer: '15% off next service' },
      { client: 'David Kim', daysSince: 68, status: 'contacted', offer: '15% off next service' },
      { client: 'Lisa Tran', daysSince: 72, status: 'contacted', offer: 'Free consultation' },
      { client: 'Marco Reyes', daysSince: 61, status: 'contacted', offer: '20% off spring package' },
      { client: 'Jen Park', daysSince: 65, status: 'no-response' },
      { client: 'Alex Nguyen', daysSince: 90, status: 'identified' },
    ],
  };
}
