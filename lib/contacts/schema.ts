import { z } from 'zod';

export const contactStatusSchema = z.enum(['lead', 'customer', 'prospect']);

export const updateContactStatusInputSchema = z.object({
  contactId: z.string().describe('The ID of the contact to update'),
  newStatus: contactStatusSchema.describe('The new status for the contact'),
  reason: z.string().optional().describe('Brief reason for the status change'),
});

export const contactFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  phone: z.string().trim().min(1, 'Phone is required'),
  email: z.union([z.literal(''), z.string().trim().email('Enter a valid email')]),
  company: z.union([z.literal(''), z.string().trim()]),
  status: contactStatusSchema,
  tags: z.union([z.literal(''), z.string().trim()]),
  notes: z.union([z.literal(''), z.string().trim()]),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
