import type { TableView } from './types';

const STORAGE_KEY = 'crm-table-views';

export function getTableViews(): TableView[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TableView[]) : [];
  } catch {
    return [];
  }
}

function persist(views: TableView[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(views));
  } catch {
    // storage full or unavailable
  }
}

export function saveTableView(view: TableView) {
  const views = getTableViews();
  views.unshift(view);
  persist(views);
}

export function deleteTableView(id: string) {
  const views = getTableViews().filter((v) => v.id !== id);
  persist(views);
}
