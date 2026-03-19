'use client';

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from 'react';
import type { ArtifactContext, ContactContext, MarketplaceAgentContext, ChatSession } from './chat-history';
import {
  getChatSessions,
  saveChatSession,
  deleteChatSession as deleteFromStorage,
  updateChatTitle as updateTitleInStorage,
  consumeInitialMessage as consumeFromStorage,
} from './chat-history';

type CreateSessionOptions = {
  agentName?: ChatSession['agentName'];
  artifactContext?: ArtifactContext;
  contactContext?: ContactContext;
  marketplaceAgentContext?: MarketplaceAgentContext;
  initialMessage?: string;
};

type ChatHistoryContextValue = {
  sessions: ChatSession[];
  activeSessionId: string | null;
  createSession: (options?: CreateSessionOptions) => string;
  selectSession: (id: string) => void;
  deleteSession: (id: string) => void;
  updateTitle: (id: string, title: string) => void;
  consumeInitialMessage: (id: string) => string | undefined;
  findSessionByArtifact: (sourceId: string) => ChatSession | undefined;
};

const ChatHistoryContext = createContext<ChatHistoryContextValue | null>(null);

let listeners: Array<() => void> = [];
let snapshotCache: ChatSession[] | null = null;

function subscribe(cb: () => void) {
  listeners = [...listeners, cb];
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
}

function getSnapshot(): ChatSession[] {
  if (!snapshotCache) snapshotCache = getChatSessions();
  return snapshotCache;
}

const SERVER_SNAPSHOT: ChatSession[] = [];
function getServerSnapshot(): ChatSession[] {
  return SERVER_SNAPSHOT;
}

function invalidate() {
  snapshotCache = null;
  for (const l of listeners) l();
}

export function ChatHistoryProvider({ children }: { children: React.ReactNode }) {
  const sessions = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const createSession = useCallback((options?: CreateSessionOptions) => {
    const { agentName = 'operator', artifactContext, contactContext, marketplaceAgentContext, initialMessage } = options ?? {};
    const id = crypto.randomUUID();
    const artifactTitle = artifactContext
      ? ('title' in artifactContext ? artifactContext.title : artifactContext.description)
      : undefined;
    const title = artifactTitle
      ?? (marketplaceAgentContext ? marketplaceAgentContext.agentName : undefined)
      ?? (contactContext ? `Chat with ${contactContext.name}` : 'New chat');
    const session: ChatSession = {
      id,
      title,
      createdAt: new Date().toISOString(),
      agentName,
      ...(artifactContext && { artifactContext }),
      ...(contactContext && { contactContext }),
      ...(marketplaceAgentContext && { marketplaceAgentContext }),
      ...(initialMessage && { initialMessage }),
    };
    saveChatSession(session);
    invalidate();
    setActiveSessionId(id);
    return id;
  }, []);

  const selectSession = useCallback((id: string) => {
    setActiveSessionId(id);
  }, []);

  const deleteSession = useCallback(
    (id: string) => {
      deleteFromStorage(id);
      invalidate();
      if (activeSessionId === id) setActiveSessionId(null);
    },
    [activeSessionId],
  );

  const updateTitle = useCallback((id: string, title: string) => {
    updateTitleInStorage(id, title);
    invalidate();
  }, []);

  const consumeInitialMessage = useCallback((id: string) => {
    const message = consumeFromStorage(id);
    if (message) invalidate();
    return message;
  }, []);

  const findSessionByArtifact = useCallback(
    (sourceId: string) => sessions.find((s) => s.artifactContext?.sourceId === sourceId),
    [sessions],
  );

  const value = useMemo<ChatHistoryContextValue>(
    () => ({ sessions, activeSessionId, createSession, selectSession, deleteSession, updateTitle, consumeInitialMessage, findSessionByArtifact }),
    [sessions, activeSessionId, createSession, selectSession, deleteSession, updateTitle, consumeInitialMessage, findSessionByArtifact],
  );

  return <ChatHistoryContext value={value}>{children}</ChatHistoryContext>;
}

export function useChatHistory() {
  const ctx = useContext(ChatHistoryContext);
  if (!ctx) throw new Error('useChatHistory must be used within ChatHistoryProvider');
  return ctx;
}
