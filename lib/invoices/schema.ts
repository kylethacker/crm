import { z } from 'zod';

export const invoiceItemSchema = z.object({
  description: z.string().trim().min(1, 'Description is required'),
  amount: z.number().finite().min(0, 'Amount must be 0 or more'),
});

export const createInvoiceInputSchema = z.object({
  contactName: z.string().trim().min(1).describe('Full name of the contact to invoice'),
  items: z
    .array(invoiceItemSchema)
    .min(1, 'At least one line item is required')
    .describe('Invoice line items'),
  taxRate: z
    .number()
    .min(0)
    .max(100)
    .default(0)
    .describe('Tax rate as a percentage (e.g. 8.5 for 8.5%)'),
  dueDate: z.string().min(1).describe('Due date in YYYY-MM-DD format'),
  notes: z.string().optional().describe('Optional notes for the invoice'),
  revisionOf: z
    .string()
    .optional()
    .describe('ID of the previous invoice this is a revision of. Use when editing an existing invoice.'),
});

export const invoiceFormSchema = z.object({
  contactName: z.string().trim().min(1, 'Contact name is required'),
  items: z.array(invoiceItemSchema).min(1, 'Add at least one line item'),
  taxRate: z.number().finite().min(0).max(100),
  dueDate: z.string().min(1, 'Due date is required'),
  status: z.enum(['draft', 'sent', 'paid', 'overdue']),
  notes: z.union([z.literal(''), z.string().trim()]),
});

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

export function calculateInvoiceTotals(
  items: Array<{ amount: number }>,
  taxRate: number,
) {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const tax = Math.round(subtotal * (taxRate / 100) * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;
  return { subtotal, tax, total };
}

export function getInvoiceTaxRate(subtotal: number, tax: number) {
  if (subtotal <= 0 || tax <= 0) return 0;
  return Math.round((tax / subtotal) * 10000) / 100;
}
