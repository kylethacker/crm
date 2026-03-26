import { calculateTool } from './calculate';
import { createInvoiceTool } from './create-invoice';
import { draftMessageTool } from './draft-message';
import { sendInvoiceTool } from './send-invoice';
import { sendMessageTool } from './send-message';
import { updateContactStatusTool } from './update-contact-status';
import { addNoteTool } from './add-note';
import { createBookingTool } from './create-booking';
import { cancelBookingTool } from './cancel-booking';
import { recordPaymentTool } from './record-payment';
import { addTagTool } from './add-tag';
import { getTodayScheduleTool } from './get-today-schedule';
import { getContactSummaryTool } from './get-contact-summary';

// --- Agent tools ---
import { getBusinessConfigTool } from './get-business-config';
import { getContactsTool } from './get-contacts';
import { getCalendarSlotsTool } from './get-calendar-slots';
import { getInvoicesTool } from './get-invoices';
import { getQuotesTool } from './get-quotes';
import { getReviewStatusTool } from './get-review-status';
import { getWeekSummaryTool } from './get-week-summary';
import { createQuoteTool } from './create-quote';
import { sendReviewRequestTool } from './send-review-request';
import { escalateToOwnerTool } from './escalate-to-owner';
import { logAgentActionTool } from './log-agent-action';
import { createBlogPostTool } from './create-blog-post';
import { generateDesignTool } from './generate-design';
import { hireAgentTool } from './hire-agent';

/**
 * All available tools, keyed by the name the model sees.
 *
 * Focused on CRM operations — every tool here directly serves
 * business workflows: invoicing, messaging, scheduling, and
 * contact management.
 *
 * @see https://v6.ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling
 */
export const tools = {
  // --- Math ---
  calculate: calculateTool,

  // --- Messaging ---
  draftMessage: draftMessageTool,
  sendMessage: sendMessageTool,

  // --- Invoicing ---
  createInvoice: createInvoiceTool,
  sendInvoice: sendInvoiceTool,
  recordPayment: recordPaymentTool,

  // --- Contacts ---
  updateContactStatus: updateContactStatusTool,
  addNote: addNoteTool,
  addTag: addTagTool,
  getContactSummary: getContactSummaryTool,

  // --- Scheduling ---
  createBooking: createBookingTool,
  cancelBooking: cancelBookingTool,
  getTodaySchedule: getTodayScheduleTool,

  // --- Agents: Read tools ---
  getBusinessConfig: getBusinessConfigTool,
  getContacts: getContactsTool,
  getCalendarSlots: getCalendarSlotsTool,
  getInvoices: getInvoicesTool,
  getQuotes: getQuotesTool,
  getReviewStatus: getReviewStatusTool,
  getWeekSummary: getWeekSummaryTool,

  // --- Agents: Action tools ---
  createQuote: createQuoteTool,
  sendReviewRequest: sendReviewRequestTool,
  escalateToOwner: escalateToOwnerTool,
  logAgentAction: logAgentActionTool,

  // --- Content ---
  createBlogPost: createBlogPostTool,

  // --- Team ---
  hireAgent: hireAgentTool,

  // --- Studio ---
  generateDesign: generateDesignTool,
};

export type AppTools = typeof tools;
