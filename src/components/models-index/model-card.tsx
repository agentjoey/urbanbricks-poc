/**
 * ModelCard — one model in the /models grid.
 *
 * The whole card is a link to the model's detail page, so its boundary is an
 * interactive boundary and must clear WCAG 1.4.11 (3:1): it uses **Stroke**
 * (`border-stroke`, 3.37:1 on white), never Line (1.35:1) — DESIGN.md
 * § Cards ("Don't bound a clickable card with Line"). Hover/focus deepens the
 * border to Ink; there is no lift, scale or shadow (DESIGN.md § Elevation:
 * flat at rest), and the transition has a `prefers-reduced-motion` opt-out.
 *
 * Imagery is the accepted <RenderImage> — the non-removable "Visualisation …"
 * caption renders inside the card in every state (loading / loaded / failed /
 * pending). Every ancestor class the card puts above <RenderImage> stays on the
 * verify:image-label allowlist (layout / spacing / border / background only —
 * nothing that could hide the caption).
 *
 * The price band is `unverified()` — it renders in Deep Brass at Title weight
 * (the figure the system earns brass for, DESIGN.md § Spec Table) and carries a
 * development-only "Unverified" marker, gated on NODE_ENV exactly as the spec
 * table does, so it never reaches a production build.
 */
import Link from "next/link";

import { site } from "@/content/site";
import type { Model } from "@/content/models";
import { RenderImage } from "@/components/render-image";
import { isUnverified, UNVERIFIED_BADGE_LABEL } from "@/lib/unverified";

/** Each card is one cell wide; the grid runs 1 / 2 / 4 columns by breakpoint. */
const CARD_SIZES =
  "(min-width: 80rem) 21rem, (min-width: 48rem) 45vw, calc(100vw - 2rem)";

const { code, locale } = site.currency;
const priceFormatter = new Intl.NumberFormat(locale, {
  style: "currency",
  currency: code,
  maximumFractionDigits: 0,
});

function formatPriceBand(from: number, to: number): string {
  // en-dash range, e.g. "£34,000 – £46,000".
  return `${priceFormatter.format(from)} – ${priceFormatter.format(to)}`;
}

const USE_LABEL: Record<Model["useCase"], string> = {
  residential: "Homes",
  commercial: "Commercial",
};

const SIZE_LABEL: Record<Model["category"], string> = {
  "20ft": "20ft module",
  "40ft": "40ft module",
  "multi-unit": "Multi-unit",
};

export function ModelCard({ model }: { model: Model }) {
  // Dev-only review aid; a production build (`next build`) strips this branch.
  const devMode = process.env.NODE_ENV !== "production";
  const priceBand = model.priceBand.value;
  const priceUnverified = isUnverified(model.priceBand);
  const priceNote = priceUnverified ? model.priceBand.note : null;

  return (
    <Link
      href={`/models/${model.slug}`}
      aria-label={`${model.name} — ${USE_LABEL[model.useCase]}, ${model.layout}`}
      className="group flex h-full flex-col gap-stack rounded-md border border-stroke bg-background p-inline transition-colors duration-150 ease-out motion-reduce:transition-none hover:border-ink focus-visible:border-ink"
    >
      <RenderImage
        src={model.images.card.src}
        alt={model.images.card.alt}
        aspect="3:2"
        sizes={CARD_SIZES}
      />

      <div className="flex flex-1 flex-col gap-stack px-inline pb-inline">
        <div className="flex flex-col gap-inline">
          {/* Title-level card heading stays in the body face (Schibsted): h2
              inherits the display face from globals, so `font-sans` opts it
              back out. font-stretch has no wide face to select and renders
              normal — harmless. */}
          <h2 className="font-sans text-title font-semibold text-balance text-foreground">
            {model.name}
          </h2>
          <p className="text-label text-muted-foreground">
            {USE_LABEL[model.useCase]} · {SIZE_LABEL[model.category]} · {model.layout}
          </p>
        </div>

        <p className="text-body text-muted-foreground">{model.summary}</p>

        <div className="mt-auto flex flex-wrap items-baseline gap-x-inline gap-y-inline pt-inline">
          <span className="text-label text-muted-foreground">From</span>
          <span className="text-title font-semibold tabular-nums text-brass-deep">
            {formatPriceBand(priceBand.from, priceBand.to)}
          </span>
          {devMode && priceUnverified && (
            <span
              className="inline-block rounded-sm border border-brass-deep px-1 text-label text-brass-deep"
              title={priceNote ?? undefined}
            >
              {UNVERIFIED_BADGE_LABEL}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
