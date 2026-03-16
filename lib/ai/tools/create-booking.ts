import { tool } from 'ai';
import { z } from 'zod';

export const createBookingTool = tool({
  description:
    'Create a new booking/appointment for a contact. Use this when scheduling meetings, demos, consultations, or any appointment.',
  strict: true,
  inputSchema: z.object({
    contactId: z.string().describe('The ID of the contact'),
    contactName: z.string().describe('Full name of the contact'),
    title: z.string().describe('Title/description of the booking (e.g. "Product Demo", "Quarterly Review")'),
    date: z.string().describe('Date of the booking in YYYY-MM-DD format'),
    time: z.string().describe('Time of the booking (e.g. "2:00 PM", "10:30 AM")'),
    duration: z.number().describe('Duration in minutes'),
    amount: z.number().optional().describe('Amount in USD if this is a paid appointment'),
    notes: z.string().optional().describe('Additional notes about the booking'),
  }),
  execute: async ({ contactId, contactName, title, date, time, duration, amount, notes }) => {
    return {
      id: crypto.randomUUID(),
      contactId,
      contactName,
      title,
      date,
      time,
      duration,
      amount: amount ?? undefined,
      notes: notes ?? undefined,
      status: 'upcoming' as const,
      createdAt: new Date().toISOString(),
    };
  },
});
