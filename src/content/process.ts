/**
 * content/process.ts — the delivery process and the warranty.
 *
 * The whole argument for the positioning is parallelism: two tracks that run
 * at the same time. The factory track is urbanbricks' side — it carries the
 * confirmed 30-day figure (with its scope, inseparably). The site track is
 * the customer's side — groundwork, planning permission and connections. Per
 * spec §3, the customer-side steps carry no promised durations: they are not
 * urbanbricks' to promise, and they are never inside the 30 days.
 */
import { unverified, type Unverified } from "../lib/unverified";
import type { FactoryDelivery } from "../lib/delivery";
import { FACTORY_BUILD_TIME } from "./site";

export interface ProcessStep {
  /** Sequence within the track. Numbering is permitted here and only here — the order is real information (spec §6). */
  order: number;
  title: string;
  body: string;
  /** Present only on the factory-build step: the confirmed 30 days, with its scope. */
  delivery?: FactoryDelivery;
  /** Indicative durations that still need confirming — never a promise. */
  duration?: Unverified<string>;
}

export interface ProcessTrack {
  id: "factory" | "site";
  owner: "urbanbricks" | "customer";
  title: string;
  intro: string;
  steps: ProcessStep[];
}

export const processTracks: [ProcessTrack, ProcessTrack] = [
  {
    id: "factory",
    owner: "urbanbricks",
    title: "In our factory",
    intro: "What we do — while your site work happens.",
    steps: [
      {
        order: 1,
        title: "Design sign-off",
        body: "You approve the drawings and the specification for your model. From this point the design is fixed and the build can start.",
      },
      {
        order: 2,
        title: "Factory build",
        body: "The building is fabricated, fitted out and finished under one roof — frame, insulation, glazing, kitchen, bathroom, wiring and plumbing. Weather does not touch it, and nothing waits for a tradesman's van.",
        delivery: FACTORY_BUILD_TIME,
      },
      {
        order: 3,
        title: "Inspection",
        body: "Every building is checked against its specification before it leaves the factory. You get the inspection record with the keys.",
      },
      {
        order: 4,
        title: "Delivery and craning",
        body: "The finished building arrives by lorry and is craned onto your prepared foundations, then connected to the services waiting on site.",
        duration: unverified(
          "About one day on site for a single-module building",
          "Confirm typical install duration per model before launch."
        ),
      },
    ],
  },
  {
    id: "site",
    owner: "customer",
    title: "On your site",
    intro:
      "What happens on your side, at the same time. We provide the drawings and the schedule; you arrange the work. None of this is inside the 30 days.",
    steps: [
      {
        order: 1,
        title: "Site check",
        body: "Confirm a lorry and crane can reach the plot, and decide where water, power and drainage will connect.",
      },
      {
        order: 2,
        title: "Planning permission",
        body: "Apply for whatever permission your project needs. Rules differ by council and by country, so start this early — it is the step most likely to set your real timeline.",
      },
      {
        order: 3,
        title: "Groundwork",
        body: "Foundations are laid to the drawings we provide, ready for the building to land on.",
      },
      {
        order: 4,
        title: "Connections",
        body: "Once the building is placed, your contractors connect water, power and drainage.",
      },
    ],
  },
];

/**
 * Why the two tracks matter — the mechanism behind the speed claim, stated
 * plainly (PRODUCT.md: name the mechanism instead of asserting speed).
 */
export const parallelNote =
  "The two tracks run at the same time. While the factory builds, your site is prepared — so the 30 days the building takes are 30 days you spend moving your own project forward, not waiting for it. Conventional construction runs the same work one stage after another, which is why it is measured in years.";

export interface WarrantyTerm {
  id: string;
  label: string;
  period: Unverified<{ value: number; unit: "years" }>;
  /** What the term covers, in plain words — specific enough to hold us to (PRODUCT.md § Certainty over enthusiasm). */
  covers: string;
}

export const warranty = {
  intro:
    "Every building leaves the factory with its warranty in writing and a named contact for aftercare. The terms below are what we put our name to.",
  terms: [
    {
      id: "structure",
      label: "Structure",
      period: unverified({ value: 10, unit: "years" }, "Confirm structural warranty term."),
      covers: "The load-bearing frame and the welded module structure.",
    },
    {
      id: "weathertightness",
      label: "Weathertightness",
      period: unverified({ value: 5, unit: "years" }, "Confirm weathertightness warranty term."),
      covers: "Roof, cladding, seals and glazing against water getting in.",
    },
    {
      id: "fittings",
      label: "Fixtures and fittings",
      period: unverified({ value: 2, unit: "years" }, "Confirm fixtures warranty term."),
      covers: "Kitchen, bathroom fittings, doors, windows and interior finishes.",
    },
  ] satisfies WarrantyTerm[],
  aftercare: {
    responseWorkingDays: unverified(2, "Confirm the aftercare response-time commitment."),
    body: "Report a problem and your named contact responds within the stated number of working days. No ticket system, no call centre queue.",
  },
};
