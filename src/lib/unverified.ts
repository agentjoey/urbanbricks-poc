/**
 * unverified() — the content truthfulness mechanism (spec §3).
 *
 * Every factual value on the site that has not been confirmed by a human —
 * prices, dimensions, material specs, contact details, currency — must be
 * wrapped in unverified() at the point where it is written. Fields that hold
 * such values are typed `Unverified<T>`, so a raw value fails type-checking:
 *
 *   priceBand: unverified({ from: 45000, to: 65000 }),  // compiles
 *   priceBand: { from: 45000, to: 65000 },              // compile error
 *
 * Brand/marketing copy is expression, not fact, and is never wrapped.
 *
 * Two consumers depend on the runtime shape:
 *   - `pnpm verify:content` walks the content modules, finds every value
 *     carrying the `__unverified` marker and prints the pre-launch checklist.
 *   - Components (e.g. C2-spec-table) render a visible badge next to
 *     unverified values in development, detected via isUnverified().
 */

declare const unverifiedBrand: unique symbol;

export interface Unverified<T> {
  /**
   * Nominal brand. The symbol is module-private, so no code outside this
   * file can construct an Unverified<T> except through unverified().
   * The property only exists at the type level; it is not emitted.
   */
  readonly [unverifiedBrand]: T;
  /** Runtime marker read by verify:content and isUnverified(). Do not branch on this in app code — use isUnverified(). */
  readonly __unverified: true;
  /** The plausible-but-unconfirmed value. */
  readonly value: T;
  /** What a human must do to confirm it, or null. Surfaced by verify:content. */
  readonly note: string | null;
}

export function unverified<T>(value: T, note?: string): Unverified<T> {
  return Object.freeze({
    __unverified: true,
    value,
    note: note ?? null,
  }) as Unverified<T>;
}

export function isUnverified(value: unknown): value is Unverified<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { __unverified?: unknown }).__unverified === true
  );
}

/**
 * Label for the development-only badge components render next to unverified
 * values. Exported so every surface marks them the same way.
 */
export const UNVERIFIED_BADGE_LABEL = "Unverified" as const;
