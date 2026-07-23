/**
 * / — the homepage (task p4-home). Top of the conversion funnel.
 *
 * Built on the accepted primitives, never rebuilding them: <RenderImage> for
 * labelled imagery, the <Button> primitive for the two CTAs, and the site
 * shell (header/footer) supplied by the root layout. All copy and facts come
 * from src/content/* — the delivery figure only ever reaches the page through
 * deliveryStatement(), whose strings are self-scoping (there is no bare
 * "30 days" to render, PRODUCT.md § Positioning).
 *
 * Section order follows the belief ladder (PRODUCT.md § Conversion & proof):
 *   1. Hero            — this is a real category, open in weeks not years.
 *   2. Featured models — it applies to MY project (segment self-identification,
 *                        both segments equal weight — PRODUCT.md's one-narrative
 *                        rule; NO forking into two heroes or an entry modal).
 *   3. Selling points  — speed / value / aftercare, each backed by a mechanism.
 *   4. Process band    — the speed claim is credible because you can see the
 *                        parallel-track mechanism. The one Ink Surface band on
 *                        the page (DESIGN.md: the central claim is argued dark).
 *   5. FAQ summary     — objections, incl. one residential- and one
 *                        commercial-specific question (spec §2).
 *   6. Closing CTA     — asking for a quote costs nothing.
 *
 * The primary CTA (Get a quote) is reachable from every section: the sticky
 * site header carries it on every viewport, and the hero and closing bands
 * repeat it in context. The secondary CTA (Browse models) is present in the
 * hero, the featured section, and the close — never the only way forward.
 *
 * Imagery note: urbanbricks has no real renders yet, so every <RenderImage>
 * ships without a src and shows its labelled "Visualisation pending"
 * placeholder at the correct Module Grid aspect ratio — the only permitted
 * stand-in (DESIGN.md § Imagery policy). The mandatory "Visualisation" caption
 * is structural and cannot be dropped; every wrapper here stays on the
 * verify:image-label allowlist (standard breakpoints, no hiding utilities).
 */
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { RenderImage } from "@/components/render-image";
import { FACTORY_BUILD_TIME, site } from "@/content/site";
import { models, type UseCase } from "@/content/models";
import { parallelNote, processTracks } from "@/content/process";
import { faqItems } from "@/content/faq";
import { deliveryStatement } from "@/lib/delivery";

// The delivery claim, only ever via the sanctioned self-scoping accessor.
const delivery = deliveryStatement(FACTORY_BUILD_TIME);

// Four featured models, interleaved residential / commercial so neither
// segment is an afterthought at any breakpoint: at ≥2 columns each row holds
// one of each, and the single-column stack alternates. Two of each segment =
// equal count, equal card size, equal ordering.
const FEATURED_SLUGS = ["harbor-40", "counter", "meridian", "workroom"] as const;
const featuredModels = FEATURED_SLUGS.map(
  (slug) => models.find((model) => model.slug === slug)!,
);

const useCaseLabel: Record<UseCase, string> = {
  residential: "Home",
  commercial: "Commercial",
};

// Homepage FAQ summary: two general questions plus one residential- and one
// commercial-specific, chosen by segment so the two-audience coverage is
// structural, not hand-picked (spec §2).
const generalFaqs = faqItems.filter((item) => item.segment === "both").slice(0, 2);
const residentialFaq = faqItems.find((item) => item.segment === "residential")!;
const commercialFaq = faqItems.find((item) => item.segment === "commercial")!;
const homeFaqs = [...generalFaqs, residentialFaq, commercialFaq];

/** Shared page gutter — mirrors the header/footer container. Wraps the Module
 *  Grid (never constrains .grid-modules itself — see globals.css). */
const container = "mx-auto w-full max-w-[90rem] px-4 md:px-8";

/** Primary conversion CTA (brass fill, ink label). The inner span carries the
 *  Label type: the Button primitive's own text-sm would otherwise win the
 *  cascade over the custom text-label utility (same pattern as the header). */
function QuoteButton({ className }: { className?: string }) {
  return (
    <Button
      asChild
      size="lg"
      className={`h-auto rounded-md px-8 py-4 duration-150 ease-out hover:bg-brass-hover motion-reduce:transition-none ${className ?? ""}`}
    >
      <Link href="/contact">
        <span className="text-label">Get a quote</span>
      </Link>
    </Button>
  );
}

/** Secondary CTA (white fill, 1px Ink border, ink label — DESIGN.md § Buttons).
 *  Never competes with the brass quote button. */
function BrowseButton({
  href = "/models",
  children = "Browse models",
}: {
  href?: string;
  children?: React.ReactNode;
}) {
  return (
    <Button
      asChild
      variant="outline"
      size="lg"
      className="h-auto rounded-md border-ink px-8 py-4 text-foreground duration-150 ease-out motion-reduce:transition-none"
    >
      <Link href={href}>
        <span className="text-label">{children}</span>
      </Link>
    </Button>
  );
}

export default function Home() {
  return (
    <>
      {/* 1 — HERO. The claim is use-agnostic ("open in weeks") so it is true
          for a home buyer and a bar operator alike, and it is immediately
          grounded in the mechanism: the factory build is 30 days, run in
          parallel with the customer's own site work. No bare duration. */}
      <section className={`${container} py-section lg:py-band`}>
        <div className="grid items-center gap-group lg:grid-cols-2 lg:gap-24">
          <div className="flex flex-col items-start gap-group">
            <h1 className="text-display max-w-[14ch]">Open in weeks, not years.</h1>
            <p className="text-body max-w-[52ch] text-muted-foreground">
              urbanbricks makes modular homes and commercial spaces to order.{" "}
              <span className="font-semibold text-foreground">{delivery.headline}</span> — while your
              groundwork, planning and connections happen on site at the same time. The building stops
              being the thing you wait for.
            </p>
            <div className="flex flex-wrap items-center gap-stack">
              <QuoteButton />
              <BrowseButton />
            </div>
          </div>
          {/* Placeholder render at the 5:2 base-cell ratio. Sibling of the copy
              column, so the copy's classes are unconstrained; this column is an
              image ancestor and stays allowlist-clean. */}
          <RenderImage
            aspect="5:2"
            sizes="(min-width: 64rem) 44vw, 100vw"
            alt="Visualisation of an urbanbricks modular building on a prepared plot."
          />
        </div>
      </section>

      {/* 2 — FEATURED MODELS. Segment self-identification happens here, not via
          two heroes or an entry modal (both forbidden). Homes and commercial
          spaces share one grid, one heading, one promise. */}
      <section className={`${container} py-section lg:py-band`} aria-labelledby="featured-heading">
        <div className="max-w-[46ch]">
          <h2 id="featured-heading" className="text-headline">
            Built for homes and for business.
          </h2>
          <p className="mt-stack text-body text-muted-foreground">
            Every model is the same promise — a building that arrives when we say it will. Pick the
            space you need; the residential and commercial lines run side by side.
          </p>
        </div>

        {/* The signature Module Grid. Wrapped by the constraining container
            above; the grid element carries no width of its own. */}
        <div className="mt-group grid-modules">
          {featuredModels.map((model) => (
            <Link
              key={model.slug}
              href={`/models/${model.slug}`}
              className="group flex flex-col gap-stack rounded-md border border-stroke p-4 transition-colors duration-150 ease-out hover:border-ink focus-visible:border-ink motion-reduce:transition-none md:p-6"
            >
              <RenderImage
                aspect="3:2"
                sizes="(min-width: 80rem) 22vw, (min-width: 48rem) 44vw, 92vw"
                alt={model.images.card.alt}
              />
              <div className="flex flex-col gap-1">
                <span className="text-label text-muted-foreground">{useCaseLabel[model.useCase]}</span>
                <h3 className="text-title text-foreground underline decoration-transparent decoration-2 underline-offset-4 transition-colors duration-150 ease-out group-hover:decoration-ink motion-reduce:transition-none">
                  {model.name}
                </h3>
                <p className="mt-1 text-body text-muted-foreground">{model.summary}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Two explicit paths into /models — one per segment, equal footing. */}
        <div className="mt-group flex flex-wrap gap-x-group gap-y-stack">
          <Link
            href="/models"
            className="inline-flex items-center gap-1.5 text-label text-brass-deep underline underline-offset-4 hover:decoration-2"
          >
            See all homes
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
          <Link
            href="/models"
            className="inline-flex items-center gap-1.5 text-label text-brass-deep underline underline-offset-4 hover:decoration-2"
          >
            See all commercial spaces
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </section>

      {/* 3 — SELLING POINTS. Three distinct text blocks separated by hairline
          rules — deliberately NOT a wall of identical icon+heading+text cards
          (DESIGN.md red line). Each point states the mechanism behind the
          adjective; the copy is content, not rewritten here. */}
      <section className={`${container} py-section`} aria-labelledby="why-heading">
        <h2 id="why-heading" className="text-headline max-w-[24ch]">
          Certainty, not enthusiasm.
        </h2>
        <div className="mt-group grid divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0">
          {site.sellingPoints.map((point, index) => (
            <div
              key={point.id}
              className={`flex flex-col gap-stack py-group md:py-0 ${
                index === 0 ? "md:pr-group" : "md:px-group"
              } ${index === site.sellingPoints.length - 1 ? "md:pr-0" : ""} ${
                index === 0 ? "md:pl-0" : ""
              }`}
            >
              <h3 className="text-title text-foreground">{point.title}</h3>
              <p className="text-body text-muted-foreground">{point.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4 — PROCESS BAND. The one Ink Surface band on the page (rhythm + the
          central claim argued on dark). Semantic tokens auto-swap to their
          dark-surface counterparts inside .ink-surface: text-foreground → On
          Dark, text-muted-foreground → Muted On Dark, text-brass-deep → Brass
          (7.60:1). No 01/02/03 numbering here — the ordered steps live on the
          process page, where the sequence is the information; this is an
          overview of the two parallel tracks. */}
      <section className="ink-surface" aria-labelledby="process-heading">
        <div className={`${container} py-section lg:py-band`}>
          <div className="max-w-[34ch]">
            <h2 id="process-heading" className="text-headline">
              Two tracks, one timeline.
            </h2>
          </div>
          <p className="mt-stack text-body max-w-[62ch] text-muted-foreground">{parallelNote}</p>

          <p className="mt-group text-title font-semibold text-brass-deep">{delivery.headline}</p>

          <div className="mt-group grid gap-group md:grid-cols-2 md:gap-24">
            {processTracks.map((track) => (
              <div key={track.id} className="flex flex-col gap-stack border-t border-border pt-stack">
                <h3 className="text-title text-foreground">{track.title}</h3>
                <p className="text-body text-muted-foreground">{track.intro}</p>
              </div>
            ))}
          </div>

          <div className="mt-group">
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-1.5 text-label text-foreground underline underline-offset-4 hover:decoration-2"
            >
              See how it works
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5 — FAQ SUMMARY. Native <details> so every answer is readable with no
          JavaScript and operable from the keyboard; the chevron rotation is the
          only motion and it degrades under prefers-reduced-motion. Includes a
          residential- and a commercial-specific question (spec §2). */}
      <section className={`${container} py-section lg:py-band`} aria-labelledby="faq-heading">
        <div className="max-w-[34ch]">
          <h2 id="faq-heading" className="text-headline">
            Questions people ask first.
          </h2>
        </div>
        <div className="mt-group max-w-[75ch] divide-y divide-border border-y border-border">
          {homeFaqs.map((item) => (
            <details key={item.question} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-group py-4 text-title text-foreground [&::-webkit-details-marker]:hidden">
                {item.question}
                <ChevronDown
                  aria-hidden="true"
                  className="size-5 shrink-0 text-muted-foreground transition-transform duration-150 ease-out group-open:rotate-180 motion-reduce:transition-none"
                />
              </summary>
              <p className="max-w-[70ch] pb-4 text-body text-muted-foreground">{item.answer}</p>
            </details>
          ))}
        </div>
        <p className="mt-group text-body text-muted-foreground">
          More questions?{" "}
          <Link href="/how-it-works" className="text-brass-deep underline underline-offset-4">
            See how it works
          </Link>{" "}
          or{" "}
          <Link href="/contact" className="text-brass-deep underline underline-offset-4">
            ask us for a quote
          </Link>
          .
        </p>
      </section>

      {/* 6 — CLOSING CTA. The page never traps the visitor at the quote: the
          browse path sits beside it. */}
      <section className={`${container} py-section lg:py-band`}>
        <div className="flex flex-col items-start gap-group border-t border-border pt-band">
          <div className="max-w-[24ch]">
            <h2 className="text-headline">A quote costs nothing.</h2>
            <p className="mt-stack text-body text-muted-foreground">
              Tell us the plot and the project. We reply with a price band and what happens next —
              no obligation, no account, no countdown.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-stack">
            <QuoteButton />
            <BrowseButton />
          </div>
        </div>
      </section>
    </>
  );
}
