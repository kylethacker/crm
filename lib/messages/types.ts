export type ContactStatus = 'lead' | 'customer' | 'prospect';

export type Contact = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  avatar?: string;
  status: ContactStatus;
  lastContacted?: string;
  notes?: string;
  tags?: string[];
  createdAt: string;
};

export type MessageDirection = 'inbound' | 'outbound';
export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed';

export type TextMessage = {
  id: string;
  contactId: string;
  text: string;
  direction: MessageDirection;
  timestamp: string;
  status: MessageStatus;
};

export type BookingStatus = 'upcoming' | 'completed' | 'cancelled' | 'no-show';

export type Booking = {
  id: string;
  contactId: string;
  title: string;
  date: string;
  time: string;
  duration: number; // minutes
  status: BookingStatus;
  amount?: number;
  notes?: string;
};

export type ActivityType = 'message' | 'booking' | 'note' | 'status-change' | 'tag-added' | 'created';

export type ActivityEvent = {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: string;
  meta?: string;
};

export type InvoiceItem = {
  description: string;
  amount: number;
};

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export type Invoice = {
  id: string;
  invoiceNumber: string;
  contactId: string;
  contactName: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  createdAt: string;
  dueDate: string;
  notes?: string;
};

export type Conversation = {
  contact: Contact;
  messages: TextMessage[];
  bookings: Booking[];
  activity: ActivityEvent[];
  unreadCount: number;
};
