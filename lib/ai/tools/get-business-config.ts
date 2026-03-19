import { tool } from 'ai';
import { z } from 'zod';
import { businessConfig } from '@/lib/business/config';

export const getBusinessConfigTool = tool({
  description:
    'Get business configuration including name, hours, services, and review links. Use this for business context when drafting messages, creating quotes, or checking availability.',
  strict: true,
  inputSchema: z.object({}),
  execute: async () => {
    return {
      businessName: businessConfig.businessName,
      timezone: businessConfig.timezone,
      businessHours: businessConfig.businessHours,
      services: businessConfig.services,
      reviewLinks: businessConfig.reviewLinks,
    };
  },
});
