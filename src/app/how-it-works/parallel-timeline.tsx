/**
 * ParallelTimeline — the signature of /how-it-works and the whole argument
 * behind "built in weeks, not years".
 *
 * The positioning (PRODUCT.md § Positioning) is that the factory build and the
 * customer's site prep run AT THE SAME TIME, so the building stops being the
 * thing that takes the time. A sequential list would misrepresent that, so this
 * component shows concurrency two ways that reinforce each other:
 *
 *   1. ConcurrencyDiagram — a schematic contrasting the conventional
 *      sequence (site → build, end to end) with the urbanbricks overlap (site
 *      and factory build stacked in the same span of time). Readable at a
 *      glance and at any width.
 *   2. Two numbered tracks side by side — the detail. They stay a two-column
 *      grid at EVERY width (never collapsing to one sequence), because the
 *      brief's acceptance is that the parallel structure survives narrow width.
 *      This is the one page where numbered steps are permitted (DESIGN.md
 *      § No-Eyebrow Rule) because the order is real information.
 *
 * The band is Ink Surface: DESIGN.md § Named Rules names the delivery-process
 * band as "the one place the brand's central claim is argued" and requires it
 * to be dark. Every colour below is a semantic token that `.ink-surface`
 * redefines (Brass for figures, Muted On Dark for labels, On Dark body), so
 * the dark-surface counterparts come in automatically (the Every-Surface Rule).
 *
 * The 30-day figure only ever reaches the screen through deliveryStatement()'s
 * self-scoping strings — never a bare number that could read as "move in in 30
 * days" (PRODUCT.md § Positioning; the number does not exist on the public
 * surface of src/lib/delivery.ts to be composed).
 */
import { deliveryStatement } from "@/lib/delivery";
import { isUnverified, UNVERIFIED_BADGE_LABEL } from "@/lib/unverified";
import { FACTORY_BUILD_TIME } from "@/content/site";
import { parallelNote, processTracks, type ProcessTrack } from "@/content/process";

const delivery = deliveryStatement(FACTORY_BUILD_TIME);

/**
 * The dev-only "Unverified" marker, matching the SpecTable idiom exactly
 * (bordered Deep Brass chip, gated on NODE_ENV). Facts still wrapped in
 * unverified() must never read as confirmed during review; the marker is gone
 * from any production build.
 */
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

/**
 * Schematic: sequence vs parallel. Two lanes on the same left-aligned time
 * axis. The conventional lane runs its two phases end to end (full width); the
 * urbanbricks lane stacks the same two kinds of work in a shorter span,
 * because they overlap in time. No durations are invented on the customer's
 * side or on the conventional lane — the only figure shown is the sanctioned
 * factory-build statement.
 */
function ConcurrencyDiagram() {
  const neutralBar =
    "rounded-sm bg-[color-mix(in_oklch,var(--on-dark)_8%,transparent)] px-3 py-2.5 text-label text-foreground";
  return (
    <div className="flex flex-col gap-group">
      {/* Conventional — one stage after another */}
      <div className="flex flex-col gap-stack">
        <p className="text-label text-muted-foreground">
          Conventional construction — one stage after another
        </p>
        <div className="flex w-full gap-inline">
          <div className={`${neutralBar} flex-1`}>Site &amp; groundwork</div>
          <div className={`${neutralBar} flex-1`}>Construction</div>
        </div>
        <p className="text-label text-muted-foreground">Measured in years.</p>
      </div>

      {/* urbanbricks — the same two kinds of work, at the same time */}
      <div className="flex flex-col gap-stack">
        <p className="text-label font-medium text-foreground">
          urbanbricks — at the same time
        </p>
        {/* The group is deliberately narrower than the conventional row and its
            two bars share one horizontal (time) extent: you can see the work
            done in parallel takes less of the schedule. */}
        <div className="flex w-full max-w-[62%] flex-col gap-inline">
          <div className={neutralBar}>Your site work</div>
          <div className="rounded-sm bg-brass px-3 py-2.5 text-label font-semibold text-ink">
            {delivery.short}
          </div>
        </div>
        <p className="text-label text-muted-foreground">
          One span of time — the building is made while your site is prepared.
        </p>
      </div>
    </div>
  );
}

/** A single numbered step within a track. */
function TrackStep({
  step,
}: {
  step: ProcessTrack["steps"][number];
}) {
  const stepDelivery = step.delivery ? deliveryStatement(step.delivery) : null;
  return (
    <li className="relative flex gap-inline sm:gap-stack">
      {/* Number marker. Order is real information here; the number is text, so
          the state never rests on colour alone. The filled square occludes the
          connector line behind it, so the line reads as a continuous track
          through the gaps. */}
      <span
        aria-hidden="true"
        className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-sm border border-border bg-background text-label text-foreground"
      >
        {step.order}
      </span>
      <div className="min-w-0 pb-group">
        <h4 className="text-title text-foreground">{step.title}</h4>
        <p className="mt-1 text-body text-pretty">{step.body}</p>

        {stepDelivery && (
          <p className="mt-stack text-label font-semibold text-brass-deep">
            {stepDelivery.short}
          </p>
        )}
        {step.duration && (
          <p className="mt-stack text-label text-muted-foreground">
            {isUnverified(step.duration) ? step.duration.value : step.duration}
            {isUnverified(step.duration) && (
              <UnverifiedMark note={step.duration.note} />
            )}
          </p>
        )}
      </div>
    </li>
  );
}

/** One track (factory or site) as a numbered, connected vertical list. */
function TrackColumn({ track }: { track: ProcessTrack }) {
  return (
    <div className="px-3 first:pl-0 last:pr-0 sm:px-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-title text-foreground">{track.title}</h3>
        <p className="text-label text-muted-foreground">
          {track.owner === "urbanbricks" ? "Our side" : "Your side"}
        </p>
        <p className="mt-stack text-body text-pretty text-muted-foreground">
          {track.intro}
        </p>
      </div>
      {/* The connector line sits behind the markers; the markers' fill masks it,
          leaving a continuous rail between steps. */}
      <ol className="relative mt-group">
        <span
          aria-hidden="true"
          className="absolute top-3.5 bottom-3.5 left-3.5 w-px -translate-x-1/2 bg-border"
        />
        {track.steps.map((step) => (
          <TrackStep key={step.order} step={step} />
        ))}
      </ol>
    </div>
  );
}

export function ParallelTimeline() {
  const [factoryTrack, siteTrack] = processTracks;
  return (
    <section className="ink-surface py-band">
      <div className="mx-auto w-full max-w-[75rem] px-4 sm:px-8">
        <div className="max-w-[68ch]">
          <h2 className="text-headline text-foreground">
            Two schedules, running side by side
          </h2>
          <p className="mt-stack text-body text-pretty">{parallelNote}</p>
        </div>

        <div className="mt-section">
          <ConcurrencyDiagram />
        </div>

        {/* The detail: two tracks, always two columns so the parallel never
            reads as a single sequence. The centre hairline is a real cell
            boundary (DESIGN.md § The Module Grid: "hairline rules land on cell
            boundaries … process steps step across cells"). .grid-modules is not
            used here on purpose — it collapses to one column below 48rem, which
            would destroy the concurrency the brief requires to survive narrow
            width. */}
        <div className="mt-section">
          <p className="text-label text-muted-foreground">
            The two columns below happen at the same time — not one after the other.
          </p>
          <div className="mt-group grid grid-cols-2 divide-x divide-border">
            <TrackColumn track={factoryTrack} />
            <TrackColumn track={siteTrack} />
          </div>
        </div>

        {/* The scope, restated in full sentences so it can never be read as a
            move-in date — straight from the sanctioned accessor. */}
        <div className="mt-section max-w-[68ch] border-t border-border pt-group">
          <p className="text-body text-pretty">{delivery.covers}</p>
          <p className="mt-stack text-body text-pretty text-muted-foreground">
            {delivery.customerSide}
          </p>
        </div>
      </div>
    </section>
  );
}
