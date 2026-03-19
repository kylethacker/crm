export interface Invoice {
  id: string;
  invoiceNumber: string;
  contactName: string;
  items: { description: string; amount: number }[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  createdAt: string;
  dueDate: string;
  paidAt?: string;
}

export const mockInvoices: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-1035',
    contactName: 'Sarah Chen',
    items: [
      { description: 'Enterprise Plan — Annual License', amount: 3600 },
      { description: 'Custom Integration Setup', amount: 900 },
    ],
    subtotal: 4500,
    tax: 0,
    total: 4500,
    status: 'paid',
    createdAt: '2025-07-01T09:00:00Z',
    dueDate: '2025-07-31',
    paidAt: '2025-07-15T10:00:00Z',
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-1037',
    contactName: 'James Wright',
    items: [{ description: 'Starter Plan — Annual License', amount: 1200 }],
    subtotal: 1200,
    tax: 0,
    total: 1200,
    status: 'paid',
    createdAt: '2025-11-15T13:00:00Z',
    dueDate: '2025-12-15',
    paidAt: '2025-11-20T09:00:00Z',
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-1040',
    contactName: 'Marcus Johnson',
    items: [
      { description: 'Pro Plan — Annual License (12 seats)', amount: 2800 },
      { description: 'Onboarding & Training', amount: 400 },
    ],
    subtotal: 3200,
    tax: 0,
    total: 3200,
    status: 'sent',
    createdAt: '2026-03-10T09:00:00Z',
    dueDate: '2026-03-23',
  },
  {
    id: 'inv-4',
    invoiceNumber: 'INV-1041',
    contactName: 'Elena Rodriguez',
    items: [{ description: 'Integration Consulting — Phase 1', amount: 1800 }],
    subtotal: 1800,
    tax: 0,
    total: 1800,
    status: 'sent',
    createdAt: '2026-03-04T10:00:00Z',
    dueDate: '2026-03-30',
  },
  {
    id: 'inv-5',
    invoiceNumber: 'INV-1038',
    contactName: 'Priya Patel',
    items: [{ description: 'Platform Setup & Configuration', amount: 950 }],
    subtotal: 950,
    tax: 0,
    total: 950,
    status: 'overdue',
    createdAt: '2026-02-28T09:00:00Z',
    dueDate: '2026-03-10',
  },
  {
    id: 'inv-6',
    invoiceNumber: 'INV-1033',
    contactName: 'David Kim',
    items: [
      { description: 'Pro Plan — Annual License (8 seats)', amount: 1900 },
      { description: 'Data Migration', amount: 600 },
    ],
    subtotal: 2500,
    tax: 0,
    total: 2500,
    status: 'overdue',
    createdAt: '2026-02-10T09:00:00Z',
    dueDate: '2026-02-24',
  },
];
