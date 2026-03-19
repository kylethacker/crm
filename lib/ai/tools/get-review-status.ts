import { tool } from 'ai';
import { z } from 'zod';
import { getConversations } from '@/lib/messages/mock-data';

// Mock review data — tracks requests and completions
const reviewRequests = [
  { contactName: 'Sarah Chen', requestedAt: '2026-02-15T10:00:00Z', completed: true, rating: 5, platform: 'google' },
  { contactName: 'James Wright', requestedAt: '2026-01-20T09:00:00Z', completed: true, rating: 4, platform: 'google' },
  { contactName: 'Sarah Chen', requestedAt: '2025-12-20T10:00:00Z', completed: true, rating: 5, platform: 'google' },
];

export const getReviewStatusTool = tool({
  description:
    'Check review collection status including total reviews, average rating, pending requests, and contacts eligible for a review request (completed a recent booking but no request sent).',
  strict: true,
  inputSchema: z.object({
    contactName: z.string().optional().describe('Filter by specific contact'),
    pendingOnly: z
      .boolean()
      .default(false)
      .describe('Only return contacts eligible for review requests'),
  }),
  execute: async ({ contactName, pendingOnly }) => {
    const conversations = getConversations();
    const completedReviews = reviewRequests.filter((r) => r.completed);
    const totalReviews = completedReviews.length;
    const avgRating =
      totalReviews > 0
        ? Math.round(
            (completedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10,
          ) / 10
        : 0;

    // Find contacts eligible for a review request:
    // Has a completed booking AND hasn't had a review request in the last 60 days
    const requestedNames = new Set(
      reviewRequests
        .filter((r) => {
          const daysSince = Math.floor(
            (Date.now() - new Date(r.requestedAt).getTime()) / (1000 * 60 * 60 * 24),
          );
          return daysSince < 60;
        })
        .map((r) => r.contactName),
    );

    const eligibleContacts = conversations
      .filter((conv) => {
        const hasCompletedBooking = conv.bookings.some((b) => b.status === 'completed');
        const notRecentlyRequested = !requestedNames.has(conv.contact.name);
        return hasCompletedBooking && notRecentlyRequested;
      })
      .map((conv) => {
        const lastCompleted = conv.bookings
          .filter((b) => b.status === 'completed')
          .sort((a, b) => b.date.localeCompare(a.date))[0];
        return {
          name: conv.contact.name,
          phone: conv.contact.phone,
          lastBookingTitle: lastCompleted?.title ?? 'Unknown',
          lastBookingDate: lastCompleted?.date ?? 'Unknown',
        };
      });

    if (contactName) {
      const filtered = eligibleContacts.filter(
        (c) => c.name.toLowerCase() === contactName.toLowerCase(),
      );
      return {
        totalReviews,
        avgRating,
        recentReviews: completedReviews
          .filter((r) => r.contactName.toLowerCase() === contactName.toLowerCase())
          .map((r) => ({
            contactName: r.contactName,
            rating: r.rating,
            platform: r.platform,
            date: r.requestedAt,
          })),
        pendingRequests: reviewRequests.filter(
          (r) =>
            !r.completed &&
            r.contactName.toLowerCase() === contactName.toLowerCase(),
        ).length,
        eligibleContacts: filtered,
      };
    }

    return {
      totalReviews,
      avgRating,
      recentReviews: completedReviews.map((r) => ({
        contactName: r.contactName,
        rating: r.rating,
        platform: r.platform,
        date: r.requestedAt,
      })),
      pendingRequests: reviewRequests.filter((r) => !r.completed).length,
      eligibleContacts,
    };
  },
});
