export type AgentId =
  | 'weekly-social-media'
  | 'review-collector'
  | 'appointment-reminder'
  | 'client-intake'
  | 'quote-builder'
  | 'booking-assistant'
  | 'win-back-campaign'
  | 'local-seo'
  | 'invoice-payment'
  | 'referral-program'
  | 'client-follow-up'
  | 'email-newsletter';

export type AgentActivityStatus = 'completed' | 'running' | 'needs-approval' | 'failed';

export type PreviewBlock = {
  label: string;
  value: string;
};

export type ContentPreview = {
  title: string;
  caption: string;
  platform: string;
  scheduledLabel: string;
  color: string;
  image?: string;
};

export type AgentActivity = {
  id: string;
  agentId: AgentId;
  description: string;
  detail?: string;
  preview?: PreviewBlock[];
  contentPreviews?: ContentPreview[];
  status: AgentActivityStatus;
  creditsUsed: number;
  timestamp: string;
};
