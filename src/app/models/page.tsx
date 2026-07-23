/**
 * /models — the model library (browse and filter).
 *
 * The site's secondary CTA is "browse the model library" (PRODUCT.md
 * § Conversion & proof), so this is a conversion surface: every card is a step
 * toward a quote, and the primary "Get a quote" path stays reachable — in the
 * sticky header on every page, and again in the closing prompt here. No page
 * traps the visitor (PRODUCT.md § Design Principles).
 *
 * Filtering is URL-driven and rendered on the server, so it works with
 * JavaScript disabled: the controls are <Link>s, the state lives in
 * `searchParams`, and the default render (no params) lists every model. See
 * src/components/models-index/filters.ts.
 *
 * One narrative, both segments (PRODUCT.md): residential and commercial models
 * share one grid and one set of controls — never a fork, never an afterthought.
 */
import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { QUOTE_CTA } from "@/components/site-header/nav-items";
import { FilterBar } from "@/components/models-index/filter-bar";
import { ModelCard } from "@/components/models-index/model-card";
import {
  clearFiltersHref,
  filterModels,
  hasActiveFilters,
  parseFilters,
} from "@/components/models-index/filters";
import { models } from "@/content/models";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Models",
  description:
    "Seven modular buildings for homes and businesses — filter by size or use, and see the price band and specification of each. Every model is built in the factory while your site is prepared.",
  alternates: { canonical: "/models" },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "/models",
    siteName: site.name,
    title: "Models",
    description:
      "Seven modular buildings for homes and businesses — filter by size or use, and see the price band and specification of each. Every model is built in the factory while your site is prepared.",
  },
};

const TOTAL = models.length;

function ClosingCta() {
  return (
    <section
      aria-labelledby="models-cta-heading"
      className="flex flex-col items-start gap-stack border-t border-line pt-section"
    >
      <h2 id="models-cta-heading" className="text-headline text-foreground">
        Found one that fits?
      </h2>
      <p className="max-w-[60ch] text-body text-muted-foreground">
        Tell us about your plot and your project and we&rsquo;ll come back with a
        price and a build slot. It costs nothing and commits you to nothing.
      </p>
      <Button
        asChild
        size="lg"
        className="mt-inline rounded-md px-5 duration-150 ease-out motion-reduce:transition-none hover:bg-brass-hover"
      >
        <Link href={QUOTE_CTA.href}>
          <span className="text-label">{QUOTE_CTA.label}</span>
        </Link>
      </Button>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-start gap-stack rounded-md border border-line bg-background p-group">
      <h2 className="font-sans text-title font-semibold text-foreground">
        No models match these filters
      </h2>
      <p className="max-w-[60ch] text-body text-muted-foreground">
        {`Nothing in the library matches that combination yet. Clear the filters to see all ${TOTAL} models — or tell us what you need and we’ll quote a build to suit it.`}
      </p>
      <div className="flex flex-wrap gap-stack pt-inline">
        {/* Secondary action (DESIGN.md § Buttons): white fill, 1px Ink border,
            ink label — kept out of visual competition with the brass CTA.
            Hand-concatenated so the `text-label` font-size token survives. */}
        <Link
          href={clearFiltersHref}
          className="inline-flex items-center rounded-md border border-ink bg-background px-5 py-3 text-label text-ink transition-colors duration-150 ease-out motion-reduce:transition-none hover:bg-muted"
        >
          Clear filters
        </Link>
        <Button
          asChild
          size="lg"
          className="rounded-md px-5 duration-150 ease-out motion-reduce:transition-none hover:bg-brass-hover"
        >
          <Link href={QUOTE_CTA.href}>
            <span className="text-label">{QUOTE_CTA.label}</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default async function ModelsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseFilters(await searchParams);
  const visible = filterModels(filters);
  const anyActive = hasActiveFilters(filters);

  const count = visible.length;
  const summary = anyActive
    ? `${count} of ${TOTAL} ${count === 1 ? "model" : "models"}`
    : `All ${TOTAL} models`;

  return (
    <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-section px-4 py-section min-[900px]:px-8">
      <header className="flex flex-col gap-stack">
        <h1 className="text-display text-foreground">Models</h1>
        <p className="max-w-[65ch] text-body text-muted-foreground">
          Seven models, homes and commercial spaces, each built in our factory
          while your groundwork happens on site. Filter by size or by what
          you&rsquo;re building, then open any model for its full specification
          and price band.
        </p>
      </header>

      <FilterBar filters={filters} />

      <section aria-label="Models" className="flex flex-col gap-group">
        <p role="status" className="text-label text-muted-foreground">
          {summary}
        </p>

        {count === 0 ? (
          <EmptyState />
        ) : (
          // The grid element itself carries no width constraint (globals.css
          // § Module Grid): its negative-gutter margin resolves against the
          // containing block, so the page wrapper above owns max-width and
          // padding, and .grid-modules simply fills it.
          <ul className="grid-modules list-none">
            {visible.map((model) => (
              <li key={model.slug}>
                <ModelCard model={model} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <ClosingCta />
    </div>
  );
}
