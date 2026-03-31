'use client';

import { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';
import type { ActiveAgent, AutonomyLevel, AgentAction, AgentSettings } from './types';
import { getScenarioActiveAgents } from '@/lib/demo/scenarios';
import type { ScenarioId } from '@/lib/demo/scenarios';

const SCENARIO_KEY = 'crm-demo-scenario';
const STORAGE_PREFIX = 'crm-active-agents';
const VERSION_PREFIX = 'crm-active-agents-v';
// Bump this when mock data changes to invalidate stale localStorage
const DATA_VERSION = 5;

function getStoredScenario(): ScenarioId {
  if (typeof window === 'undefined') return 'busy';
  try {
    const stored = localStorage.getItem(SCENARIO_KEY) as ScenarioId | null;
    if (stored && ['busy', 'handled', 'fresh'].includes(stored)) return stored;
  } catch {}
  return 'busy';
}

function storageKeyFor(scenarioId: ScenarioId) {
  return `${STORAGE_PREFIX}-${scenarioId}`;
}

function versionKeyFor(scenarioId: ScenarioId) {
  return `${VERSION_PREFIX}-${scenarioId}`;
}

function loadAgents(): ActiveAgent[] {
  const scenarioId = getStoredScenario();
  if (typeof window === 'undefined') return getScenarioActiveAgents(scenarioId);
  try {
    const storedVersion = localStorage.getItem(versionKeyFor(scenarioId));
    if (storedVersion && Number(storedVersion) === DATA_VERSION) {
      const raw = localStorage.getItem(storageKeyFor(scenarioId));
      if (raw) return JSON.parse(raw) as ActiveAgent[];
    } else {
      // Version mismatch — clear stale data
      localStorage.removeItem(storageKeyFor(scenarioId));
      localStorage.setItem(versionKeyFor(scenarioId), String(DATA_VERSION));
    }
  } catch {
    // fall through
  }
  return getScenarioActiveAgents(scenarioId);
}

function persistAgents(agents: ActiveAgent[]) {
  const scenarioId = getStoredScenario();
  try {
    localStorage.setItem(storageKeyFor(scenarioId), JSON.stringify(agents));
    localStorage.setItem(versionKeyFor(scenarioId), String(DATA_VERSION));
  } catch {
    // storage full or unavailable
  }
}

type ActiveAgentsContextValue = {
  agents: ActiveAgent[];
  getAgent: (agentId: string) => ActiveAgent | undefined;
  activateAgent: (agentId: string, autonomy: AutonomyLevel) => void;
  approveAction: (agentId: string, actionId: string) => void;
  dismissAction: (agentId: string, actionId: string) => void;
  togglePause: (agentId: string) => void;
  setAutonomy: (agentId: string, level: AutonomyLevel) => void;
  updateSetting: (agentId: string, key: string, value: string | number | boolean) => void;
};

const ActiveAgentsContext = createContext<ActiveAgentsContextValue | null>(null);

export function ActiveAgentsProvider({ children }: { children: React.ReactNode }) {
  const [agents, setAgents] = useState<ActiveAgent[]>(() => getScenarioActiveAgents(getStoredScenario()));

  // Hydrate from localStorage on mount (may have locally-modified state)
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

  const activateAgent = useCallback(
    (agentId: string, autonomy: AutonomyLevel) => {
      update((prev) => {
        // Don't add duplicates
        if (prev.some((a) => a.agentId === agentId)) return prev;
        const newAgent: ActiveAgent = {
          agentId,
          autonomy,
          activatedAt: new Date().toISOString().split('T')[0]!,
          paused: false,
          outcomes: {},
          recentActions: [],
        };
        return [...prev, newAgent];
      });
    },
    [update],
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

  const updateSetting = useCallback(
    (agentId: string, key: string, value: string | number | boolean) => {
      update((prev) =>
        prev.map((a) =>
          a.agentId === agentId
            ? { ...a, settings: { ...a.settings, [key]: value } }
            : a,
        ),
      );
    },
    [update],
  );

  const value = useMemo<ActiveAgentsContextValue>(
    () => ({ agents, getAgent, activateAgent, approveAction, dismissAction, togglePause, setAutonomy, updateSetting }),
    [agents, getAgent, activateAgent, approveAction, dismissAction, togglePause, setAutonomy, updateSetting],
  );

  return <ActiveAgentsContext value={value}>{children}</ActiveAgentsContext>;
}

export function useActiveAgents() {
  const ctx = useContext(ActiveAgentsContext);
  if (!ctx) throw new Error('useActiveAgents must be used within ActiveAgentsProvider');
  return ctx;
}
