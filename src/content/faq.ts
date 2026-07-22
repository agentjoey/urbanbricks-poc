/**
 * content/faq.ts — questions a first-time buyer actually asks.
 *
 * Rules that shaped the answers:
 *   - Any answer that states the 30 days states what it covers (PRODUCT.md §
 *     Positioning). Durations never appear bare, here or anywhere.
 *   - No invented proof: where the honest answer is "we are new and cannot
 *     show you a finished building yet", that is the answer.
 *   - No unverified numbers in prose: prices and warranty terms live in
 *     models.ts / process.ts as unverified() values; answers point there
 *     instead of quoting figures that could drift from the data.
 *   - The homepage FAQ summary needs at least one residential-specific and
 *     one commercial-specific question (spec §2) — `segment` marks them.
 */

export type FaqSegment = "residential" | "commercial" | "both";

export interface FaqItem {
  question: string;
  answer: string;
  segment: FaqSegment;
}

export const faqItems: FaqItem[] = [
  {
    question: "How can a building take 30 days?",
    answer:
      "The 30 days is the factory build: fabrication, fit-out and inspection of the building itself. It does not include groundwork, planning permission or utility connections — those are yours to arrange, and they happen at the same time as the build, not after it. Conventional construction runs the same work one stage after another; running it side by side is why the building stops being the thing you wait for.",
    segment: "both",
  },
  {
    question: "What does the price include?",
    answer:
      "Each model page shows a price band for the building as specified — the factory build and its standard fit-out. Groundwork, planning and utility connections are separate: they sit on your side of the schedule and the budget. When you request a quote we spell out line by line what is in and what is not, before you commit to anything.",
    segment: "both",
  },
  {
    question: "Can I see a finished building before I buy?",
    answer:
      "Not yet — urbanbricks is a new manufacturer and does not have completed buildings to visit. What we can show you is the process: the drawings, the specification, and photographs of your own building as it moves through the factory.",
    segment: "both",
  },
  {
    question: "Where do you deliver?",
    answer:
      "Delivery is quoted with every project, because the answer depends on lorry and crane access to your plot. Tell us where your site is and we will confirm what is possible before you spend anything.",
    segment: "both",
  },
  {
    question: "What warranty do I get?",
    answer:
      "Every building leaves with its warranty in writing — the structure, the weathertightness and the fixtures each carry their own term — plus a named contact for aftercare. The exact terms are on the how-it-works page, specific enough to hold us to.",
    segment: "both",
  },
  {
    question: "Do I need planning permission for a home module?",
    answer:
      "Usually yes for a permanent home, though the rules differ by council and country, and some garden buildings fall under permitted development. Permission sits on your side of the schedule, so check with your local authority early — it is the step most likely to set your real timeline.",
    segment: "residential",
  },
  {
    question: "Can I live in one all year round?",
    answer:
      "Yes. The residential models are designed as permanent homes — insulated, heated, with full bathrooms and kitchens — not converted sheds or summer cabins.",
    segment: "residential",
  },
  {
    question: "Can I run a bar or café from a module?",
    answer:
      "Yes — the Counter is designed as a servery: the long wall folds up into a canopy over the counter, and it locks down outside trading hours. You will still need the licences and permissions your local authority requires for food and drink, and those are yours to arrange.",
    segment: "commercial",
  },
  {
    question: "How soon can I open for business?",
    answer:
      "The building itself takes 30 days in the factory. Your licence, groundwork and utility connections run on your side of the schedule at the same time — how soon you open depends on both tracks. What you save is the wait for the building, which is usually the longest part.",
    segment: "commercial",
  },
];
