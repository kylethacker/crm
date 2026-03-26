import type { AgentDefinition, ActiveAgent } from './types';

// ── Shared setting options ──────────────────────────────────────────────────

const toneOptions = [
  { value: 'friendly', label: 'Friendly' },
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
];

// ── Agent definitions ────────────────────────────────────────────────────────
// Each agent: what it monitors, what tools it uses, what it does.

export const agentDefinitions: AgentDefinition[] = [
  {
    id: 'speed-to-lead',
    name: 'Lead Responder',
    role: 'Responds to new leads instantly',
    problem: 'I lose leads because I can\'t respond fast enough',
    does: 'Watches for new inquiries — web forms, texts, missed calls. Drafts a personalized response and sends it within 60 seconds. If the lead is ready to book, it books them.',
    triggers: [
      { type: 'event', description: 'When a new lead comes in' },
    ],
    tools: ['draftMessage', 'sendMessage', 'createBooking', 'getContactSummary', 'getContacts', 'getCalendarSlots', 'getBusinessConfig', 'logAgentAction', 'escalateToOwner'],
    defaultAutonomy: 'draft-approve',
    price: 29,
    expectedOutcome: '3x faster lead response on average',
    highlights: [
      'Responds to new leads within 60 seconds',
      'Personalizes messages based on inquiry context',
      'Books ready-to-go leads automatically',
      'Escalates complex inquiries to you',
    ],
    mode: 'inbound',
    systemPrompt: `You are the instant lead responder for this business.

## Personality
- Tone: {{tone}}
- You represent the business directly — customers don't know you're an AI

## Rules
- Respond to new inquiries within {{maxResponseMinutes}} minute(s)
- Personalize every response using the lead's inquiry details
- {{qualifyFirst}} → If true: ask qualifying questions before booking. If false: move straight to booking.
- {{autoBook}} → If true: book qualified leads directly into available slots. If false: suggest times and let the lead confirm.
- If the inquiry is complex, high-value, or outside business hours, escalate to the owner
- Keep messages under 3 sentences unless the question requires more detail
- Always use the contact's first name`,
    settings: [
      { key: 'tone', label: 'Tone', type: 'select', options: toneOptions, default: 'friendly' },
      { key: 'maxResponseMinutes', label: 'Max response time', type: 'number', min: 1, max: 30, unit: 'minutes', default: 1 },
      { key: 'autoBook', label: 'Auto-book qualified leads', type: 'toggle', default: false },
      { key: 'qualifyFirst', label: 'Qualify before booking', type: 'toggle', default: true },
    ],
  },
  {
    id: 'deal-closer',
    name: 'Deal Closer',
    role: 'Follows up on every open quote',
    problem: 'I forget to follow up and lose deals',
    does: 'Checks for open quotes and proposals daily. Drafts follow-ups based on how long it\'s been and whether the client has been active. Knows when to escalate to you for a personal touch.',
    triggers: [
      { type: 'schedule', description: 'Every morning at 9am' },
      { type: 'event', description: 'When a quote is viewed' },
    ],
    tools: ['draftMessage', 'sendMessage', 'getContactSummary', 'getContacts', 'getQuotes', 'getInvoices', 'createQuote', 'createInvoice', 'getBusinessConfig', 'logAgentAction', 'escalateToOwner'],
    defaultAutonomy: 'draft-approve',
    price: 39,
    expectedOutcome: 'Recovers $2,300/mo in forgotten deals',
    highlights: [
      'Monitors every open quote daily',
      'Times follow-ups based on client engagement',
      'Detects when a quote has been viewed',
      'Knows when to loop you in for the personal touch',
    ],
    mode: 'reactive',
    systemPrompt: `You are the deal closer for this business. Your job is to follow up on every open quote until it's won or lost.

## Personality
- Tone: {{tone}}
- You represent the business directly — customers don't know you're an AI

## Rules
- Check for open quotes and proposals daily
- Send the first follow-up after {{followUpDays}} day(s) with no response
- Send up to {{maxFollowUps}} follow-ups before pausing
- Escalate to the owner after {{escalateAfterDays}} days with no progress
- Personalize follow-ups based on the quote details and client history
- When a quote is viewed, send a timely follow-up
- Always use the contact's first name`,
    settings: [
      { key: 'tone', label: 'Tone', type: 'select', options: toneOptions, default: 'professional' },
      { key: 'followUpDays', label: 'Days before first follow-up', type: 'number', min: 1, max: 14, unit: 'days', default: 3 },
      { key: 'maxFollowUps', label: 'Max follow-ups', type: 'number', min: 1, max: 5, default: 3 },
      { key: 'escalateAfterDays', label: 'Escalate after', type: 'number', min: 5, max: 30, unit: 'days', default: 10 },
    ],
  },
  {
    id: 'reputation-builder',
    name: 'Reputation Builder',
    role: 'Gets you more 5-star reviews',
    problem: 'My online reputation doesn\'t reflect how good we are',
    does: 'After a completed booking, sends a friendly review request to happy customers. Waits for the right moment — not too soon, not too late. Can respond to reviews in your voice.',
    triggers: [
      { type: 'event', description: 'When a booking is completed' },
    ],
    tools: ['draftMessage', 'sendMessage', 'getContactSummary', 'getReviewStatus', 'sendReviewRequest', 'getBusinessConfig', 'logAgentAction', 'escalateToOwner'],
    defaultAutonomy: 'auto',
    price: 19,
    expectedOutcome: '4-6 new five-star reviews per month',
    highlights: [
      'Sends review requests after completed bookings',
      'Picks the right moment — not too soon, not too late',
      'Direct links to Google and Yelp',
      'Tracks your rating and review count over time',
    ],
    mode: 'reactive',
    systemPrompt: `You are the reputation builder for this business. Your job is to get more 5-star reviews from happy customers.

## Personality
- Tone: {{tone}}
- You represent the business directly — customers don't know you're an AI

## Rules
- Wait {{delayHours}} hour(s) after a completed booking before sending a review request
- {{followUpEnabled}} → If true: send a follow-up if the customer opened but didn't leave a review. If false: send one request only.
- Preferred platform: {{preferredPlatform}} — include direct links to the preferred platform(s)
- Never send a review request after a no-show or cancellation
- Keep messages warm and personal — reference the specific service they received
- Always use the contact's first name`,
    settings: [
      { key: 'tone', label: 'Tone', type: 'select', options: toneOptions, default: 'friendly' },
      { key: 'delayHours', label: 'Hours after booking to send request', type: 'number', min: 1, max: 72, unit: 'hours', default: 24 },
      { key: 'followUpEnabled', label: 'Send follow-up if no review', type: 'toggle', default: true },
      { key: 'preferredPlatform', label: 'Preferred platform', type: 'select', options: [
        { value: 'google', label: 'Google' },
        { value: 'yelp', label: 'Yelp' },
        { value: 'both', label: 'Both' },
      ], default: 'google' },
    ],
    category: 'discoverability',
  },
  {
    id: 'slot-filler',
    name: 'Slot Filler',
    role: 'Fills last-minute cancellations',
    problem: 'I have empty slots on my calendar this week',
    does: 'Checks your calendar each morning for gaps. Finds contacts who are overdue for a visit and sends them a personalized "we had an opening" message.',
    triggers: [
      { type: 'schedule', description: 'Every morning at 8am' },
      { type: 'event', description: 'When a booking is cancelled' },
    ],
    tools: ['draftMessage', 'sendMessage', 'getContactSummary', 'getContacts', 'getCalendarSlots', 'createBooking', 'getBusinessConfig', 'logAgentAction', 'escalateToOwner'],
    defaultAutonomy: 'draft-approve',
    price: 24,
    expectedOutcome: 'Fills 8-12 empty slots per month',
    highlights: [
      'Scans your calendar each morning for gaps',
      'Finds overdue-for-a-visit contacts to fill slots',
      'Sends personalized "we had an opening" messages',
      'Reacts instantly when bookings get cancelled',
    ],
    mode: 'scheduled',
    systemPrompt: `You are the slot filler for this business. Your job is to keep the calendar full by filling empty slots and last-minute cancellations.

## Personality
- Tone: {{tone}}
- You represent the business directly — customers don't know you're an AI

## Rules
- Look ahead {{lookAheadDays}} day(s) for empty slots
- Send up to {{maxMessagesPerDay}} messages per day
- Prioritize contacts who are overdue for a visit
- Personalize each message — reference their last visit and the specific opening
- Never double-book a slot
- Always use the contact's first name`,
    settings: [
      { key: 'tone', label: 'Tone', type: 'select', options: toneOptions, default: 'friendly' },
      { key: 'lookAheadDays', label: 'Look-ahead window', type: 'number', min: 1, max: 14, unit: 'days', default: 7 },
      { key: 'maxMessagesPerDay', label: 'Max messages per day', type: 'number', min: 1, max: 10, default: 5 },
    ],
  },
  {
    id: 'friendly-collector',
    name: 'Friendly Collector',
    role: 'Gets you paid without the awkward conversation',
    problem: 'Collecting payment is awkward and I have overdue invoices',
    does: 'Monitors unpaid invoices. Sends friendly reminders at smart intervals — gentle at first, more direct as time goes on. Matches the tone to your relationship with the client.',
    triggers: [
      { type: 'schedule', description: 'Every morning at 10am' },
    ],
    tools: ['draftMessage', 'sendMessage', 'getContactSummary', 'getInvoices', 'createInvoice', 'sendInvoice', 'getBusinessConfig', 'logAgentAction', 'escalateToOwner'],
    defaultAutonomy: 'draft-approve',
    price: 29,
    expectedOutcome: 'Cuts average days-to-payment by 40%',
    highlights: [
      'Monitors all unpaid invoices automatically',
      'Escalates tone gradually — friendly to firm',
      'Matches tone to your relationship with the client',
      'Flags invoices 15+ days overdue for your attention',
    ],
    mode: 'scheduled',
    systemPrompt: `You are the friendly collector for this business. Your job is to get invoices paid without damaging relationships.

## Personality
- Reminder style: {{reminderStyle}}
- You represent the business directly — customers don't know you're an AI

## Rules
- Send the first reminder {{firstReminderDays}} day(s) after the due date
- Send follow-up reminders every {{reminderInterval}} day(s)
- Escalate to the owner after {{escalateAfterDays}} days overdue
- Start gentle and get more direct with each reminder
- Reference the specific invoice, amount, and service provided
- Always use the contact's first name
- Never be rude or threatening — firm but fair`,
    settings: [
      { key: 'reminderStyle', label: 'Reminder style', type: 'select', options: [
        { value: 'gentle', label: 'Gentle' },
        { value: 'balanced', label: 'Balanced' },
        { value: 'direct', label: 'Direct' },
      ], default: 'gentle' },
      { key: 'firstReminderDays', label: 'First reminder after due date', type: 'number', min: 1, max: 7, unit: 'days', default: 3 },
      { key: 'reminderInterval', label: 'Days between reminders', type: 'number', min: 3, max: 14, unit: 'days', default: 7 },
      { key: 'escalateAfterDays', label: 'Escalate after', type: 'number', min: 7, max: 30, unit: 'days', default: 15 },
    ],
  },
  {
    id: 'churn-preventer',
    name: 'Churn Preventer',
    role: 'Saves customers before they leave',
    problem: 'I don\'t know which customers I\'m about to lose',
    does: 'Tracks how often each customer visits. When a regular breaks their pattern, drafts a personal "we miss you" message. Flags VIP customers for your personal attention.',
    triggers: [
      { type: 'schedule', description: 'Every Monday morning' },
    ],
    tools: ['draftMessage', 'sendMessage', 'getContactSummary', 'getContacts', 'getWeekSummary', 'addNote', 'getBusinessConfig', 'logAgentAction', 'escalateToOwner'],
    defaultAutonomy: 'draft-approve',
    price: 34,
    expectedOutcome: 'Saves 2-3 at-risk customers per month',
    highlights: [
      'Tracks visit frequency for every customer',
      'Detects when a regular breaks their pattern',
      'Drafts personal "we miss you" re-engagement messages',
      'Flags VIP customers for your personal attention',
    ],
    mode: 'scheduled',
    systemPrompt: `You are the churn preventer for this business. Your job is to identify at-risk customers and re-engage them before they leave.

## Personality
- Tone: {{tone}}
- You represent the business directly — customers don't know you're an AI

## Rules
- Flag customers inactive for {{inactivityDays}} day(s) or more
- Customers with lifetime revenue above \${{vipThreshold}} are VIPs — escalate these to the owner for personal outreach
- Draft personal "we miss you" messages for at-risk regulars
- Reference their past visits and what they liked
- Always use the contact's first name
- Never make the customer feel guilty — focus on what you can offer them`,
    settings: [
      { key: 'tone', label: 'Tone', type: 'select', options: toneOptions, default: 'friendly' },
      { key: 'inactivityDays', label: 'Days of inactivity to flag', type: 'number', min: 14, max: 90, unit: 'days', default: 30 },
      { key: 'vipThreshold', label: 'VIP revenue threshold', type: 'number', min: 500, max: 10000, unit: '$', default: 1000 },
    ],
  },
  {
    id: 'week-planner',
    name: 'Week Planner',
    role: 'Plans your week so you don\'t have to',
    problem: 'I spend Sunday night planning my week and it takes forever',
    does: 'Every Sunday evening, pulls together your week: who to follow up with, bookings to prep for, revenue vs. goals, overdue invoices. Gives you the 3 most impactful things to do Monday.',
    triggers: [
      { type: 'schedule', description: 'Every {{deliveryDay}} at 6pm' },
    ],
    tools: ['getContactSummary', 'getContacts', 'getCalendarSlots', 'getInvoices', 'getQuotes', 'getWeekSummary', 'getBusinessConfig', 'logAgentAction'],
    defaultAutonomy: 'auto',
    price: 0,
    expectedOutcome: 'Saves 2+ hours of planning every week',
    highlights: [
      'Weekly briefing every Sunday evening',
      'Surfaces follow-ups, bookings, and revenue at a glance',
      'Identifies the 3 most impactful things for Monday',
      'Tracks overdue invoices and at-risk contacts',
    ],
    mode: 'scheduled',
    systemPrompt: `You are the week planner for this business. Your job is to prepare a clear, actionable weekly briefing.

## Rules
- Deliver the briefing every {{deliveryDay}}
- Focus on: {{focusAreas}}
- Identify the 3 most impactful things for Monday
- Surface overdue follow-ups, upcoming bookings, and revenue status
- Flag at-risk contacts and overdue invoices
- Keep it concise and scannable — bullet points, not paragraphs
- End with a clear "Top 3 priorities" section`,
    settings: [
      { key: 'deliveryDay', label: 'Delivery day', type: 'select', options: [
        { value: 'Friday', label: 'Friday' },
        { value: 'Saturday', label: 'Saturday' },
        { value: 'Sunday', label: 'Sunday' },
      ], default: 'Sunday' },
      { key: 'focusAreas', label: 'Focus areas', type: 'text', placeholder: 'e.g. follow-ups, revenue, bookings', default: 'follow-ups, revenue, bookings' },
    ],
  },
  {
    id: 'blog-writer',
    name: 'Blog Writer',
    role: 'Writes a weekly blog post for your business',
    problem: 'I know I should be blogging but I never have time to write',
    does: 'Every week, pulls together business activity, customer wins, and industry context to write a relevant blog post. Drafts in your voice, on topics your customers care about.',
    triggers: [
      { type: 'schedule', description: 'Every {{publishDay}} morning' },
    ],
    tools: ['createBlogPost', 'getWeekSummary', 'getContacts', 'getBusinessConfig', 'getReviewStatus', 'logAgentAction', 'escalateToOwner'],
    defaultAutonomy: 'draft-approve',
    price: 24,
    expectedOutcome: '4 blog posts per month, written for you',
    highlights: [
      'Writes a fresh post every week in your voice',
      'Pulls from real business activity for authentic content',
      'Covers topics your customers actually care about',
      'You review before publishing — or let it auto-publish',
    ],
    mode: 'scheduled',
    systemPrompt: `You are the blog writer for this business. Your job is to write one blog post per week that resonates with the business's customers.

## Personality
- Tone: {{tone}}
- Write in the business owner's voice — authentic, not corporate

## Rules
- Post length: {{postLength}}
- Topics to cover: {{topics}}
- Publish day: {{publishDay}}
- {{autoPublish}} → If true: publish immediately. If false: save as draft for review.
- Pull from real business activity — recent customer wins, common questions, seasonal trends
- Include a clear takeaway or call to action
- Use short paragraphs and subheadings for readability
- Never make up customer stories — use real data from the CRM`,
    settings: [
      { key: 'tone', label: 'Tone', type: 'select', options: [
        { value: 'professional', label: 'Professional' },
        { value: 'conversational', label: 'Conversational' },
        { value: 'thought-leadership', label: 'Thought Leadership' },
      ], default: 'conversational' },
      { key: 'postLength', label: 'Post length', type: 'select', options: [
        { value: 'short ~300 words', label: 'Short (~300 words)' },
        { value: 'medium ~600 words', label: 'Medium (~600 words)' },
        { value: 'long ~1000 words', label: 'Long (~1000 words)' },
      ], default: 'medium ~600 words' },
      { key: 'topics', label: 'Topics', type: 'text', placeholder: 'e.g. tips, customer stories, industry trends', default: 'tips, customer stories, industry trends' },
      { key: 'publishDay', label: 'Publish day', type: 'select', options: [
        { value: 'Monday', label: 'Monday' },
        { value: 'Tuesday', label: 'Tuesday' },
        { value: 'Wednesday', label: 'Wednesday' },
        { value: 'Thursday', label: 'Thursday' },
        { value: 'Friday', label: 'Friday' },
      ], default: 'Wednesday' },
      { key: 'autoPublish', label: 'Auto-publish', type: 'toggle', default: false },
    ],
    guardrails: [{ tool: 'createBlogPost', reason: 'Blog posts should be reviewed before publishing' }],
    category: 'discoverability',
  },
  {
    id: 'prompt-rankings',
    name: 'Prompt Rankings',
    role: 'Tracks how AI search engines recommend you',
    problem: 'I have no idea if AI assistants are recommending my business',
    does: 'Monitors how your business appears when people ask ChatGPT, Gemini, and other AI assistants for recommendations in your area. Tracks your ranking position, mention frequency, and sentiment over time. Alerts you when competitors move ahead.',
    triggers: [
      { type: 'schedule', description: 'Every morning at 7am' },
      { type: 'event', description: 'When a ranking change is detected' },
    ],
    tools: ['getBusinessConfig', 'getContacts', 'getReviewStatus', 'logAgentAction', 'escalateToOwner'],
    defaultAutonomy: 'auto',
    price: 34,
    expectedOutcome: 'Full visibility into AI search rankings',
    highlights: [
      'Tracks your position across ChatGPT, Gemini, and Perplexity',
      'Monitors competitor rankings alongside yours',
      'Alerts you when your ranking changes',
      'Weekly report with trends and recommendations',
    ],
    mode: 'scheduled',
    systemPrompt: `You are the prompt rankings monitor for this business. Your job is to track how the business appears in AI-generated search results.

## Rules
- Check rankings for these queries: {{trackedQueries}}
- Monitor these competitors: {{competitors}}
- Check every {{checkFrequency}}
- Alert the owner when ranking drops by 2+ positions
- Include sentiment analysis — are mentions positive, neutral, or negative?
- Weekly summary with trends and actionable recommendations`,
    settings: [
      { key: 'trackedQueries', label: 'Tracked queries', type: 'text', placeholder: 'e.g. best hair salon near me, top stylist in Austin', default: 'best hair salon near me, top stylist in my area' },
      { key: 'competitors', label: 'Competitors to track', type: 'text', placeholder: 'e.g. Salon A, Salon B', default: '' },
      { key: 'checkFrequency', label: 'Check frequency', type: 'select', options: [
        { value: 'daily', label: 'Daily' },
        { value: 'twice-weekly', label: 'Twice a week' },
        { value: 'weekly', label: 'Weekly' },
      ], default: 'daily' },
    ],
    category: 'discoverability',
  },
  {
    id: 'content-creator',
    name: 'Content Creator',
    role: 'Creates content that gets you found',
    problem: 'I know I need more content to show up online but I never have time',
    does: 'Creates SEO-optimized landing pages, FAQs, and service descriptions that help your business rank in both traditional and AI search. Pulls from real customer questions and business activity to keep content authentic and relevant.',
    triggers: [
      { type: 'schedule', description: 'Every {{publishDay}} morning' },
    ],
    tools: ['createBlogPost', 'getWeekSummary', 'getContacts', 'getBusinessConfig', 'getReviewStatus', 'logAgentAction', 'escalateToOwner'],
    defaultAutonomy: 'draft-approve',
    price: 29,
    expectedOutcome: '8-12 optimized pages per month',
    highlights: [
      'Creates SEO-optimized service pages and FAQs',
      'Pulls from real customer questions for authentic content',
      'Optimized for both Google and AI search engines',
      'You review everything before it goes live',
    ],
    mode: 'scheduled',
    systemPrompt: `You are the content creator for this business. Your job is to create content that improves the business's discoverability in search engines and AI platforms.

## Personality
- Tone: {{tone}}
- Write in the business owner's voice — authentic, not corporate

## Rules
- Content types: {{contentTypes}}
- Publish day: {{publishDay}}
- {{autoPublish}} → If true: publish immediately. If false: save as draft for review.
- Focus on questions real customers ask
- Include local keywords and service-specific terms
- Structure content for featured snippets and AI extraction
- Each piece should target a specific search intent`,
    settings: [
      { key: 'tone', label: 'Tone', type: 'select', options: toneOptions, default: 'conversational' },
      { key: 'contentTypes', label: 'Content types', type: 'text', placeholder: 'e.g. FAQs, service pages, landing pages', default: 'FAQs, service pages, landing pages' },
      { key: 'publishDay', label: 'Publish day', type: 'select', options: [
        { value: 'Monday', label: 'Monday' },
        { value: 'Tuesday', label: 'Tuesday' },
        { value: 'Wednesday', label: 'Wednesday' },
        { value: 'Thursday', label: 'Thursday' },
        { value: 'Friday', label: 'Friday' },
      ], default: 'Tuesday' },
      { key: 'autoPublish', label: 'Auto-publish', type: 'toggle', default: false },
    ],
    guardrails: [{ tool: 'createBlogPost', reason: 'Content should be reviewed before publishing' }],
    category: 'discoverability',
  },
];

const agentIndex = new Map(agentDefinitions.map((a) => [a.id, a]));

export function getAgentDef(id: string): AgentDefinition | undefined {
  return agentIndex.get(id);
}

// ── Active agents (mock state) ───────────────────────────────────────────────

export const activeAgents: ActiveAgent[] = [
  {
    agentId: 'reputation-builder',
    autonomy: 'auto',
    activatedAt: '2026-02-15',
    paused: false,
    outcomes: { 'reviews collected': 34, 'avg rating': 4.8 },
    recentActions: [
      { id: 'a1', agentId: 'reputation-builder', description: 'Sent review request to Sarah Johnson after her haircut', tool: 'sendMessage', status: 'executed', createdAt: '2026-03-17T14:30:00Z', contactName: 'Sarah Johnson' },
      { id: 'a2', agentId: 'reputation-builder', description: 'Sent review request to Mike Chen after consultation', tool: 'sendMessage', status: 'executed', createdAt: '2026-03-16T11:00:00Z', contactName: 'Mike Chen' },
      { id: 'a6', agentId: 'reputation-builder', description: 'Review request sent to Angela Rivera — completed color treatment', tool: 'sendMessage', status: 'executed', createdAt: '2026-03-14T16:45:00Z', contactName: 'Angela Rivera' },
      { id: 'a7', agentId: 'reputation-builder', description: 'Skipped review request for Tom Walsh — last visit was a no-show', tool: 'logAgentAction', status: 'executed', createdAt: '2026-03-13T10:00:00Z', contactName: 'Tom Walsh' },
      { id: 'a8', agentId: 'reputation-builder', description: 'Review request sent to Priya Patel after styling appointment', tool: 'sendMessage', status: 'executed', createdAt: '2026-03-11T15:20:00Z', contactName: 'Priya Patel' },
      { id: 'a9', agentId: 'reputation-builder', description: 'Sent follow-up to James Lee who opened but didn\'t leave a review', tool: 'sendMessage', status: 'executed', createdAt: '2026-03-09T09:30:00Z', contactName: 'James Lee' },
      { id: 'a10', agentId: 'reputation-builder', description: 'New 5-star review detected from Rachel Kim on Google', tool: 'getReviewStatus', status: 'executed', createdAt: '2026-03-07T12:00:00Z', contactName: 'Rachel Kim' },
    ],
  },
  {
    agentId: 'deal-closer',
    autonomy: 'draft-approve',
    activatedAt: '2026-03-01',
    paused: false,
    outcomes: { 'deals closed': 8, 'revenue recovered': 18400 },
    recentActions: [
      { id: 'a3', agentId: 'deal-closer', description: 'Follow-up drafted for David Kim — quote opened but no response in 5 days', tool: 'draftMessage', status: 'proposed', createdAt: '2026-03-18T09:00:00Z', contactName: 'David Kim' },
      { id: 'a4', agentId: 'deal-closer', description: 'Sent follow-up to Lisa Tran — quote accepted, invoice sent', tool: 'sendMessage', status: 'executed', createdAt: '2026-03-17T09:15:00Z', contactName: 'Lisa Tran' },
      { id: 'a11', agentId: 'deal-closer', description: 'Reminder drafted for Nora Sato — quote expires in 2 days', tool: 'draftMessage', status: 'proposed', createdAt: '2026-03-17T09:00:00Z', contactName: 'Nora Sato' },
      { id: 'a12', agentId: 'deal-closer', description: 'Follow-up sent to Carlos Mendez — closed $2,400 kitchen remodel quote', tool: 'sendMessage', status: 'executed', createdAt: '2026-03-15T10:30:00Z', contactName: 'Carlos Mendez' },
      { id: 'a13', agentId: 'deal-closer', description: 'Created invoice for Emily Watson — $850 consultation package', tool: 'createInvoice', status: 'executed', createdAt: '2026-03-13T14:00:00Z', contactName: 'Emily Watson' },
      { id: 'a14', agentId: 'deal-closer', description: 'Quote viewed by Brian Park — scheduled follow-up for tomorrow', tool: 'logAgentAction', status: 'executed', createdAt: '2026-03-12T08:45:00Z', contactName: 'Brian Park' },
      { id: 'a15', agentId: 'deal-closer', description: 'Escalated Jordan Blake to owner — high-value quote ($5,200) stalled 10+ days', tool: 'escalateToOwner', status: 'executed', createdAt: '2026-03-10T09:00:00Z', contactName: 'Jordan Blake' },
      { id: 'a16', agentId: 'deal-closer', description: 'Follow-up sent to Amy Nguyen — she replied with questions, drafted answers', tool: 'draftMessage', status: 'executed', createdAt: '2026-03-08T11:15:00Z', contactName: 'Amy Nguyen' },
    ],
  },
  {
    agentId: 'week-planner',
    autonomy: 'auto',
    activatedAt: '2026-01-20',
    paused: false,
    outcomes: { 'briefings sent': 8 },
    recentActions: [
      { id: 'a5', agentId: 'week-planner', description: 'Weekly briefing sent — 4 follow-ups, 6 bookings, $2.1k outstanding', tool: 'getContactSummary', status: 'executed', createdAt: '2026-03-16T18:00:00Z' },
      { id: 'a17', agentId: 'week-planner', description: 'Weekly briefing sent — 3 follow-ups, 8 bookings, $1.4k outstanding', tool: 'getContactSummary', status: 'executed', createdAt: '2026-03-09T18:00:00Z' },
      { id: 'a18', agentId: 'week-planner', description: 'Weekly briefing sent — 5 follow-ups, 4 bookings, $3.2k outstanding', tool: 'getContactSummary', status: 'executed', createdAt: '2026-03-02T18:00:00Z' },
      { id: 'a19', agentId: 'week-planner', description: 'Weekly briefing sent — 2 follow-ups, 7 bookings, revenue on track', tool: 'getContactSummary', status: 'executed', createdAt: '2026-02-23T18:00:00Z' },
      { id: 'a20', agentId: 'week-planner', description: 'Weekly briefing sent — flagged 2 at-risk customers for outreach', tool: 'getContactSummary', status: 'executed', createdAt: '2026-02-16T18:00:00Z' },
      { id: 'a21', agentId: 'week-planner', description: 'Weekly briefing sent — 6 follow-ups, 5 bookings, $2.8k outstanding', tool: 'getContactSummary', status: 'executed', createdAt: '2026-02-09T18:00:00Z' },
    ],
  },
];

const activeIndex = new Map(activeAgents.map((a) => [a.agentId, a]));

export function getActiveAgent(agentId: string): ActiveAgent | undefined {
  return activeIndex.get(agentId);
}

/** Agents not yet activated — the gaps */
const activeIds = new Set(activeAgents.map((a) => a.agentId));
export const availableAgents: AgentDefinition[] = agentDefinitions.filter((a) => !activeIds.has(a.id));

// ── Pending approvals across all agents ──────────────────────────────────────

export function getPendingApprovals() {
  return activeAgents.flatMap((a) => a.recentActions.filter((act) => act.status === 'proposed'));
}

// ── Category helpers ─────────────────────────────────────────────────────────

export const discoverabilityAgents: AgentDefinition[] = agentDefinitions.filter(
  (a) => a.category === 'discoverability',
);

// ── Shared helpers ───────────────────────────────────────────────────────────

export function buildHirePrompt(agent: AgentDefinition): string {
  return `I want to add a ${agent.name} to my team. The problem I'm trying to solve: "${agent.problem}". Set it up for me.`;
}

export function formatTopOutcome(outcomes: Record<string, number>): string | null {
  const entry = Object.entries(outcomes)[0];
  if (!entry) return null;
  return `${entry[1].toLocaleString()} ${entry[0]}`;
}
