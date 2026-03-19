import { formatCurrency } from '@/lib/format';

type InvoiceItem = {
  description: string;
  amount: number;
};

type InvoiceOutput = {
  id: string;
  invoiceNumber: string;
  contactName: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  taxRate: number;
  status: string;
  createdAt: string;
  dueDate: string;
  notes?: string;
};


export function CreateInvoiceResult({ data }: { data: InvoiceOutput }) {
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <span className="text-sm">🧾</span>
          <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {data.invoiceNumber}
          </span>
        </div>
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
          Draft
        </span>
      </div>

      <div className="px-4 py-3">
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          To: <span className="font-medium text-neutral-700 dark:text-neutral-300">{data.contactName}</span>
        </p>
        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
          Due: {new Date(data.dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>

        <div className="mt-3 space-y-1.5">
          {data.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-neutral-700 dark:text-neutral-300">{item.description}</span>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">{formatCurrency(item.amount)}</span>
            </div>
          ))}
        </div>

        <div className="mt-3 border-t border-neutral-100 pt-2 dark:border-neutral-800">
          {data.tax > 0 && (
            <>
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>Subtotal</span>
                <span>{formatCurrency(data.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>Tax ({data.taxRate}%)</span>
                <span>{formatCurrency(data.tax)}</span>
              </div>
            </>
          )}
          <div className="flex items-center justify-between text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            <span>Total</span>
            <span>{formatCurrency(data.total)}</span>
          </div>
        </div>

        {data.notes && (
          <p className="mt-2 text-xs text-neutral-400 italic">{data.notes}</p>
        )}
      </div>
    </div>
  );
}
