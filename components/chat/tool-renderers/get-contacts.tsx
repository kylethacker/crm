import { formatCurrency } from '@/lib/format';
import { DataTable, StatusBadge, type ColumnDef } from './data-table';

type ContactRow = {
  name: string;
  status: string;
  daysSinceContact: number | null;
  totalRevenue: number;
  upcomingBookingCount: number;
};

const columns: ColumnDef<ContactRow>[] = [
  { key: 'name', header: 'Name', render: (r) => r.name },
  {
    key: 'status',
    header: 'Status',
    render: (r) => <StatusBadge status={r.status} />,
  },
  {
    key: 'lastContact',
    header: 'Last Contact',
    render: (r) => (r.daysSinceContact != null ? `${r.daysSinceContact}d ago` : '—'),
  },
  {
    key: 'revenue',
    header: 'Revenue',
    align: 'right',
    render: (r) => formatCurrency(r.totalRevenue),
  },
  {
    key: 'bookings',
    header: 'Bookings',
    render: (r) => r.upcomingBookingCount,
  },
];

export function GetContactsResult({ data }: { data: ContactRow[] }) {
  const rows = Array.isArray(data) ? data : [];
  return <DataTable columns={columns} rows={rows} emptyMessage="No contacts found" />;
}
