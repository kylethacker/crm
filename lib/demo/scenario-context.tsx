'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ScenarioId } from './scenarios';

const STORAGE_KEY = 'crm-demo-scenario';

type ScenarioContextValue = {
  scenarioId: ScenarioId;
  setScenario: (id: ScenarioId) => void;
};

const ScenarioContext = createContext<ScenarioContextValue>({
  scenarioId: 'busy',
  setScenario: () => {},
});

export function ScenarioProvider({ children }: { children: React.ReactNode }) {
  const [scenarioId, setScenarioId] = useState<ScenarioId>(() => {
    if (typeof window === 'undefined') return 'busy';
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as ScenarioId | null;
      if (stored && ['busy', 'handled', 'fresh'].includes(stored)) return stored;
    } catch { /* */ }
    return 'busy';
  });

  const setScenario = useCallback((id: ScenarioId) => {
    setScenarioId(id);
    try { localStorage.setItem(STORAGE_KEY, id); } catch { /* */ }
    // Also set as cookie so server components can read it
    document.cookie = `${STORAGE_KEY}=${id};path=/;max-age=31536000`;
    // Force full reload so server + client data align
    window.location.reload();
  }, []);

  const value = useMemo(() => ({ scenarioId, setScenario }), [scenarioId, setScenario]);

  return <ScenarioContext value={value}>{children}</ScenarioContext>;
}

export function useScenario() {
  return useContext(ScenarioContext);
}
