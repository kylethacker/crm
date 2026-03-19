export interface QuoteItem {
  description: string;
  amount: number;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  contactName: string;
  items: QuoteItem[];
  subtotal: number;
  total: number;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'expired';
  createdAt: string;
  sentDate?: string;
  viewedDate?: string;
  acceptedDate?: string;
  validUntil: string;
  notes?: string;
}
