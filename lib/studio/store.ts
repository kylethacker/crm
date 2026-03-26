'use client';

import { useSyncExternalStore } from 'react';
import type { Design } from './types';

const STORAGE_KEY = 'crm-studio-designs';

let snapshot: Design[] = [];
const listeners = new Set<() => void>();

function hydrate() {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    snapshot = raw ? (JSON.parse(raw) as Design[]) : [];
  } catch {
    snapshot = [];
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
  listeners.forEach((fn) => fn());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return snapshot;
}

const SERVER_SNAPSHOT: Design[] = [];
function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

export function saveDesign(design: Design) {
  const now = new Date().toISOString();
  const idx = snapshot.findIndex((d) => d.id === design.id);
  const updated = { ...design, updatedAt: now };

  if (idx >= 0) {
    snapshot = snapshot.map((d) => (d.id === design.id ? updated : d));
  } else {
    snapshot = [{ ...updated, createdAt: now }, ...snapshot];
  }

  persist();
  emit();
  return updated;
}

export function deleteDesign(id: string) {
  snapshot = snapshot.filter((d) => d.id !== id);
  persist();
  emit();
}

export function getDesignById(id: string) {
  return snapshot.find((d) => d.id === id);
}

export function useDesignsStore() {
  const designs = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    designs,
    save: saveDesign,
    remove: deleteDesign,
    getById: getDesignById,
  } as const;
}
