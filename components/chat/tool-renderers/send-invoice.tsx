type SendInvoiceOutput = {
  invoiceId: string;
  invoiceNumber: string;
  contactName: string;
  total: number;
  status: string;
  sentAt: string;
};

export function SendInvoiceResult({ data }: { data: SendInvoiceOutput }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
        <span className="text-sm">✓</span>
      </div>
      <div>
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {data.invoiceNumber} sent to {data.contactName}
        </p>
        <p className="text-xs text-neutral-500">
          ${data.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
}
