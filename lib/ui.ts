/** Shared Tailwind class for text/email/textarea inputs used across forms. */
export const inputClass =
  "w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"

/** Picks an item from a list by index, wrapping around when the index overflows. */
export function cycle<T>(items: readonly T[], index: number): T {
  return items[index % items.length]
}
