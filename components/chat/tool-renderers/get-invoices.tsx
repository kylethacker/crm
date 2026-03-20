import { formatCurrency } from '@/lib/format';
import { DataTable, StatusBadge, type ColumnDef } from './data-table';

type InvoiceRow = {
  invoiceNumber: string;
  contactName: string;
  total: number;
  status: string;
  dueDate: string;
  daysPastDue: number;
};

const columns: ColumnDef<InvoiceRow>[] = [
  { key: 'invoice', header: 'Invoice', render: (r) => r.invoiceNumber },
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
      <StatusBadge
        status={r.daysPastDue > 0 ? 'overdue' : r.status}
        suffix={r.daysPastDue > 0 ? `${r.daysPastDue}d` : undefined}
      />
    ),
  },
  {
    key: 'due',
    header: 'Due',
    render: (r) =>
      new Date(r.dueDate + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
  },
];

export function GetInvoicesResult({ data }: { data: InvoiceRow[] }) {
  const rows = Array.isArray(data) ? data : [];
  return <DataTable columns={columns} rows={rows} emptyMessage="No invoices found" />;
}
