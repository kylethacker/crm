'use client';

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from 'react';
import type { TableView, TableViewType } from './types';
import { deleteTableView, getTableViews, saveTableView } from './store';

type ViewsContextValue = {
  views: TableView[];
  addView: (type: TableViewType, name: string, filters?: Record<string, unknown>) => TableView;
  removeView: (id: string) => void;
  getView: (id: string) => TableView | undefined;
};

const ViewsContext = createContext<ViewsContextValue | null>(null);

// Simple external store so all consumers stay in sync after mutations.
// Cache the snapshot so useSyncExternalStore gets a stable reference.
let listeners: Array<() => void> = [];
let cachedSnapshot: TableView[] | null = null;

function subscribe(cb: () => void) {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
}
function notify() {
  cachedSnapshot = null; // invalidate cache
  listeners.forEach((l) => l());
}
function getSnapshot(): TableView[] {
  if (cachedSnapshot === null) {
    cachedSnapshot = getTableViews();
  }
  return cachedSnapshot;
}

const emptyViews: TableView[] = [];
function getServerSnapshot(): TableView[] {
  return emptyViews;
}

export function ViewsProvider({ children }: { children: React.ReactNode }) {
  const views = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addView = useCallback(
    (type: TableViewType, name: string, filters: Record<string, unknown> = {}) => {
      const view: TableView = {
        id: crypto.randomUUID(),
        name,
        type,
        filters,
        createdAt: new Date().toISOString(),
      };
      saveTableView(view);
      notify();
      return view;
    },
    [],
  );

  const removeView = useCallback((id: string) => {
    deleteTableView(id);
    notify();
  }, []);

  const getView = useCallback(
    (id: string) => views.find((v) => v.id === id),
    [views],
  );

  const value = useMemo(
    () => ({ views, addView, removeView, getView }),
    [views, addView, removeView, getView],
  );

  return <ViewsContext value={value}>{children}</ViewsContext>;
}

export function useViews() {
  const ctx = useContext(ViewsContext);
  if (!ctx) throw new Error('useViews must be used within ViewsProvider');
  return ctx;
}
