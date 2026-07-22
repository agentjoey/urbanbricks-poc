/**
 * FactoryDelivery — the 30-day claim, structurally bound to its scope.
 *
 * PRODUCT.md § Positioning: a headline that states a duration without stating
 * what it covers is prohibited. "Open in 30 days" is a promise urbanbricks
 * cannot keep; "built in 30 days, while your groundwork happens" is both true
 * and a stronger argument. This module is designed so the easy path produces
 * compliant copy:
 *
 *   - The delivery figure only ever exists inside a `FactoryDelivery`, which
 *     also carries a `DeliveryScope` — what the days cover and what stays on
 *     the customer's side. `factoryBuildDays: 30` is a type error.
 *   - The number is stored behind a module-private symbol and is NEVER
 *     released as a number. The only accessor, deliveryStatement(), returns
 *     strings, and every string it returns is self-scoping: each names what
 *     the days cover, so any one of them pasted alone into a hero still
 *     cannot become "open in 30 days".
 *   - The scope sentences are written as a function of the figure, so the
 *     number inside the prose is derived, not re-typed — change the figure
 *     once and every rendering follows. factoryDelivery() throws at runtime
 *     if a scope sentence does not state the figure.
 *
 * The honest limit: no type system can stop someone hand-writing "Open in
 * 30 days" in a page file. What this module guarantees is that the bare
 * number does not exist anywhere on the public surface to be picked up,
 * and that every string the sanctioned path produces is safe to render on
 * its own.
 */

declare const deliveryBrand: unique symbol;

/** Module-private runtime key for the figure — never exported, so the number never leaves this file as a number. */
const daysKey: unique symbol = Symbol("urbanbricks.factoryBuildDays");

export interface DeliveryScope {
  /** One plain sentence stating the figure and what it covers. */
  readonly covers: string;
  /** One plain sentence stating the figure and what stays on the customer's side — groundwork, planning permission, connections. */
  readonly customerSide: string;
}

export interface FactoryDelivery {
  /** Nominal brand — module-private symbol, so FactoryDelivery can only be constructed via factoryDelivery(). */
  readonly [deliveryBrand]: true;
  /** What the duration covers, and what it does not. Always present, always rendered alongside the figure. */
  readonly scope: DeliveryScope;
}

/** Runtime shape including the hidden figure; only this module ever names it. */
interface FactoryDeliveryInternal extends FactoryDelivery {
  readonly [daysKey]: number;
}

/**
 * @param days the confirmed figure, e.g. 30.
 * @param scope the scope sentences as a function of the figure — interpolate
 * the argument, never re-type the number, so the prose cannot drift from it.
 */
export function factoryDelivery(days: number, scope: (days: number) => DeliveryScope): FactoryDelivery {
  if (!Number.isInteger(days) || days <= 0) {
    throw new Error(`factoryDelivery: days must be a positive integer, got ${days}`);
  }
  const resolved = scope(days);
  if (!resolved.covers?.trim() || !resolved.customerSide?.trim()) {
    throw new Error(
      "factoryDelivery: scope.covers and scope.customerSide are both required — a duration without its coverage is prohibited (PRODUCT.md § Positioning)."
    );
  }
  const figure = `${days} days`;
  if (!resolved.covers.includes(figure) || !resolved.customerSide.includes(figure)) {
    throw new Error(
      `factoryDelivery: both scope sentences must state the figure ("${figure}") — interpolate the days argument rather than re-typing or omitting it.`
    );
  }
  return Object.freeze({
    [daysKey]: days,
    scope: Object.freeze({ ...resolved }),
  }) as FactoryDeliveryInternal;
}

/**
 * What a component receives. There is no number here: every field is a
 * self-scoping string that names what the days cover, so any one of them
 * rendered on its own — a hero, a heading, a spec-table cell — stays within
 * the claim the company can keep.
 */
export interface DeliveryStatement {
  /**
   * Compact self-scoping form, e.g. "30 days (factory build)". Sized for
   * tight slots such as the C2 spec table's right-hand column (DESIGN.md:
   * Deep Brass, Title weight), where a full sentence would be wrong — but
   * still never a bare "30 days".
   */
  readonly short: string;
  /** Sentence form for heroes and headings, e.g. "Built in 30 days in our factory". */
  readonly headline: string;
  /** What the days cover — restates the figure. */
  readonly covers: string;
  /** What the days do not cover — the customer's side of the schedule. Restates the figure. */
  readonly customerSide: string;
}

export function deliveryStatement(delivery: FactoryDelivery): DeliveryStatement {
  const days = (delivery as FactoryDeliveryInternal)[daysKey];
  return Object.freeze({
    short: `${days} days (factory build)`,
    headline: `Built in ${days} days in our factory`,
    covers: delivery.scope.covers,
    customerSide: delivery.scope.customerSide,
  });
}
