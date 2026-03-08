import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS class names safely.
 * - `clsx` handles conditionals, arrays, and objects.
 * - `twMerge` resolves conflicting Tailwind classes (last one wins).
 *
 * @example
 * cn('px-4 py-2', isActive && 'bg-blue-500', 'px-6')
 * // → 'py-2 bg-blue-500 px-6'  (px-4 is overridden by px-6)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
