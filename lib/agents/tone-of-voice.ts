/**
 * Tone-of-voice data for global agent settings.
 *
 * In production this would be generated after 10+ approved/edited drafts.
 * For now we ship mock data that represents a solopreneur who has already
 * gone through enough approvals to trigger auto-generation.
 */

export type ToneExample = {
  id: string;
  /** Which agent produced the draft */
  agentName: string;
  /** The situation / context */
  context: string;
  /** The approved (or edited-then-confirmed) message */
  message: string;
  /** Whether the user edited before confirming */
  wasEdited: boolean;
  /** When it was approved */
  approvedAt: string;
};

export type ToneOfVoiceData = {
  /** Number of approved/confirmed drafts so far */
  approvalCount: number;
  /** Threshold to trigger auto-generation */
  threshold: number;
  /** Whether the tone prompt has been generated */
  isGenerated: boolean;
  /** The generated tone-of-voice prompt (editable by user) */
  prompt: string;
  /** The examples used to derive the tone */
  examples: ToneExample[];
  /** When the tone was last generated / updated */
  generatedAt: string | null;
};

// ── Mock data ────────────────────────────────────────────────────────────────

export const mockToneExamples: ToneExample[] = [
  {
    id: 'ex-1',
    agentName: 'Speed-to-Lead',
    context: 'New lead inquiry about bathroom remodel',
    message:
      "Hey Sarah! Thanks for reaching out about the bathroom remodel — I'd love to help. I've got a few openings this week if you'd like me to swing by and take a look. No pressure, just a quick walkthrough so I can give you an honest estimate. What works best for you?",
    wasEdited: false,
    approvedAt: '2026-03-20T09:15:00Z',
  },
  {
    id: 'ex-2',
    agentName: 'Review Responder',
    context: '5-star Google review from a kitchen remodel client',
    message:
      "Thank you so much, Mike! It was a real pleasure working on your kitchen — you and Lisa had such a great vision for the space. Glad we could bring it to life. Don't hesitate to reach out if you ever need anything down the road!",
    wasEdited: true,
    approvedAt: '2026-03-19T14:30:00Z',
  },
  {
    id: 'ex-3',
    agentName: 'Friendly Collector',
    context: 'First reminder for overdue invoice ($2,400)',
    message:
      "Hi Tom — hope the new deck is holding up great! Just a quick heads-up that invoice #1042 ($2,400) slipped past the due date. Totally understand things get busy. Here's the payment link whenever you get a chance: [link]. Let me know if you have any questions!",
    wasEdited: true,
    approvedAt: '2026-03-18T10:00:00Z',
  },
  {
    id: 'ex-4',
    agentName: 'Deal Closer',
    context: 'Follow-up on open quote for fence installation',
    message:
      "Hey Priya! Just checking in on that fence quote from last week. No rush at all — I know it's a big decision. If you have any questions or want to tweak anything, I'm happy to chat. Otherwise I'll leave the ball in your court!",
    wasEdited: false,
    approvedAt: '2026-03-17T11:45:00Z',
  },
  {
    id: 'ex-5',
    agentName: 'Speed-to-Lead',
    context: 'Website form submission for emergency plumbing',
    message:
      "Hi David — got your message about the leak. That sounds stressful, so let's get it sorted ASAP. I can be there this afternoon between 2-4pm, or first thing tomorrow morning if that works better. Just let me know and I'll lock it in.",
    wasEdited: false,
    approvedAt: '2026-03-16T08:20:00Z',
  },
  {
    id: 'ex-6',
    agentName: 'Review Responder',
    context: '3-star review mentioning timeline delays',
    message:
      "Hi Jennifer — thanks for taking the time to share your feedback. You're right that the timeline stretched longer than we planned, and I'm sorry about that. The supply delays caught us off guard, but I should have communicated better along the way. I'm glad the end result turned out well, and I appreciate your patience. If there's anything I can do to make it right, please reach out directly.",
    wasEdited: true,
    approvedAt: '2026-03-15T16:10:00Z',
  },
  {
    id: 'ex-7',
    agentName: 'Receptionist',
    context: 'Booking confirmation for Tuesday appointment',
    message:
      "All set, Maria! You're booked for Tuesday at 10am. I'll send a reminder the day before. If anything comes up and you need to reschedule, just text me back — no worries at all. See you Tuesday!",
    wasEdited: false,
    approvedAt: '2026-03-14T13:00:00Z',
  },
  {
    id: 'ex-8',
    agentName: 'Deal Closer',
    context: 'Second follow-up on large renovation quote',
    message:
      "Hey Alex — circling back one more time on the renovation quote. I know it's a big project and you want to make sure everything lines up. If budget is a concern, happy to look at phasing it out so we can tackle the priority areas first. Just let me know what you're thinking!",
    wasEdited: true,
    approvedAt: '2026-03-13T09:30:00Z',
  },
];

export const mockToneOfVoice: ToneOfVoiceData = {
  approvalCount: 14,
  threshold: 10,
  isGenerated: true,
  generatedAt: '2026-03-21T06:00:00Z',
  prompt: `You are writing on behalf of Kyle, a hands-on home services professional. Match this tone in all customer-facing messages:

**Warm and personal** — Always use the customer's first name. Reference specific details about their project or situation. Messages should feel like they're from a real person who remembers them, not a template.

**Casual but respectful** — Write like a friendly text, not a formal email. Use contractions ("I'd", "you're", "let's"). Avoid corporate language, jargon, or stiff phrasing. But stay professional — no slang or emojis.

**Low-pressure and honest** — Never be pushy or salesy. Use phrases like "no rush", "no pressure", "whenever you get a chance". Acknowledge that decisions take time. Be upfront about problems when they happen.

**Action-oriented** — Always suggest a clear next step. Offer specific times, options, or a direct link. Make it easy for the customer to say yes without making them feel obligated.

**Takes ownership** — When something goes wrong, own it directly. Don't deflect or make excuses. Acknowledge the issue, explain what happened simply, and offer to make it right.`,
  examples: mockToneExamples,
};
