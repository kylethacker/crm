import { tool } from 'ai';
import { z } from 'zod';

export const cancelBookingTool = tool({
  description:
    'Cancel an existing booking/appointment. Use this when a client wants to cancel or reschedule.',
  strict: true,
  inputSchema: z.object({
    bookingId: z.string().describe('The ID of the booking to cancel'),
    contactName: z.string().describe('Name of the contact whose booking is being cancelled'),
    reason: z.string().optional().describe('Reason for cancellation'),
  }),
  execute: async ({ bookingId, contactName, reason }) => {
    return {
      bookingId,
      contactName,
      reason: reason ?? undefined,
      status: 'cancelled' as const,
      cancelledAt: new Date().toISOString(),
      success: true,
    };
  },
});
