/**
 * Utility functions for the design system
 * Simple cn (className) merger. Accepts mixed values safely.
 */

export function cn(...inputs: unknown[]) {
  return inputs
    .flat()
    .filter((x): x is string => typeof x === 'string' && x.length > 0)
    .join(' ')
}
