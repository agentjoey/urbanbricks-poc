/**
 * /how-it-works — the page that carries the entire "built in weeks, not years"
 * argument (task p3-process). The load-bearing section is <ParallelTimeline>:
 * the factory build and the customer's site prep shown as two concurrent
 * tracks, because the positioning is that they run in parallel.
 *
 * Every appearance of the delivery figure comes from deliveryStatement()'s
 * self-scoping strings (PRODUCT.md § Positioning). There is no bare "30 days"
 * anywhere on this page — the number does not exist on the public surface of
 * src/lib/delivery.ts to be composed into "open in 30 days".
 *
 * Imagery follows DESIGN.md § Imagery policy: no process photography of anyone
 * else's factory (the Not-Ours Rule), so the mechanism is carried by the
 * diagram and the layout. The one image is a labelled render placeholder at
 * the Module Grid's 5:2 crop.
 */
import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SpecTable, type SpecTableRow } from "@/components/spec-table";
import { RenderImage } from "@/components/render-image";
import { deliveryStatement } from "@/lib/delivery";
import { isUnverified, UNVERIFIED_BADGE_LABEL } from "@/lib/unverified";
import { FACTORY_BUILD_TIME, site } from "@/content/site";
import { processTracks, warranty } from "@/content/process";
import { ParallelTimeline } from "./parallel-timeline";

const delivery = deliveryStatement(FACTORY_BUILD_TIME);

export const metadata: Metadata = {
  title: "How it works",
  description: `${delivery.headline}, while your site is prepared. See the two schedules that run in parallel, the delivery sequence, and the warranty terms we put in writing.`,
  alternates: { canonical: "/how-it-works" },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "/how-it-works",
    siteName: site.name,
    title: "How it works",
    description: `${delivery.headline}, while your site is prepared. See the two schedules that run in parallel, the delivery sequence, and the warranty terms we put in writing.`,
  },
};

/** The install duration lives on the factory track's craning step (content-owned,
 *  still unverified). Pulled by the step that carries a duration rather than by a
 *  brittle index. */
const installStep = processTracks[0].steps.find((step) => step.duration);

/** The delivery, as a spec-table summary — the configurator register DESIGN.md
 *  asks for (a number, a date, a named responsibility). The factory-build row is
 *  the dedicated delivery variant, so its value is the self-scoping "30 days
 *  (factory build)" rendered inside SpecTable, in brass. */
const scheduleRows: SpecTableRow[] = [
  { label: "Factory build", delivery: FACTORY_BUILD_TIME },
  ...(installStep?.duration
    ? [{ label: "Delivery and craning on site", value: installStep.duration }]
    : []),
  { label: "Planning and groundwork", value: "Your own schedule" },
];

/** The dev-only "Unverified" marker (SpecTable idiom): a bordered Deep Brass
 *  chip, gone from any production build, so unconfirmed warranty terms cannot be
 *  mistaken for confirmed facts during review. */
function UnverifiedMark({ note }: { note: string | null }) {
  if (process.env.NODE_ENV === "production") return null;
  return (
    <span
      className="ml-2 inline-block rounded-sm border border-brass-deep px-1 text-label text-brass-deep align-middle"
      title={note ?? undefined}
    >
      {UNVERIFIED_BADGE_LABEL}
    </span>
  );
}

export default function HowItWorksPage() {
  return (
    <>
      {/* Opening — states the mechanism, then substantiates it. */}
      <section className="py-section">
        <div className="mx-auto w-full max-w-[75rem] px-4 sm:px-8">
          <div className="max-w-[20ch]">
            <h1 className="text-display">The building isn’t what makes you wait.</h1>
          </div>
          <div className="mt-group max-w-[68ch]">
            <p className="text-body text-pretty">
              Conventional construction prepares your site and then builds — one
              stage after another, which is why it is measured in years. We build
              your building in our factory at the same time as your groundwork
              happens on site. Run side by side, the two schedules overlap
              instead of stacking up.
            </p>
            <p className="mt-stack text-title text-foreground">{delivery.headline}.</p>
          </div>
        </div>
      </section>

      {/* The signature: the two concurrent tracks, on the dark process band. */}
      <ParallelTimeline />

      {/* The delivery, in figures — spec table paired with a labelled render, laid
          out on the Module Grid (each a cell). The grid is wrapped, never
          constrained (DESIGN.md § The Module Grid: constrain a parent, not the
          grid element). */}
      <section className="py-section">
        <div className="mx-auto w-full max-w-[75rem] px-4 sm:px-8">
          <div className="max-w-[68ch]">
            <h2 className="text-headline">The schedule, in figures</h2>
            <p className="mt-stack text-body text-pretty">
              The only fixed figure is the factory build. Planning and groundwork
              are your own schedule, run alongside it — never inside it.
            </p>
          </div>
          <div className="mt-group grid-modules">
            <SpecTable rows={scheduleRows} className="cell-span-2" />
            <RenderImage
              aspect="5:2"
              src="/images/context/delivery-crane.png"
              className="cell-span-2"
              alt="Visualisation of a finished urbanbricks module being craned onto its prepared foundations."
              sizes="(min-width: 80rem) 50vw, 100vw"
            />
          </div>
          <div className="mt-group max-w-[68ch]">
            <p className="text-body text-pretty text-muted-foreground">
              {delivery.covers}
            </p>
            <p className="mt-stack text-body text-pretty text-muted-foreground">
              {delivery.customerSide}
            </p>
          </div>
        </div>
      </section>

      {/* Warranty — concrete enough to be checked (PRODUCT.md § Certainty over
          enthusiasm). A hairline schedule, not a card wall: each term names what
          it covers and the period we put our name to. */}
      <section className="py-section">
        <div className="mx-auto w-full max-w-[75rem] px-4 sm:px-8">
          <div className="max-w-[68ch]">
            <h2 className="text-headline">What we put our name to</h2>
            <p className="mt-stack text-body text-pretty">{warranty.intro}</p>
          </div>

          <dl className="mt-group max-w-[75ch] divide-y divide-border border-y border-border">
            {warranty.terms.map((term) => {
              const period = term.period;
              const { value, unit } = period.value;
              return (
                <div
                  key={term.id}
                  className="grid gap-x-group gap-y-1 py-group sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]"
                >
                  <dt className="flex flex-col gap-1">
                    <span className="text-title text-foreground">{term.label}</span>
                    <span className="text-body font-semibold text-brass-deep tabular-nums">
                      {value} {unit}
                      {isUnverified(period) && <UnverifiedMark note={period.note} />}
                    </span>
                  </dt>
                  <dd className="text-body text-pretty text-muted-foreground">
                    {term.covers}
                  </dd>
                </div>
              );
            })}
          </dl>

          <div className="mt-group max-w-[68ch]">
            <p className="text-body text-pretty">{warranty.aftercare.body}</p>
            <p className="mt-stack text-body text-foreground">
              Aftercare response:{" "}
              <span className="font-semibold text-brass-deep tabular-nums">
                within {isUnverified(warranty.aftercare.responseWorkingDays)
                  ? warranty.aftercare.responseWorkingDays.value
                  : warranty.aftercare.responseWorkingDays}{" "}
                working days
                {isUnverified(warranty.aftercare.responseWorkingDays) && (
                  <UnverifiedMark note={warranty.aftercare.responseWorkingDays.note} />
                )}
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Closing — every page leads to a quote, no page traps the visitor there
          (PRODUCT.md). Two forward paths: the quote and the model library. */}
      <section className="py-section">
        <div className="mx-auto w-full max-w-[75rem] px-4 sm:px-8">
          <div className="max-w-[68ch]">
            <h2 className="text-headline">Get a number and a plan for your project.</h2>
            <p className="mt-stack text-body text-pretty">
              A quote costs nothing and commits you to nothing. Tell us the
              project and the site, and we will come back with a price band and a
              build plan.
            </p>
          </div>
          <div className="mt-group flex flex-col gap-stack sm:flex-row">
            <Button
              asChild
              size="lg"
              className="rounded-md px-5 duration-150 ease-out motion-reduce:transition-none hover:bg-brass-hover"
            >
              <Link href="/contact">
                <span className="text-label">Get a quote</span>
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="rounded-md border border-ink px-5 duration-150 ease-out motion-reduce:transition-none"
            >
              <Link href="/models">
                <span className="text-label">Browse the models</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
