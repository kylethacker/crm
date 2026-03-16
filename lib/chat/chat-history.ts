import type { AgentName } from '@/lib/ai/agents';
import type { ContentPreview } from '@/lib/activity/types';
import type { ContactStatus } from '@/lib/messages/types';

export type ReviewItemContext = {
  type: 'review-item';
  sourceId: string;
  agentId: string;
  agentName: string;
  description: string;
  detail?: string;
  preview?: { label: string; value: string }[];
  contentPreviews?: ContentPreview[];
  status: string;
};

export type AnalyticsContext = {
  type: 'analytics';
  sourceId: string;
  description: string;
  totalVisitors: number;
  pageViews: number;
  bounceRate: number;
  avgSessionDuration: string;
  trafficSources: { source: string; visitors: number; pct: number }[];
  topPages: { path: string; views: number; avgTime: string }[];
};

export type DashboardCardContext = {
  type: 'dashboard-card';
  sourceId: string;
  cardType: string;
  title: string;
  summary: string;
};

export type ArtifactContext = ReviewItemContext | AnalyticsContext | DashboardCardContext;

export type ContactMessageSummary = {
  text: string;
  direction: 'inbound' | 'outbound';
  timestamp: string;
};

export type ContactBookingSummary = {
  title: string;
  date: string;
  time: string;
  status: string;
  amount?: number;
  notes?: string;
};

export type ContactActivitySummary = {
  type: string;
  description: string;
  timestamp: string;
};

export type ContactContext = {
  contactId: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  status: ContactStatus;
  tags?: string[];
  revenue?: number;
  notes?: string;
  recentMessages?: ContactMessageSummary[];
  bookings?: ContactBookingSummary[];
  recentActivity?: ContactActivitySummary[];
};

export type ChatSession = {
  id: string;
  title: string;
  createdAt: string;
  agentName: AgentName;
  artifactContext?: ArtifactContext;
  contactContext?: ContactContext;
  initialMessage?: string;
};

const STORAGE_KEY = 'crm-chat-sessions';
const MESSAGES_KEY = 'crm-chat-messages';

export function getChatSessions(): ChatSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ChatSession[];
  } catch {
    return [];
  }
}

function persist(sessions: ChatSession[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    // storage full or unavailable
  }
}

export function saveChatSession(session: ChatSession) {
  const sessions = getChatSessions();
  sessions.unshift(session);
  persist(sessions);
}

export function deleteChatSession(id: string) {
  const sessions = getChatSessions().filter((s) => s.id !== id);
  persist(sessions);
  deleteChatMessages(id);
}

export function updateChatTitle(id: string, title: string) {
  const sessions = getChatSessions();
  const session = sessions.find((s) => s.id === id);
  if (session) {
    session.title = title;
    persist(sessions);
  }
}

export function consumeInitialMessage(id: string): string | undefined {
  const sessions = getChatSessions();
  const session = sessions.find((s) => s.id === id);
  if (!session?.initialMessage) return undefined;
  const message = session.initialMessage;
  delete session.initialMessage;
  persist(sessions);
  return message;
}

// ── Message persistence ──

function getAllMessages(): Record<string, unknown[]> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(MESSAGES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function loadChatMessages(sessionId: string): unknown[] {
  return getAllMessages()[sessionId] ?? [];
}

export function saveChatMessages(sessionId: string, messages: unknown[]) {
  try {
    const all = getAllMessages();
    all[sessionId] = messages;
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(all));
  } catch {
    // storage full or unavailable
  }
}

function deleteChatMessages(sessionId: string) {
  try {
    const all = getAllMessages();
    delete all[sessionId];
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}
