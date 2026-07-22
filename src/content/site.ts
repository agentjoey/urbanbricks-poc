/**
 * content/site.ts — company-level facts and copy.
 *
 * Truthfulness tiers (spec §3):
 *   - Brand voice copy (tagline, selling-point prose) is expression, not fact —
 *     written directly, never wrapped.
 *   - Factual values the company must stand behind (contact details, currency,
 *     units) are wrapped in unverified() until a human confirms them.
 *     `pnpm verify:content` lists every outstanding one.
 *   - Proof (testimonials, case studies, certifications, delivery counts) is
 *     NEVER invented. The slots below stay empty until real material exists.
 *
 * Currency and units live here and nowhere else: data files store bare
 * numbers, so changing the currency is a one-line edit, not a migration.
 */
import { unverified } from "../lib/unverified";
import { factoryDelivery, type FactoryDelivery } from "../lib/delivery";

/**
 * CONFIRMED (Human Owner, 2026-07-21): the factory build takes 30 days.
 *
 * Factory build time only. Groundwork, planning permission and connections
 * are the customer's side of the schedule and are NOT included. The scope is
 * part of the value — see src/lib/delivery.ts for why the number can never
 * be rendered without it.
 */
export const FACTORY_BUILD_TIME: FactoryDelivery = factoryDelivery(30, {
  covers:
    "The 30 days covers the factory build: fabrication, fit-out and inspection of the building itself.",
  customerSide:
    "Groundwork, planning permission and utility connections are arranged by the customer, run alongside the factory build, and are not included in the 30 days.",
});

export interface CurrencyConfig {
  /** ISO 4217 code. */
  code: string;
  symbol: string;
  /** BCP 47 locale used to format prices. */
  locale: string;
}

export interface UnitsConfig {
  /** Unit for every floorArea value in models.ts. */
  floorArea: "sqm" | "sqft";
}

export interface SellingPoint {
  id: "speed" | "value" | "aftercare";
  title: string;
  body: string;
  /** Only the speed point carries the delivery figure — always with its scope. */
  delivery?: FactoryDelivery;
}

/** Proof slots — spec §3 "do not generate" tier. Filling these with invented material is prohibited (PRODUCT.md § Design Principles). */
export interface Testimonial {
  quote: string;
  author: string;
  projectType: "residential" | "commercial";
}
export interface CaseStudy {
  slug: string;
  title: string;
  summary: string;
}
export interface Certification {
  name: string;
  issuedBy: string;
}

export const site = {
  name: "urbanbricks",
  domain: "urbanbricks.uk",
  /** The positioning line — PRODUCT.md § Positioning, verbatim. */
  tagline: "Your building takes 30 days — and it is being built while your site is.",
  description:
    "Modular buildings for homes and businesses. Built in the factory in 30 days, while your site is prepared.",

  contact: {
    email: unverified(
      "hello@urbanbricks.uk",
      "Confirm the monitored sales inbox; the quote form's failure fallback points here."
    ),
    phone: unverified(
      "+44 20 7946 0000",
      "Placeholder (Ofcom fiction range). Confirm the real line — PRODUCT.md promises someone answers the phone after handover."
    ),
  },

  /** Single source for currency — spec §5. Prices in models.ts are bare numbers in this currency. */
  currency: unverified(
    { code: "GBP", symbol: "£", locale: "en-GB" } satisfies CurrencyConfig,
    "Final currency pending Human Owner decision (spec §5, global English market on a .uk domain)."
  ),

  /** Single source for measurement units. Floor areas in models.ts are in this unit. */
  units: unverified(
    { floorArea: "sqm" } satisfies UnitsConfig,
    "Final units pending Human Owner decision alongside currency."
  ),

  /** The three selling points (spec §1): fast delivery, value, aftercare. */
  sellingPoints: [
    {
      id: "speed",
      title: "Built in 30 days, while your site is prepared",
      body: "Your building is manufactured in our factory at the same time as your groundwork happens on site. Conventional construction does these one after another, which is why it is measured in years. Running them side by side is what makes 30 days possible — the building stops being the thing you wait for.",
      delivery: FACTORY_BUILD_TIME,
    },
    {
      id: "value",
      title: "A number before you commit",
      body: "Every model lists its price band before you talk to anyone. Factory building removes the weather delays and open-ended site labour that push conventional builds over budget.",
    },
    {
      id: "aftercare",
      title: "Someone answers afterwards",
      body: "Every building leaves the factory with its warranty in writing and a named contact for aftercare. If something is wrong, you know who to call and what is covered.",
    },
  ] satisfies SellingPoint[],

  /**
   * Proof on hand: none (PRODUCT.md § Conversion & proof). These slots are
   * deliberately empty. Do not fill them with invented testimonials, case
   * studies, certification badges or delivery counts — that is the one
   * content tier that is prohibited outright, not deferred.
   */
  proof: {
    testimonials: [] as Testimonial[],
    caseStudies: [] as CaseStudy[],
    certifications: [] as Certification[],
    deliveredBuildings: null as number | null,
  },
};
