'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/format';
import { useViews } from '@/lib/views/context';
import { fetchViewData, type ContactRow, type InvoiceRow, type QuoteRow } from '@/lib/views/data';
import type { TableView, TableViewType } from '@/lib/views/types';
import { StatusBadge } from '@/components/chat/tool-renderers/data-table';

// ── Column definitions (reuse same shape as inline tables) ───────────────────

type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number;
  align?: 'left' | 'right';
};

const contactColumns: Column<ContactRow>[] = [
  { key: 'name', header: 'Name', render: (r) => r.name, sortValue: (r) => r.name },
  { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} />, sortValue: (r) => r.status },
  { key: 'lastContact', header: 'Last Contact', render: (r) => (r.daysSinceContact != null ? `${r.daysSinceContact}d ago` : '—'), sortValue: (r) => r.daysSinceContact ?? 9999 },
  { key: 'revenue', header: 'Revenue', align: 'right', render: (r) => formatCurrency(r.totalRevenue), sortValue: (r) => r.totalRevenue },
  { key: 'bookings', header: 'Bookings', render: (r) => r.upcomingBookingCount, sortValue: (r) => r.upcomingBookingCount },
];

const invoiceColumns: Column<InvoiceRow>[] = [
  { key: 'invoice', header: 'Invoice', render: (r) => r.invoiceNumber, sortValue: (r) => r.invoiceNumber },
  { key: 'contact', header: 'Contact', render: (r) => r.contactName, sortValue: (r) => r.contactName },
  { key: 'total', header: 'Total', align: 'right', render: (r) => formatCurrency(r.total), sortValue: (r) => r.total },
  {
    key: 'status',
    header: 'Status',
    render: (r) => <StatusBadge status={r.daysPastDue > 0 ? 'overdue' : r.status} suffix={r.daysPastDue > 0 ? `${r.daysPastDue}d` : undefined} />,
    sortValue: (r) => r.status,
  },
  {
    key: 'due',
    header: 'Due',
    render: (r) => new Date(r.dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    sortValue: (r) => r.dueDate,
  },
];

const quoteColumns: Column<QuoteRow>[] = [
  { key: 'quote', header: 'Quote', render: (r) => r.quoteNumber, sortValue: (r) => r.quoteNumber },
  { key: 'contact', header: 'Contact', render: (r) => r.contactName, sortValue: (r) => r.contactName },
  { key: 'total', header: 'Total', align: 'right', render: (r) => formatCurrency(r.total), sortValue: (r) => r.total },
  {
    key: 'status',
    header: 'Status',
    render: (r) => <StatusBadge status={r.isExpired ? 'expired' : r.status} />,
    sortValue: (r) => r.status,
  },
  {
    key: 'validUntil',
    header: 'Valid Until',
    render: (r) => new Date(r.validUntil + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    sortValue: (r) => r.validUntil,
  },
];

function getColumns(type: TableViewType): Column<Record<string, unknown>>[] {
  switch (type) {
    case 'contacts':
      return contactColumns as Column<Record<string, unknown>>[];
    case 'invoices':
      return invoiceColumns as Column<Record<string, unknown>>[];
    case 'quotes':
      return quoteColumns as Column<Record<string, unknown>>[];
  }
}

const typeLabels: Record<TableViewType, string> = {
  contacts: 'Contacts',
  invoices: 'Invoices',
  quotes: 'Quotes',
};

// ── Sort icon ────────────────────────────────────────────────────────────────

function SortIndicator({ direction }: { direction: 'asc' | 'desc' | null }) {
  if (!direction) return null;
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`ml-1 inline-block transition-transform ${direction === 'desc' ? 'rotate-180' : ''}`}
      aria-hidden="true"
    >
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </svg>
  );
}

// ── Filter pills ─────────────────────────────────────────────────────────────

function FilterPills({ filters }: { filters: Record<string, unknown> }) {
  const entries = Object.entries(filters).filter(([, v]) => v != null && v !== false && v !== '');
  if (entries.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {entries.map(([key, value]) => (
        <span
          key={key}
          className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
        >
          {formatFilterLabel(key)}: {String(value)}
        </span>
      ))}
    </div>
  );
}

function formatFilterLabel(key: string) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

// ── Main component ───────────────────────────────────────────────────────────

export function ViewPage({ viewId }: { viewId: string }) {
  const router = useRouter();
  const { getView, removeView } = useViews();
  const view = getView(viewId);

  if (!view) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-neutral-500">View not found</p>
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="mt-2 text-sm font-medium text-neutral-700 underline underline-offset-2 dark:text-neutral-300"
          >
            Go to dashboard
          </button>
        </div>
      </div>
    );
  }

  return <ViewTable view={view} onDelete={() => { removeView(viewId); router.push('/dashboard'); }} />;
}

function ViewTable({ view, onDelete }: { view: TableView; onDelete: () => void }) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const columns = getColumns(view.type);
  const rawData = useMemo(() => fetchViewData(view.type, view.filters) as Record<string, unknown>[], [view.type, view.filters]);

  const rows = useMemo(() => {
    if (!sortKey) return rawData;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return rawData;
    const sorted = [...rawData].sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (typeof av === 'number' && typeof bv === 'number') return av - bv;
      return String(av).localeCompare(String(bv));
    });
    return sortDir === 'desc' ? sorted.reverse() : sorted;
  }, [rawData, sortKey, sortDir, columns]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="shrink-0 border-b border-neutral-200 px-6 py-5 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{view.name}</h1>
            <div className="mt-1 flex items-center gap-3">
              <span className="text-xs text-neutral-400">{typeLabels[view.type]}</span>
              <span className="text-xs text-neutral-400">{rows.length} {rows.length === 1 ? 'record' : 'records'}</span>
              <FilterPills filters={view.filters} />
            </div>
          </div>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
          >
            Remove view
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="min-h-0 flex-1 overflow-auto">
        {rows.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-neutral-400">No records match this view</p>
        ) : (
          <table className="w-full">
            <thead className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-900">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`cursor-pointer select-none px-6 py-3 text-[11px] font-medium uppercase tracking-wider text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-200 ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                    onClick={() => col.sortValue && handleSort(col.key)}
                  >
                    {col.header}
                    {col.sortValue && <SortIndicator direction={sortKey === col.key ? sortDir : null} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {rows.map((row, i) => (
                <tr key={i} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-6 py-3 text-sm text-neutral-700 dark:text-neutral-300 ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
