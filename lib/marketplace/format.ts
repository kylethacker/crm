import type { AutonomyLevel } from './types';
import { formatCurrency } from '@/lib/format';

export const autonomyLabel: Record<AutonomyLevel, string> = {
  suggest: 'Suggest only',
  'draft-approve': 'Drafts for approval',
  auto: 'Fully automatic',
};

export const autonomyDescription: Record<AutonomyLevel, string> = {
  suggest: 'Suggests actions for you to take manually',
  'draft-approve': 'Drafts messages and actions, then waits for your OK',
  auto: 'Handles everything — you review results, not drafts',
};

export const autonomyColor: Record<AutonomyLevel, string> = {
  suggest: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'draft-approve': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  auto: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

const outcomeFormat: Record<string, 'currency' | 'rating'> = {
  'revenue recovered': 'currency',
  'avg rating': 'rating',
};

export function formatOutcomeValue(key: string, value: number): string {
  const fmt = outcomeFormat[key];
  if (fmt === 'currency') return formatCurrency(value);
  if (fmt === 'rating') return `${value} avg`;
  return value.toLocaleString();
}
