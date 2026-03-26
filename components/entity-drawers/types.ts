import type { ComponentType } from 'react';
import type { FieldValues } from 'react-hook-form';
import type { ZodType } from 'zod';
import type { TableViewType } from '@/lib/views/types';

export type EntityDrawerState = {
  entityType: TableViewType;
  recordId?: string | null;
};

export type EntityDrawerDefinition<TDetail, TValues extends FieldValues> = {
  label: string;
  load: (id: string) => TDetail | undefined;
  getTitle: (detail?: TDetail) => string;
  getDefaultValues: (detail?: TDetail) => TValues;
  schema: ZodType<TValues>;
  Fields: ComponentType<{ detail?: TDetail }>;
  save: (
    values: TValues,
    context: { recordId?: string | null },
  ) => Promise<{ id: string }> | { id: string };
};
