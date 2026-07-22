/**
 * FactoryDelivery — the 30-day claim, structurally bound to its scope.
 *
 * PRODUCT.md § Positioning: a headline that states a duration without stating
 * what it covers is prohibited. "Open in 30 days" is a promise urbanbricks
 * cannot keep; "built in 30 days, while your groundwork happens" is both true
 * and a stronger argument. This module makes the prohibited form
 * unrepresentable:
 *
 *   - The delivery figure only ever exists inside a `FactoryDelivery`, which
 *     also carries a `DeliveryScope` — what the days cover and what stays on
 *     the customer's side. `factoryBuildDays: 30` is a type error.
 *   - The number itself is stored behind a module-private symbol. There is no
 *     `.days` property to read: the only way to get the figure out is
 *     deliveryStatement(), which returns the number bundled with its scope
 *     text. A component cannot render the number alone and still compile,
 *     because it can never hold the number without holding the scope.
 */

declare const deliveryBrand: unique symbol;

/** Module-private runtime key for the figure — never exported, so the number is unreadable from outside this file. */
const daysKey: unique symbol = Symbol("urbanbricks.factoryBuildDays");

export interface DeliveryScope {
  /** One plain sentence: what the figure covers. */
  readonly covers: string;
  /** One plain sentence: what stays on the customer's side — groundwork, planning permission, connections. */
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

export function factoryDelivery(days: number, scope: DeliveryScope): FactoryDelivery {
  if (!Number.isInteger(days) || days <= 0) {
    throw new Error(`factoryDelivery: days must be a positive integer, got ${days}`);
  }
  if (!scope.covers?.trim() || !scope.customerSide?.trim()) {
    throw new Error(
      "factoryDelivery: scope.covers and scope.customerSide are both required — a duration without its coverage is prohibited (PRODUCT.md § Positioning)."
    );
  }
  return Object.freeze({
    [daysKey]: days,
    scope: Object.freeze({ ...scope }),
  }) as FactoryDeliveryInternal;
}

/**
 * What a component receives. The number only exists here, permanently bundled
 * with the sentences that qualify it.
 */
export interface DeliveryStatement {
  /** The figure, in days. */
  readonly days: number;
  /** Short rendering, e.g. "Built in 30 days". */
  readonly headline: string;
  /** What the days cover. */
  readonly covers: string;
  /** What the days do not cover — the customer's side of the schedule. */
  readonly customerSide: string;
}

export function deliveryStatement(delivery: FactoryDelivery): DeliveryStatement {
  const days = (delivery as FactoryDeliveryInternal)[daysKey];
  return Object.freeze({
    days,
    headline: `Built in ${days} days`,
    covers: delivery.scope.covers,
    customerSide: delivery.scope.customerSide,
  });
}
