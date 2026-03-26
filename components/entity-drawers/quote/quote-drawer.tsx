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
import {
  calculateQuoteTotals,
  quoteFormSchema,
  type QuoteFormValues,
} from '@/lib/quotes/schema';
import {
  createQuote,
  getQuoteById,
  updateQuote,
} from '@/lib/quotes/store';
import type { Quote } from '@/lib/quotes/types';

function QuoteFields({ detail }: { detail?: Quote }) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<QuoteFormValues>();

  const items = useWatch({ control, name: 'items' }) ?? [];
  const totals = calculateQuoteTotals(items);

  return (
    <div className="space-y-5 px-4 py-4">
      {detail ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <DrawerSection contentClassName="space-y-1.5">
            <p className="text-xs font-medium text-neutral-400">Status</p>
            <div>
              <StatusBadge status={detail.status} />
            </div>
          </DrawerSection>
          <DrawerSection contentClassName="space-y-1.5">
            <p className="text-xs font-medium text-neutral-400">Total</p>
            <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {formatCurrency(detail.total)}
            </p>
          </DrawerSection>
          <DrawerSection contentClassName="space-y-1.5">
            <p className="text-xs font-medium text-neutral-400">Valid until</p>
            <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {formatDate(`${detail.validUntil}T00:00:00`)}
            </p>
          </DrawerSection>
        </div>
      ) : null}

      <DrawerSection title="Quote">
        <div className="space-y-1">
          {detail ? (
            <InlineField label="Number">
              <span className="px-2 py-1 text-sm text-neutral-900 dark:text-neutral-100">
                {detail.quoteNumber}
              </span>
            </InlineField>
          ) : null}
          <InlineField label="Customer" error={errors.contactName?.message}>
            <InlineInput {...register('contactName')} placeholder="Sarah Chen" />
          </InlineField>
          <InlineField label="Valid until" error={errors.validUntil?.message}>
            <InlineInput type="date" {...register('validUntil')} />
          </InlineField>
          <InlineField label="Status" error={errors.status?.message}>
            <InlineSelect {...register('status')}>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="viewed">Viewed</option>
              <option value="accepted">Accepted</option>
              <option value="expired">Expired</option>
            </InlineSelect>
          </InlineField>
          {detail?.createdAt ? (
            <InlineField label="Created">
              <span className="px-2 py-1 text-sm text-neutral-900 dark:text-neutral-100">
                {formatDate(detail.createdAt)}
              </span>
            </InlineField>
          ) : null}
          {detail?.sentDate ? (
            <InlineField label="Sent">
              <span className="px-2 py-1 text-sm text-neutral-900 dark:text-neutral-100">
                {formatDate(detail.sentDate)}
              </span>
            </InlineField>
          ) : null}
          {detail?.viewedDate ? (
            <InlineField label="Viewed">
              <span className="px-2 py-1 text-sm text-neutral-900 dark:text-neutral-100">
                {formatDate(detail.viewedDate)}
              </span>
            </InlineField>
          ) : null}
          {detail?.acceptedDate ? (
            <InlineField label="Accepted">
              <span className="px-2 py-1 text-sm text-neutral-900 dark:text-neutral-100">
                {formatDate(detail.acceptedDate)}
              </span>
            </InlineField>
          ) : null}
        </div>
      </DrawerSection>

      <LineItemList<QuoteFormValues> />

      <DrawerSection title="Summary">
        <div className="space-y-1">
          <InlineField label="Subtotal">
            <span className="px-2 py-1 text-sm text-neutral-900 dark:text-neutral-100">
              {formatCurrency(totals.subtotal)}
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
          placeholder="Context, terms, or follow-up notes for the quote."
        />
      </DrawerSection>
    </div>
  );
}

export const quoteDrawerDefinition: EntityDrawerDefinition<
  Quote,
  QuoteFormValues
> = {
  label: 'quote',
  load: getQuoteById,
  getTitle: (detail) => detail?.quoteNumber ?? 'New quote',
  getDefaultValues: (detail) => ({
    contactName: detail?.contactName ?? '',
    items:
      detail?.items.map((item) => ({
        description: item.description,
        amount: item.amount,
      })) ?? [{ description: '', amount: 0 }],
    validUntil: detail?.validUntil ?? new Date().toISOString().split('T')[0]!,
    status: detail?.status ?? 'draft',
    notes: detail?.notes ?? '',
  }),
  schema: quoteFormSchema,
  Fields: QuoteFields,
  save: async (values, context) => {
    if (context.recordId) {
      const updated = updateQuote(context.recordId, values);
      if (!updated) throw new Error('Quote not found');
      return { id: updated.id };
    }
    const created = createQuote(values);
    return { id: created.id };
  },
};
