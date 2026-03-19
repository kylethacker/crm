'use client';

import { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';
import type { ActiveAgent, AutonomyLevel, AgentAction } from './types';
import { activeAgents as initialAgents } from './data';

const STORAGE_KEY = 'crm-active-agents';

function loadAgents(): ActiveAgent[] {
  if (typeof window === 'undefined') return initialAgents;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ActiveAgent[];
  } catch {
    // fall through
  }
  return initialAgents;
}

function persistAgents(agents: ActiveAgent[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(agents));
  } catch {
    // storage full or unavailable
  }
}

type ActiveAgentsContextValue = {
  agents: ActiveAgent[];
  getAgent: (agentId: string) => ActiveAgent | undefined;
  approveAction: (agentId: string, actionId: string) => void;
  dismissAction: (agentId: string, actionId: string) => void;
  togglePause: (agentId: string) => void;
  setAutonomy: (agentId: string, level: AutonomyLevel) => void;
};

const ActiveAgentsContext = createContext<ActiveAgentsContextValue | null>(null);

export function ActiveAgentsProvider({ children }: { children: React.ReactNode }) {
  const [agents, setAgents] = useState<ActiveAgent[]>(initialAgents);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setAgents(loadAgents());
  }, []);

  const update = useCallback((fn: (prev: ActiveAgent[]) => ActiveAgent[]) => {
    setAgents((prev) => {
      const next = fn(prev);
      persistAgents(next);
      return next;
    });
  }, []);

  const getAgent = useCallback(
    (agentId: string) => agents.find((a) => a.agentId === agentId),
    [agents],
  );

  const updateAction = useCallback(
    (agentId: string, actionId: string, status: AgentAction['status']) => {
      update((prev) =>
        prev.map((a) =>
          a.agentId === agentId
            ? {
                ...a,
                recentActions: a.recentActions.map((act) =>
                  act.id === actionId ? { ...act, status } : act,
                ),
              }
            : a,
        ),
      );
    },
    [update],
  );

  const approveAction = useCallback(
    (agentId: string, actionId: string) => updateAction(agentId, actionId, 'approved'),
    [updateAction],
  );

  const dismissAction = useCallback(
    (agentId: string, actionId: string) => updateAction(agentId, actionId, 'dismissed'),
    [updateAction],
  );

  const togglePause = useCallback(
    (agentId: string) => {
      update((prev) =>
        prev.map((a) => (a.agentId === agentId ? { ...a, paused: !a.paused } : a)),
      );
    },
    [update],
  );

  const setAutonomy = useCallback(
    (agentId: string, level: AutonomyLevel) => {
      update((prev) =>
        prev.map((a) => (a.agentId === agentId ? { ...a, autonomy: level } : a)),
      );
    },
    [update],
  );

  const value = useMemo<ActiveAgentsContextValue>(
    () => ({ agents, getAgent, approveAction, dismissAction, togglePause, setAutonomy }),
    [agents, getAgent, approveAction, dismissAction, togglePause, setAutonomy],
  );

  return <ActiveAgentsContext value={value}>{children}</ActiveAgentsContext>;
}

export function useActiveAgents() {
  const ctx = useContext(ActiveAgentsContext);
  if (!ctx) throw new Error('useActiveAgents must be used within ActiveAgentsProvider');
  return ctx;
}
