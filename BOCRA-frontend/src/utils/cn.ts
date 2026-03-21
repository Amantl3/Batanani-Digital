import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Safely merge Tailwind utility classes.
 * Resolves conflicts (e.g. px-4 + px-6 → px-6) via tailwind-merge,
 * and handles conditional/array values via clsx.
 *
 * @example
 * cn('rounded px-4', isActive && 'bg-blue-600', 'px-6')
 * // → 'rounded bg-blue-600 px-6'
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
