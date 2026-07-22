/**
 * content/models.ts — the seven-model library.
 *
 * Model line-up matches docs/render-prompts.md exactly, so data and imagery
 * stay in step: four residential (The Harbor 20, The Harbor 40, The Meridian,
 * The Meridian Stack), three commercial (The Counter, The Workroom,
 * The Basecamp). Display names carry the article, matching
 * docs/render-prompts.md.
 *
 * Every numeric spec, price and material claim is a plausible placeholder
 * wrapped in unverified() — the product line is not yet final, and
 * `pnpm verify:content` must list every one before launch. Prices are bare
 * numbers in site.currency; floor areas are bare numbers in
 * site.units.floorArea. Descriptive copy (summaries, features, layouts) is
 * expression, not fact, and is unwrapped.
 */
import { unverified, type Unverified } from "../lib/unverified";
import type { FactoryDelivery } from "../lib/delivery";
import { FACTORY_BUILD_TIME } from "./site";

export type ModelCategory = "20ft" | "40ft" | "multi-unit";
export type UseCase = "residential" | "commercial";

export interface PriceBand {
  /** In site.currency. */
  from: number;
  to: number;
}

export interface ModelImageSlot {
  /** Path under /public. Placeholder renders until Human Owner generates final art (docs/render-prompts.md). */
  src: string;
  alt: string;
  /** 5:2 hero, 3:2 grid card, 4:3 interior — per render-prompts.md and the Module Grid. */
  aspect: "5:2" | "3:2" | "4:3";
  /**
   * Every product image is an AI visualisation. The caption
   * "Visualisation — not a photograph of a delivered building" is mandatory
   * and is rendered non-removably by the C3 image component — it is not an
   * optional flag here, so it cannot be dropped at the call site.
   */
}

export interface ModelSpecs {
  modules: Unverified<number>;
  /** In site.units.floorArea. */
  floorArea: Unverified<number>;
  /** Residential only. */
  bedrooms?: Unverified<number>;
  bathrooms?: Unverified<number>;
  /** Commercial occupancy, e.g. "6–8 desks". */
  capacity?: Unverified<string>;
  cladding: Unverified<string>;
}

export interface Model {
  slug: string;
  name: string;
  category: ModelCategory;
  useCase: UseCase;
  /** One or two plain sentences for cards and the detail hero. */
  summary: string;
  /** Descriptive layout label, e.g. "Studio", "Two bedrooms". */
  layout: string;
  specs: ModelSpecs;
  priceBand: Unverified<PriceBand>;
  /**
   * CONFIRMED 30-day factory build — always with its scope. Every model
   * shares the same confirmed figure; the type (FactoryDelivery) holds no
   * readable number at all, so the only renderings available are the
   * self-scoping strings from deliveryStatement().
   */
  factoryBuildDays: FactoryDelivery;
  features: string[];
  images: {
    hero: ModelImageSlot;
    card: ModelImageSlot;
    gallery: ModelImageSlot[];
  };
}

const SPEC_NOTE = "Plausible placeholder — confirm against engineering drawings before launch.";
const PRICE_NOTE = "Indicative band — confirm real pricing before launch (spec §10).";
const CLADDING_NOTE = "Material per render-prompts.md art direction — confirm the real specification.";

/** Shared residential interior visualisation (render-prompts.md §5). */
const RESIDENTIAL_INTERIOR: ModelImageSlot = {
  src: "/images/models/residential-interior.png",
  alt: "Visualisation of an open-plan modular home interior with pale oak floor, muted sage kitchen units and a full-height window.",
  aspect: "4:3",
};

export const models: Model[] = [
  {
    slug: "harbor-20",
    name: "The Harbor 20",
    category: "20ft",
    useCase: "residential",
    summary:
      "One module, one calm room. A studio home, a garden annex, or a first foothold on your own plot.",
    layout: "Studio",
    specs: {
      modules: unverified(1, SPEC_NOTE),
      floorArea: unverified(14, SPEC_NOTE),
      bathrooms: unverified(1, SPEC_NOTE),
      cladding: unverified("Dark charcoal composite panels", CLADDING_NOTE),
    },
    priceBand: unverified({ from: 34000, to: 46000 }, PRICE_NOTE),
    factoryBuildDays: FACTORY_BUILD_TIME,
    features: [
      "Full-height glazing along the long wall",
      "Timber-lined entrance recess",
      "Open studio layout with a separate bathroom",
      "Sits on a low concrete plinth",
    ],
    images: {
      hero: {
        src: "/images/models/harbor-20-hero.png",
        alt: "Visualisation of the Harbor 20, a compact single-module home with full-height glazing on a grassy plot with birch trees.",
        aspect: "5:2",
      },
      card: {
        src: "/images/models/harbor-20-card.png",
        alt: "Visualisation of the Harbor 20 compact studio home, card crop.",
        aspect: "3:2",
      },
      gallery: [RESIDENTIAL_INTERIOR],
    },
  },
  {
    slug: "harbor-40",
    name: "The Harbor 40",
    category: "40ft",
    useCase: "residential",
    summary:
      "A full one-bedroom home from a single 40-foot module, with a covered terrace at one end.",
    layout: "One bedroom",
    specs: {
      modules: unverified(1, SPEC_NOTE),
      floorArea: unverified(28, SPEC_NOTE),
      bedrooms: unverified(1, SPEC_NOTE),
      bathrooms: unverified(1, SPEC_NOTE),
      cladding: unverified("Matte off-white composite panels", CLADDING_NOTE),
    },
    priceBand: unverified({ from: 46000, to: 64000 }, PRICE_NOTE),
    factoryBuildDays: FACTORY_BUILD_TIME,
    features: [
      "Recessed covered terrace on slender steel columns",
      "Sliding glass doors opening to a timber deck",
      "Separate bedroom and bathroom",
      "Single-module delivery on one lorry",
    ],
    images: {
      hero: {
        src: "/images/models/harbor-40-hero.png",
        alt: "Visualisation of the Harbor 40, an off-white single-module home with a covered terrace on a gentle grassy slope.",
        aspect: "5:2",
      },
      card: {
        src: "/images/models/harbor-40-card.png",
        alt: "Visualisation of the Harbor 40 one-bedroom home, card crop.",
        aspect: "3:2",
      },
      gallery: [RESIDENTIAL_INTERIOR],
    },
  },
  {
    slug: "meridian",
    name: "The Meridian",
    category: "multi-unit",
    useCase: "residential",
    summary:
      "Two 40-foot modules joined side by side, opening into one wide living space. A family home that shows what modules can do.",
    layout: "Two bedrooms",
    specs: {
      modules: unverified(2, SPEC_NOTE),
      floorArea: unverified(56, SPEC_NOTE),
      bedrooms: unverified(2, SPEC_NOTE),
      bathrooms: unverified(2, SPEC_NOTE),
      cladding: unverified("Deep graphite composite panels", CLADDING_NOTE),
    },
    priceBand: unverified({ from: 79000, to: 108000 }, PRICE_NOTE),
    factoryBuildDays: FACTORY_BUILD_TIME,
    features: [
      "Wide open-plan living across both modules",
      "Full-height glazed gable end",
      "Flat roof with a slim overhang",
      "The join between modules reads as one clean line",
    ],
    images: {
      hero: {
        src: "/images/models/meridian-hero.png",
        alt: "Visualisation of the Meridian, a wide two-module house in graphite panels with a glazed gable end on a level plot.",
        aspect: "5:2",
      },
      card: {
        src: "/images/models/meridian-card.png",
        alt: "Visualisation of the Meridian two-module family home, card crop.",
        aspect: "3:2",
      },
      gallery: [RESIDENTIAL_INTERIOR],
    },
  },
  {
    slug: "meridian-stack",
    name: "The Meridian Stack",
    category: "multi-unit",
    useCase: "residential",
    summary:
      "Two 40-foot modules stacked, doubling the floor area on a small footprint. For tight plots and views worth a balcony.",
    layout: "Two bedrooms over two storeys",
    specs: {
      modules: unverified(2, SPEC_NOTE),
      floorArea: unverified(56, SPEC_NOTE),
      bedrooms: unverified(2, SPEC_NOTE),
      bathrooms: unverified(2, SPEC_NOTE),
      cladding: unverified("Warm grey composite panels with dark vertical battens", CLADDING_NOTE),
    },
    priceBand: unverified({ from: 88000, to: 118000 }, PRICE_NOTE),
    factoryBuildDays: FACTORY_BUILD_TIME,
    features: [
      "Two storeys on a single-module footprint",
      "Large corner window and glass-balustrade balcony upstairs",
      "Upper module cantilevers slightly over the entrance",
      "The seam between the stacked modules stays visible",
    ],
    images: {
      hero: {
        src: "/images/models/meridian-stack-hero.png",
        alt: "Visualisation of the Meridian Stack, a two-storey home of two stacked modules in warm grey panels, in a grassy clearing.",
        aspect: "5:2",
      },
      card: {
        src: "/images/models/meridian-stack-card.png",
        alt: "Visualisation of the Meridian Stack two-storey home, card crop.",
        aspect: "3:2",
      },
      gallery: [RESIDENTIAL_INTERIOR],
    },
  },
  {
    slug: "counter",
    name: "The Counter",
    category: "20ft",
    useCase: "commercial",
    summary:
      "A bar or coffee counter in a single module. The long wall folds up into a canopy, and the counter is ready for trade.",
    layout: "Servery",
    specs: {
      modules: unverified(1, SPEC_NOTE),
      floorArea: unverified(14, SPEC_NOTE),
      capacity: unverified("Servery for 1–2 staff", SPEC_NOTE),
      cladding: unverified("Matte deep-green composite panels", CLADDING_NOTE),
    },
    priceBand: unverified({ from: 36000, to: 52000 }, PRICE_NOTE),
    factoryBuildDays: FACTORY_BUILD_TIME,
    features: [
      "Fold-up serving hatch forms a canopy over the timber counter",
      "Room for bar stools on the forecourt",
      "Warm concealed lighting under the canopy",
      "Lockable and secure outside trading hours",
    ],
    images: {
      hero: {
        src: "/images/models/counter-hero.png",
        alt: "Visualisation of the Counter, a deep-green single-module bar with its serving hatch open in a small urban courtyard at dusk.",
        aspect: "5:2",
      },
      card: {
        src: "/images/models/counter-card.png",
        alt: "Visualisation of the Counter modular bar, card crop.",
        aspect: "3:2",
      },
      gallery: [],
    },
  },
  {
    slug: "workroom",
    name: "The Workroom",
    category: "multi-unit",
    useCase: "commercial",
    summary:
      "Two 40-foot modules joined into one bright office. Desk space, meeting room and a glazed entrance, ready for a team.",
    layout: "Open office",
    specs: {
      modules: unverified(2, SPEC_NOTE),
      floorArea: unverified(56, SPEC_NOTE),
      capacity: unverified("6–8 desks", SPEC_NOTE),
      cladding: unverified("Light warm-grey composite panels", CLADDING_NOTE),
    },
    priceBand: unverified({ from: 72000, to: 98000 }, PRICE_NOTE),
    factoryBuildDays: FACTORY_BUILD_TIME,
    features: [
      "Open workspace across both modules",
      "Fully glazed entrance bay with a slim steel canopy",
      "Provision for power and data throughout",
      "Landscaped approach with a paved path",
    ],
    images: {
      hero: {
        src: "/images/models/workroom-hero.png",
        alt: "Visualisation of the Workroom, a two-module office in light grey panels with a glazed entrance bay and hedged approach.",
        aspect: "5:2",
      },
      card: {
        src: "/images/models/workroom-card.png",
        alt: "Visualisation of the Workroom modular office, card crop.",
        aspect: "3:2",
      },
      gallery: [],
    },
  },
  {
    slug: "basecamp",
    name: "The Basecamp",
    category: "20ft",
    useCase: "commercial",
    summary:
      "A cabin unit for campsites and short stays. One picture window, one warm porch, built to be booked by the night.",
    layout: "Cabin",
    specs: {
      modules: unverified(1, SPEC_NOTE),
      floorArea: unverified(14, SPEC_NOTE),
      capacity: unverified("Sleeps 2", SPEC_NOTE),
      cladding: unverified("Dark matte composite panels", CLADDING_NOTE),
    },
    priceBand: unverified({ from: 31000, to: 43000 }, PRICE_NOTE),
    factoryBuildDays: FACTORY_BUILD_TIME,
    features: [
      "Single large picture window facing the view",
      "Timber-lined porch",
      "Raised on discreet steel feet for rough ground",
      "Sized for lorry access on rural tracks",
    ],
    images: {
      hero: {
        src: "/images/models/basecamp-hero.png",
        alt: "Visualisation of the Basecamp, a dark single-module cabin with a timber porch at the edge of a pine forest in morning mist.",
        aspect: "5:2",
      },
      card: {
        src: "/images/models/basecamp-card.png",
        alt: "Visualisation of the Basecamp short-stay cabin, card crop.",
        aspect: "3:2",
      },
      gallery: [],
    },
  },
];
