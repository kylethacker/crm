import { formatCurrency } from '@/lib/format';
import { DataTable, StatusBadge, type ColumnDef } from './data-table';

type QuoteRow = {
  quoteNumber: string;
  contactName: string;
  total: number;
  status: string;
  validUntil: string;
  isExpired: boolean;
};

const columns: ColumnDef<QuoteRow>[] = [
  { key: 'quote', header: 'Quote', render: (r) => r.quoteNumber },
  { key: 'contact', header: 'Contact', render: (r) => r.contactName },
  {
    key: 'total',
    header: 'Total',
    align: 'right',
    render: (r) => formatCurrency(r.total),
  },
  {
    key: 'status',
    header: 'Status',
    render: (r) => (
      <StatusBadge status={r.isExpired ? 'expired' : r.status} />
    ),
  },
  {
    key: 'validUntil',
    header: 'Valid Until',
    render: (r) =>
      new Date(r.validUntil + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
  },
];

export function GetQuotesResult({ data }: { data: QuoteRow[] }) {
  const rows = Array.isArray(data) ? data : [];
  return <DataTable columns={columns} rows={rows} emptyMessage="No quotes found" />;
}
