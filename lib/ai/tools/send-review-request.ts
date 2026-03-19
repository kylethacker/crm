import { tool } from 'ai';
import { z } from 'zod';
import { businessConfig } from '@/lib/business/config';

export const sendReviewRequestTool = tool({
  description:
    'Send a review request to a contact with a direct link to the review platform. Auto-generates a friendly message with the review link. Use after a completed booking or service.',
  strict: true,
  inputSchema: z.object({
    contactName: z.string().describe('Full name of the contact'),
    contactPhone: z.string().describe('Phone number of the contact'),
    bookingTitle: z.string().describe('Title of the completed booking/service'),
    platform: z
      .enum(['google', 'yelp'])
      .default('google')
      .describe('Review platform to link to'),
  }),
  execute: async ({ contactName, contactPhone, bookingTitle, platform }) => {
    const reviewLink =
      platform === 'yelp'
        ? businessConfig.reviewLinks.yelp
        : businessConfig.reviewLinks.google;

    const firstName = contactName.split(' ')[0];
    const messageText = `Hi ${firstName}! Thank you for your recent ${bookingTitle} with ${businessConfig.businessName}. We'd love to hear about your experience! If you have a moment, a quick review would mean the world to us: ${reviewLink}`;

    return {
      id: crypto.randomUUID(),
      contactName,
      contactPhone,
      messageText,
      reviewLink,
      platform,
      status: 'sent' as const,
      sentAt: new Date().toISOString(),
    };
  },
});
