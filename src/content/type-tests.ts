/**
 * content/type-tests.ts — compile-time guards for the content layer's red
 * lines. Never imported at runtime: it exists so `tsc` keeps proving the
 * enforcement works. Every @ts-expect-error below MUST keep erroring — if
 * one stops being an error (the brand weakened, a field retyped), tsc fails
 * here with "Unused '@ts-expect-error' directive". verify:content's tsconfig
 * compiles this file too (so the probes are re-proven on every run), but the
 * script deliberately never executes the emitted JS.
 */
import type { Unverified } from "../lib/unverified";
import { deliveryStatement, factoryDelivery, type FactoryDelivery } from "../lib/delivery";
import { FACTORY_BUILD_TIME } from "./site";
import type { Model } from "./models";

// ── Red line 1: a factual value without unverified() must not compile ──

// @ts-expect-error — bare price band, missing the unverified() wrapper
const barePriceBand: Unverified<{ from: number; to: number }> = { from: 45000, to: 65000 };

const draftModel: Pick<Model, "priceBand"> = {
  // @ts-expect-error — a model's priceBand must be wrapped in unverified()
  priceBand: { from: 45000, to: 65000 },
};

// ── Red line 2: the delivery figure without its scope must not compile ──

// @ts-expect-error — a bare number is not a FactoryDelivery
const bareDays: FactoryDelivery = 30;

const draftDelivery: Pick<Model, "factoryBuildDays"> = {
  // @ts-expect-error — passing just 30 must be a type error
  factoryBuildDays: 30,
};

// @ts-expect-error — a partial scope (covers without customerSide) is not a DeliveryScope
factoryDelivery(30, (days) => ({ covers: `Factory build only, ${days} days.` }));

// ── The number cannot be pulled out of a FactoryDelivery directly ──

// @ts-expect-error — there is no .days property; only deliveryStatement() releases the figure, and only as self-scoping strings
const extracted: number = FACTORY_BUILD_TIME.days;

// ── Red line 3: the sanctioned accessor carries no bare number either ──
// The exact path a hurried page author takes first: destructure the figure
// out of deliveryStatement() and render it alone. It must not compile.

// @ts-expect-error — DeliveryStatement has no numeric field; every representation is a self-scoping string
const leakedDays: number = deliveryStatement(FACTORY_BUILD_TIME).days;

// @ts-expect-error — "const { days } = deliveryStatement(...)" must fail: no bare number escapes the front door
const { days } = deliveryStatement(FACTORY_BUILD_TIME);

void barePriceBand;
void draftModel;
void bareDays;
void draftDelivery;
void extracted;
void leakedDays;
void days;
