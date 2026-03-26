'use client';

import { useFormContext } from 'react-hook-form';
import { StatusBadge } from '@/components/chat/tool-renderers/data-table';
import {
  InlineField,
  InlineInput,
  InlineSelect,
  InlineTextarea,
} from '@/components/entity-drawers/shared/inline-field';
import { DrawerSection } from '@/components/entity-drawers/shared/section';
import type { EntityDrawerDefinition } from '@/components/entity-drawers/types';
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/format';
import {
  contactFormSchema,
  type ContactFormValues,
} from '@/lib/contacts/schema';
import {
  createContact,
  getContactConversation,
  updateContact,
} from '@/lib/contacts/store';
import type { Conversation } from '@/lib/messages/types';

function ContactFields({ detail }: { detail?: Conversation }) {
  const {
    register,
    formState: { errors },
  } = useFormContext<ContactFormValues>();

  const completedRevenue = detail?.bookings
    .filter((b) => b.status === 'completed' && b.amount)
    .reduce((sum, b) => sum + (b.amount ?? 0), 0);
  const upcomingBookings = detail?.bookings.filter(
    (b) => b.status === 'upcoming',
  ).length;

  return (
    <div className="space-y-5 px-4 py-4">
      {detail ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <DrawerSection contentClassName="space-y-1.5">
            <p className="text-xs font-medium text-neutral-400">Status</p>
            <div>
              <StatusBadge status={detail.contact.status} />
            </div>
          </DrawerSection>
          <DrawerSection contentClassName="space-y-1.5">
            <p className="text-xs font-medium text-neutral-400">Upcoming</p>
            <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {upcomingBookings}
            </p>
          </DrawerSection>
          <DrawerSection contentClassName="space-y-1.5">
            <p className="text-xs font-medium text-neutral-400">Revenue</p>
            <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {formatCurrency(completedRevenue ?? 0)}
            </p>
          </DrawerSection>
        </div>
      ) : null}

      <DrawerSection title="Contact">
        <div className="space-y-1">
          <InlineField label="Name" error={errors.name?.message}>
            <InlineInput {...register('name')} placeholder="Sarah Chen" />
          </InlineField>
          <InlineField label="Phone" error={errors.phone?.message}>
            <InlineInput {...register('phone')} placeholder="+1 (555) 123-4567" />
          </InlineField>
          <InlineField label="Email" error={errors.email?.message}>
            <InlineInput type="email" {...register('email')} placeholder="name@company.com" />
          </InlineField>
          <InlineField label="Status" error={errors.status?.message}>
            <InlineSelect {...register('status')}>
              <option value="lead">Lead</option>
              <option value="prospect">Prospect</option>
              <option value="customer">Customer</option>
            </InlineSelect>
          </InlineField>
          <InlineField label="Company">
            <InlineInput {...register('company')} placeholder="Acme Corp" />
          </InlineField>
          {detail?.contact.createdAt ? (
            <InlineField label="Created">
              <span className="px-2 py-1 text-sm text-neutral-900 dark:text-neutral-100">
                {formatDate(detail.contact.createdAt)}
              </span>
            </InlineField>
          ) : null}
          {detail?.contact.lastContacted ? (
            <InlineField label="Last touched">
              <span className="px-2 py-1 text-sm text-neutral-900 dark:text-neutral-100">
                {formatDate(detail.contact.lastContacted)}
              </span>
            </InlineField>
          ) : null}
        </div>
      </DrawerSection>

      <DrawerSection title="Context">
        <div className="space-y-1">
          <InlineField label="Tags">
            <InlineInput
              {...register('tags')}
              placeholder="enterprise, renewal-q2, vip"
            />
          </InlineField>
          <InlineField label="Notes">
            <InlineTextarea
              {...register('notes')}
              placeholder="Context the team should see."
            />
          </InlineField>
        </div>
      </DrawerSection>

      {detail && detail.activity.length > 0 ? (
        <DrawerSection title="Recent activity">
          <div className="space-y-3">
            {detail.activity.slice(0, 5).map((a) => (
              <div key={a.id} className="space-y-1">
                <p className="text-sm text-neutral-900 dark:text-neutral-100">
                  {a.description}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {formatRelativeTime(a.timestamp)}
                </p>
              </div>
            ))}
          </div>
        </DrawerSection>
      ) : null}
    </div>
  );
}

export const contactDrawerDefinition: EntityDrawerDefinition<
  Conversation,
  ContactFormValues
> = {
  label: 'contact',
  load: getContactConversation,
  getTitle: (detail) => detail?.contact.name ?? 'New contact',
  getDefaultValues: (detail) => ({
    name: detail?.contact.name ?? '',
    phone: detail?.contact.phone ?? '',
    email: detail?.contact.email ?? '',
    company: detail?.contact.company ?? '',
    status: detail?.contact.status ?? 'lead',
    tags: detail?.contact.tags?.join(', ') ?? '',
    notes: detail?.contact.notes ?? '',
  }),
  schema: contactFormSchema,
  Fields: ContactFields,
  save: async (values, context) => {
    if (context.recordId) {
      const updated = updateContact(context.recordId, values);
      if (!updated) throw new Error('Contact not found');
      return { id: updated.contact.id };
    }
    const created = createContact(values);
    return { id: created.contact.id };
  },
};
