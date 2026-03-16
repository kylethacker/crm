/**
 * Agent name registry — maps agent IDs to display names.
 * Used by the dashboard and activity components.
 */

const agentNames: Array<[string, string]> = [
  ['weekly-social-media', 'Weekly Social Media'],
  ['review-collector', 'Review Collector'],
  ['appointment-reminder', 'Appointment Reminder'],
  ['client-intake', 'Client Intake'],
  ['quote-builder', 'Quote Builder'],
  ['booking-assistant', 'Booking Assistant'],
  ['win-back-campaign', 'Win-Back Campaign'],
  ['local-seo', 'Local SEO Optimizer'],
  ['invoice-payment', 'Invoice & Payment'],
  ['referral-program', 'Referral Program'],
  ['client-follow-up', 'Client Follow-Up'],
  ['email-newsletter', 'Email Newsletter'],
];

export const agentNameMap = new Map(agentNames);

export function getAgentName(id: string): string {
  return agentNameMap.get(id) ?? id;
}
