'use client';

import { useSyncExternalStore, useCallback } from 'react';

export type Resolution = 'approved' | 'dismissed';

const STORAGE_KEY = 'crm-activity-resolutions';

let snapshot: Record<string, Resolution> = {};
const listeners = new Set<() => void>();

function hydrate() {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    snapshot = raw ? JSON.parse(raw) : {};
  } catch {
    snapshot = {};
  }
}

hydrate();

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // storage unavailable
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot() {
  return snapshot;
}

const SERVER_SNAPSHOT: Record<string, Resolution> = {};
function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

function resolve(id: string, action: Resolution) {
  snapshot = { ...snapshot, [id]: action };
  persist();
  emit();
}

function resetAll() {
  snapshot = {};
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // storage unavailable
  }
  emit();
}

export function useActivityResolutions() {
  const resolutions = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { resolutions, resolve, resetAll } as const;
}
