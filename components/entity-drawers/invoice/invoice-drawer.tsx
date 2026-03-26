'use client';

import { useFormContext, useWatch } from 'react-hook-form';
import { StatusBadge } from '@/components/chat/tool-renderers/data-table';
import {
  InlineField,
  InlineInput,
  InlineSelect,
  InlineTextarea,
} from '@/components/entity-drawers/shared/inline-field';
import { LineItemList } from '@/components/entity-drawers/shared/line-item-list';
import { DrawerSection } from '@/components/entity-drawers/shared/section';
import type { EntityDrawerDefinition } from '@/components/entity-drawers/types';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Invoice } from '@/lib/invoices/mock-data';
import {
  calculateInvoiceTotals,
  getInvoiceTaxRate,
  invoiceFormSchema,
  type InvoiceFormValues,
} from '@/lib/invoices/schema';
import {
  createInvoice,
  getInvoiceById,
  updateInvoice,
} from '@/lib/invoices/store';

function getInvoiceBadge(invoice: Pick<Invoice, 'status' | 'dueDate'>) {
  const today = new Date().toISOString().split('T')[0]!;
  if (invoice.status !== 'paid' && invoice.dueDate < today) {
    const daysPastDue = Math.floor(
      (Date.now() - new Date(`${invoice.dueDate}T00:00:00`).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    return { status: 'overdue', suffix: `${daysPastDue}d` };
  }
  return { status: invoice.status, suffix: undefined as string | undefined };
}

function InvoiceFields({ detail }: { detail?: Invoice }) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<InvoiceFormValues>();

  const items = useWatch({ control, name: 'items' }) ?? [];
  const taxRate = useWatch({ control, name: 'taxRate' }) ?? 0;
  const totals = calculateInvoiceTotals(items, taxRate);

  return (
    <div className="space-y-5 px-4 py-4">
      {detail ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <DrawerSection contentClassName="space-y-1.5">
            <p className="text-xs font-medium text-neutral-400">Status</p>
            <div>
              <StatusBadge status={getInvoiceBadge(detail).status} suffix={getInvoiceBadge(detail).suffix} />
            </div>
          </DrawerSection>
          <DrawerSection contentClassName="space-y-1.5">
            <p className="text-xs font-medium text-neutral-400">Total</p>
            <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {formatCurrency(detail.total)}
            </p>
          </DrawerSection>
          <DrawerSection contentClassName="space-y-1.5">
            <p className="text-xs font-medium text-neutral-400">Due</p>
            <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {formatDate(`${detail.dueDate}T00:00:00`)}
            </p>
          </DrawerSection>
        </div>
      ) : null}

      <DrawerSection title="Invoice">
        <div className="space-y-1">
          {detail ? (
            <InlineField label="Number">
              <span className="px-2 py-1 text-sm text-neutral-900 dark:text-neutral-100">
                {detail.invoiceNumber}
              </span>
            </InlineField>
          ) : null}
          <InlineField label="Customer" error={errors.contactName?.message}>
            <InlineInput {...register('contactName')} placeholder="Sarah Chen" />
          </InlineField>
          <InlineField label="Due date" error={errors.dueDate?.message}>
            <InlineInput type="date" {...register('dueDate')} />
          </InlineField>
          <InlineField label="Status" error={errors.status?.message}>
            <InlineSelect {...register('status')}>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </InlineSelect>
          </InlineField>
          <InlineField label="Tax rate" error={errors.taxRate?.message}>
            <InlineInput
              type="number"
              step="0.01"
              min="0"
              max="100"
              {...register('taxRate', { valueAsNumber: true })}
              placeholder="0"
            />
          </InlineField>
          {detail?.createdAt ? (
            <InlineField label="Created">
              <span className="px-2 py-1 text-sm text-neutral-900 dark:text-neutral-100">
                {formatDate(detail.createdAt)}
              </span>
            </InlineField>
          ) : null}
          {detail?.paidAt ? (
            <InlineField label="Paid">
              <span className="px-2 py-1 text-sm text-neutral-900 dark:text-neutral-100">
                {formatDate(detail.paidAt)}
              </span>
            </InlineField>
          ) : null}
        </div>
      </DrawerSection>

      <LineItemList<InvoiceFormValues> />

      <DrawerSection title="Summary">
        <div className="space-y-1">
          <InlineField label="Subtotal">
            <span className="px-2 py-1 text-sm text-neutral-900 dark:text-neutral-100">
              {formatCurrency(totals.subtotal)}
            </span>
          </InlineField>
          <InlineField label="Tax">
            <span className="px-2 py-1 text-sm text-neutral-900 dark:text-neutral-100">
              {formatCurrency(totals.tax)}
            </span>
          </InlineField>
          <InlineField label="Total">
            <span className="px-2 py-1 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {formatCurrency(totals.total)}
            </span>
          </InlineField>
        </div>
      </DrawerSection>

      <DrawerSection title="Notes">
        <InlineTextarea
          {...register('notes')}
          placeholder="Anything the customer should see on the invoice."
        />
      </DrawerSection>
    </div>
  );
}

export const invoiceDrawerDefinition: EntityDrawerDefinition<
  Invoice,
  InvoiceFormValues
> = {
  label: 'invoice',
  load: getInvoiceById,
  getTitle: (detail) => detail?.invoiceNumber ?? 'New invoice',
  getDefaultValues: (detail) => ({
    contactName: detail?.contactName ?? '',
    items:
      detail?.items.map((item) => ({
        description: item.description,
        amount: item.amount,
      })) ?? [{ description: '', amount: 0 }],
    taxRate: detail ? getInvoiceTaxRate(detail.subtotal, detail.tax) : 0,
    dueDate: detail?.dueDate ?? new Date().toISOString().split('T')[0]!,
    status: detail?.status ?? 'draft',
    notes: detail?.notes ?? '',
  }),
  schema: invoiceFormSchema,
  Fields: InvoiceFields,
  save: async (values, context) => {
    if (context.recordId) {
      const updated = updateInvoice(context.recordId, values);
      if (!updated) throw new Error('Invoice not found');
      return { id: updated.id };
    }
    const created = createInvoice(values);
    return { id: created.id };
  },
};
