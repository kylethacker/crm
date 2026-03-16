import type { UIMessage } from 'ai';

export type SuggestedResponse = {
  label: string;
  text: string;
};

type ToolPart = Extract<UIMessage['parts'][number], { toolCallId: string }>;

function getToolName(part: ToolPart): string {
  return part.type === 'dynamic-tool'
    ? part.toolName
    : part.type.replace(/^tool-/, '');
}

const toolSuggestions: Record<string, SuggestedResponse[]> = {
  draftMessage: [
    { label: 'Send it', text: 'Yes, send it' },
    { label: 'Edit', text: 'I want to edit the message' },
    { label: 'Not now', text: 'Not now' },
  ],
  createInvoice: [
    { label: 'Send invoice', text: 'Send the invoice' },
    { label: 'Edit', text: 'I need to change the invoice' },
    { label: 'Not now', text: 'Not now' },
  ],
  sendMessage: [
    { label: 'Thanks!', text: 'Thanks!' },
    { label: 'Anything else?', text: 'What else should I handle today?' },
  ],
  sendInvoice: [
    { label: 'Thanks!', text: 'Thanks!' },
    { label: 'Anything else?', text: 'What else should I handle today?' },
  ],
  createBooking: [
    { label: 'Send reminder', text: 'Draft a reminder message to confirm the appointment' },
    { label: 'Looks good', text: 'Looks good, thanks!' },
  ],
  cancelBooking: [
    { label: 'Notify them', text: 'Draft a message letting them know about the cancellation' },
    { label: 'Reschedule', text: 'Help me reschedule this appointment' },
  ],
  recordPayment: [
    { label: 'Send receipt', text: 'Draft a thank you message confirming payment received' },
    { label: 'Done', text: 'Thanks!' },
  ],
  getContactSummary: [
    { label: 'Draft message', text: 'Draft a message to them' },
    { label: 'Show profile', text: 'What should I know before our next meeting?' },
    { label: 'Create invoice', text: 'Create an invoice for them' },
  ],
  getTodaySchedule: [
    { label: 'Handle follow-ups', text: 'Help me handle the most urgent follow-up' },
    { label: 'Prep for next meeting', text: 'Help me prepare for my next meeting today' },
  ],
  updateContactStatus: [
    { label: 'Add note', text: 'Add a note about why the status changed' },
    { label: 'Done', text: 'Thanks!' },
  ],
  addNote: [
    { label: 'Done', text: 'Thanks!' },
  ],
  addTag: [
    { label: 'Done', text: 'Thanks!' },
  ],
};

// Text-based suggestions when no tool was used
const textPatterns: Array<{
  pattern: RegExp;
  suggestions: SuggestedResponse[];
}> = [
  {
    pattern: /follow[- ]?up|reach out|check in|haven't heard/i,
    suggestions: [
      { label: 'Handle it', text: 'Draft the follow-up message' },
      { label: 'Remind me later', text: 'I\'ll handle this later' },
    ],
  },
  {
    pattern: /overdue|past due|outstanding|unpaid/i,
    suggestions: [
      { label: 'Send reminder', text: 'Draft a payment reminder' },
      { label: 'Create invoice', text: 'Create an invoice for it' },
    ],
  },
  {
    pattern: /meeting|appointment|schedule|agenda/i,
    suggestions: [
      { label: 'Draft agenda', text: 'Draft an agenda for the meeting' },
      { label: 'Send reminder', text: 'Send a reminder about the appointment' },
    ],
  },
  {
    pattern: /at[- ]?risk|cooling|dormant|no[- ]?show/i,
    suggestions: [
      { label: 'Reach out', text: 'Draft a re-engagement message' },
      { label: 'Add note', text: 'Add a note about the situation' },
    ],
  },
];

export function getSuggestedResponses(
  messages: UIMessage[],
  status: string,
): SuggestedResponse[] {
  if (status !== 'ready' || messages.length === 0) return [];

  const lastMessage = messages[messages.length - 1]!;
  if (lastMessage.role !== 'assistant') return [];

  // Check for tool-based suggestions first
  const toolParts = lastMessage.parts.filter(
    (p): p is ToolPart => 'toolCallId' in p,
  );

  if (toolParts.length > 0) {
    const lastToolPart = toolParts[toolParts.length - 1]!;
    if (lastToolPart.state !== 'output-available') return [];
    const toolName = getToolName(lastToolPart);
    if (toolSuggestions[toolName]) return toolSuggestions[toolName];
  }

  // Check text content for pattern-based suggestions
  const textParts = lastMessage.parts.filter(
    (p): p is Extract<typeof p, { type: 'text' }> => p.type === 'text',
  );
  const text = textParts.map((p) => p.text).join(' ');

  for (const { pattern, suggestions } of textPatterns) {
    if (pattern.test(text)) return suggestions;
  }

  return [];
}
