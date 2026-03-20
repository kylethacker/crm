import type { ReactNode } from 'react';

export type ColumnDef<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  align?: 'left' | 'right';
};

type DataTableProps<T> = {
  columns: ColumnDef<T>[];
  rows: T[];
  emptyMessage?: string;
};

export function DataTable<T>({ columns, rows, emptyMessage = 'No results found' }: DataTableProps<T>) {
  if (rows.length === 0) {
    return (
      <p className="px-3 py-4 text-center text-xs text-neutral-400">{emptyMessage}</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      {/* Header */}
      <div className="grid" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
        {columns.map((col) => (
          <div
            key={col.key}
            className={`px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-neutral-400 ${col.align === 'right' ? 'text-right' : 'text-left'}`}
          >
            {col.header}
          </div>
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
        {rows.map((row, i) => (
          <div key={i} className="grid" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
            {columns.map((col) => (
              <div
                key={col.key}
                className={`px-3 py-2 text-xs text-neutral-700 dark:text-neutral-300 ${col.align === 'right' ? 'text-right' : 'text-left'}`}
              >
                {col.render(row)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const badgeColors: Record<string, string> = {
  paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  accepted: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  customer: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  expired: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  draft: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  lead: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  viewed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  prospect: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

const fallbackColor = 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400';

export function StatusBadge({ status, suffix }: { status: string; suffix?: string }) {
  const color = badgeColors[status.toLowerCase()] ?? fallbackColor;
  const label = suffix ? `${status} ${suffix}` : status;

  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${color}`}>
      {label}
    </span>
  );
}
