/**
 * /models/[slug] — model detail, the highest-intent conversion page (P2-detail).
 *
 * A dynamic route over the seven models in content/models.ts. Composition is
 * built entirely from the accepted components — nothing here re-implements a
 * primitive:
 *   - <RenderImage> for the hero and supporting shots (the "Visualisation"
 *     label is structural and non-removable; the outer <figure> only ever
 *     carries whole-cell Module Grid spans).
 *   - <SpecTable> for the two-column spec list, with the price band in Deep
 *     Brass (accent) and the delivery row via the dedicated FactoryDelivery
 *     variant, so a bare "30 days" can never be composed.
 *   - <QuoteForm> embedded inline (#quote), carrying this model's slug — intent
 *     peaks here, so the visitor converts on the page they are already on
 *     (PRODUCT.md § Conversion & proof) rather than being sent elsewhere.
 *
 * Truthfulness: the price band and currency are unverified() and stay wrapped
 * on the visible surface (SpecTable renders the dev marker); every rendering of
 * the delivery figure is self-scoping. The delivery scope sentences are shown
 * near the figure so the 30-day claim is never stated without what it covers
 * (PRODUCT.md § Positioning).
 *
 * Structured data: Product + Offer (price band as an AggregateOffer, delivery
 * as a self-scoping PropertyValue — never a bare numeric lead time, because the
 * number does not exist to extract) and BreadcrumbList, both emitted in the
 * server-rendered HTML. Per-page canonical/OG and sitemap are x1-seo's remit,
 * not duplicated here.
 *
 * A non-existent slug is a real 404: generateStaticParams prerenders exactly
 * the known slugs and `dynamicParams = false` turns anything else into the
 * static not-found response; notFound() is also called defensively.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { RenderImage } from "@/components/render-image";
import { SpecTable, formatSpecValue, type SpecTableRow } from "@/components/spec-table";
import { QuoteForm } from "@/components/quote-form/quote-form";
import { models, type Model } from "@/content/models";
import { site } from "@/content/site";
import { deliveryStatement } from "@/lib/delivery";
import { unverified } from "@/lib/unverified";
import { ViewModelTracker } from "./view-model-tracker";

export function generateStaticParams() {
  return models.map((model) => ({ slug: model.slug }));
}

/** Anything not prerendered above is a real 404, not a runtime-rendered page. */
export const dynamicParams = false;

function findModel(slug: string): Model | undefined {
  return models.find((model) => model.slug === slug);
}

const canonicalHost = `https://${site.domain}`;

/** Price range formatted in the single-source currency (site.ts). */
function formatPriceRange(from: number, to: number): string {
  const { code, locale } = site.currency.value;
  const format = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
    maximumFractionDigits: 0,
  });
  return `${format.format(from)} – ${format.format(to)}`;
}

/** Floor-area unit label from the single-source units config (site.ts). */
const FLOOR_AREA_UNIT_LABEL = { sqm: "m²", sqft: "sq ft" } as const;
function floorAreaUnit(): string {
  return FLOOR_AREA_UNIT_LABEL[site.units.value.floorArea];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const model = findModel(slug);
  if (!model) return {};
  // Title flows through the root layout template ("%s — urbanbricks").
  return {
    title: model.name,
    description: model.summary,
    alternates: { canonical: `/models/${slug}` },
    openGraph: {
      type: "website",
      locale: "en_GB",
      url: `/models/${slug}`,
      siteName: site.name,
      title: model.name,
      description: model.summary,
    },
  };
}

/** Spec rows, in reading order. Unverified values stay wrapped so the dev
 *  marker renders; the delivery row uses the FactoryDelivery variant. */
function specRows(model: Model): SpecTableRow[] {
  const { specs } = model;
  const rows: SpecTableRow[] = [
    { label: "Layout", value: model.layout },
    {
      label: "Modules",
      value: formatSpecValue(specs.modules, (n) => `${n} ${n === 1 ? "module" : "modules"}`),
    },
    {
      label: "Floor area",
      value: formatSpecValue(specs.floorArea, (n) => `${n} ${floorAreaUnit()}`),
    },
  ];
  if (specs.bedrooms) {
    rows.push({
      label: "Bedrooms",
      value: formatSpecValue(specs.bedrooms, (n) => `${n}`),
    });
  }
  if (specs.bathrooms) {
    rows.push({
      label: "Bathrooms",
      value: formatSpecValue(specs.bathrooms, (n) => `${n}`),
    });
  }
  if (specs.capacity) {
    rows.push({ label: "Capacity", value: specs.capacity });
  }
  rows.push({ label: "Cladding", value: specs.cladding });
  // Delivery and price are the exception that earns brass (DESIGN.md § Spec Table).
  rows.push({ label: "Factory build", delivery: model.factoryBuildDays });
  rows.push({
    label: "Price band",
    value: unverified(
      formatPriceRange(model.priceBand.value.from, model.priceBand.value.to),
      model.priceBand.note ?? undefined,
    ),
    accent: true,
  });
  return rows;
}

/**
 * Product + Offer structured data. The delivery window is a self-scoping
 * PropertyValue string, never a numeric lead time — the figure does not exist
 * as a number to extract, and a bare "30 days" is prohibited (PRODUCT.md).
 * No `image`: renders are labelled visualisations and that label cannot travel
 * into structured data, and the final art does not exist yet.
 */
function productJsonLd(model: Model) {
  const delivery = deliveryStatement(model.factoryBuildDays);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: model.name,
    description: model.summary,
    category:
      model.useCase === "residential"
        ? "Residential modular building"
        : "Commercial modular building",
    brand: { "@type": "Brand", name: site.name },
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Factory build time",
        value: delivery.short,
      },
    ],
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: site.currency.value.code,
      lowPrice: model.priceBand.value.from,
      highPrice: model.priceBand.value.to,
      url: `${canonicalHost}/models/${model.slug}`,
    },
  } as const;
}

function breadcrumbJsonLd(model: Model) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${canonicalHost}/` },
      { "@type": "ListItem", position: 2, name: "Models", item: `${canonicalHost}/models` },
      {
        "@type": "ListItem",
        position: 3,
        name: model.name,
        item: `${canonicalHost}/models/${model.slug}`,
      },
    ],
  } as const;
}

export default async function ModelDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const model = findModel(slug);
  if (!model) notFound();

  const delivery = deliveryStatement(model.factoryBuildDays);
  const sourcePath = `/models/${model.slug}`;
  // Hero leads; supporting shots follow. The card crop guarantees every model
  // has a second frame even when its interior gallery is still empty.
  const supporting = [model.images.card, ...model.images.gallery];

  return (
    <div className="mx-auto w-full max-w-[90rem] px-4 py-12 md:px-8 lg:py-16">
      <ViewModelTracker slug={model.slug} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(model)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(model)) }}
      />

      {/* Breadcrumb — navigation, not an eyebrow kicker. */}
      <nav aria-label="Breadcrumb" className="text-label text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <li>
            <Link href="/" className="underline-offset-4 hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/models" className="underline-offset-4 hover:underline">
              Models
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground" aria-current="page">
            {model.name}
          </li>
        </ol>
      </nav>

      {/* Page opener. Width and weight carry the hierarchy, no eyebrow. */}
      <header className="mt-8 max-w-[60ch]">
        <h1 className="text-display text-balance">{model.name}</h1>
        <p className="mt-4 text-body text-pretty text-muted-foreground">{model.summary}</p>
      </header>

      {/* Hero visualisation — the 5:2 module crop keeps the grid visible. */}
      <div className="mt-8 lg:mt-12">
        <RenderImage
          src={model.images.hero.src}
          alt={model.images.hero.alt}
          aspect="5:2"
          preload
          sizes="(min-width: 90rem) 84rem, 100vw"
        />
      </div>

      {/* Body: prose + supporting gallery on the left, the spec panel and the
          jump-to-quote CTA on the right. Stacks below 900px. */}
      <div className="mt-12 grid gap-12 lg:mt-16 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
        <div className="flex flex-col gap-12 lg:gap-16">
          <section aria-labelledby="features-heading">
            <h2 id="features-heading" className="text-headline text-balance">
              What you get
            </h2>
            {/* A hairline-ruled list, not a wall of icon cards. */}
            <ul className="mt-6 divide-y divide-border border-y border-border">
              {model.features.map((feature) => (
                <li key={feature} className="py-3.5 text-body">
                  {feature}
                </li>
              ))}
            </ul>
          </section>

          {supporting.length > 0 && (
            <section aria-label={`More visualisations of ${model.name}`}>
              {/* Module Grid: never constrain the grid element itself — the
                  page container above is the constraining parent. */}
              <div className="grid-modules">
                {supporting.map((image, index) => (
                  <RenderImage
                    key={`${image.src}-${index}`}
                    src={image.src}
                    alt={image.alt}
                    aspect={image.aspect}
                    className="cell-span-2"
                    sizes="(min-width: 80rem) 42vw, (min-width: 48rem) 46vw, 100vw"
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Spec panel. Self-contained content — bordered, no interactive
            affordance, so the hairline Line border is correct here. */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-md border border-border p-6 lg:p-8">
            <h2 className="text-title">Specification</h2>
            <SpecTable className="mt-4" rows={specRows(model)} />
            {/* The 30-day figure never stands without its scope. */}
            <div className="mt-6 space-y-2 text-label text-muted-foreground">
              <p>{delivery.covers}</p>
              <p>{delivery.customerSide}</p>
            </div>
            <div className="mt-8 flex flex-col gap-3">
              <a
                href="#quote"
                className="inline-flex h-auto items-center justify-center rounded-md bg-brass px-8 py-4 text-label text-ink transition-colors duration-150 ease-out hover:bg-brass-hover motion-reduce:transition-none"
              >
                Request a quote
              </a>
              <Link
                href="/models"
                className="inline-flex h-auto items-center justify-center rounded-md border border-ink bg-background px-8 py-4 text-label text-ink transition-colors duration-150 ease-out hover:bg-[color-mix(in_oklch,var(--background),var(--foreground)_5%)] motion-reduce:transition-none"
              >
                Browse all models
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* Inline conversion — the form lives here, carrying this model's slug. */}
      <section
        id="quote"
        aria-labelledby="quote-heading"
        className="mt-16 border-t border-border pt-12 lg:mt-24 lg:pt-16"
      >
        <div className="max-w-[65ch]">
          <h2 id="quote-heading" className="text-headline text-balance">
            Get a price for {model.name}
          </h2>
          <p className="mt-4 text-body text-pretty text-muted-foreground">
            Tell us about your project and we will send an indicative quote. It costs
            nothing and commits you to nothing — {model.name} is included with your request.
          </p>
        </div>
        <div className="mt-8 max-w-[65ch]">
          <QuoteForm sourcePath={sourcePath} modelSlug={model.slug} />
        </div>
      </section>
    </div>
  );
}
