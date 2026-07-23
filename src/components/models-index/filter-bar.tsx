/**
 * FilterBar — the browse controls for /models.
 *
 * Every control is a <Link>, so filtering is a navigation and works with
 * JavaScript disabled (progressive enhancement — see filters.ts). Each chip
 * TOGGLES its value, so a chip is also its own exit, and a "Clear filters" link
 * appears whenever anything is active.
 *
 * State is never carried by colour alone (DESIGN.md § Contrast Floor): the
 * active chip is filled Ink with On-Dark text AND steps to weight 600 AND
 * carries `aria-current="true"`, so the selection survives for anyone who
 * cannot see the fill. Chips are interactive, so their resting boundary is
 * Stroke (3.37:1), never Line.
 */
import Link from "next/link";

import {
  SIZE_FACET,
  USE_FACET,
  clearFiltersHref,
  hasActiveFilters,
  toggleSizeHref,
  toggleUseHref,
  type ModelFilters,
} from "./filters";

// Concatenated by hand rather than via cn()/tailwind-merge: the custom
// `text-label` utility is a font-size token from @theme, which tailwind-merge
// misfiles as a text colour and would drop in favour of `text-ink` /
// `text-on-dark`. The active and inactive strings are mutually exclusive, so no
// merge is needed. (Same reasoning as site-header's nav links.)
const chipBase =
  "inline-flex items-center rounded-md px-3 py-2 text-label transition-colors duration-150 ease-out motion-reduce:transition-none";
const chipInactive = "border border-stroke bg-background text-ink hover:border-ink";
const chipActive = "border border-ink bg-ink font-semibold text-on-dark";

interface FacetGroupProps<T extends string> {
  id: string;
  legend: string;
  options: readonly { value: T; label: string }[];
  active: T | null;
  hrefFor: (value: T) => string;
}

function FacetGroup<T extends string>({
  id,
  legend,
  options,
  active,
  hrefFor,
}: FacetGroupProps<T>) {
  return (
    <div role="group" aria-labelledby={id} className="flex flex-col gap-stack">
      <span id={id} className="text-label text-muted-foreground">
        {legend}
      </span>
      <ul className="flex flex-wrap gap-inline">
        {options.map((option) => {
          const isActive = active === option.value;
          return (
            <li key={option.value}>
              <Link
                href={hrefFor(option.value)}
                aria-current={isActive ? "true" : undefined}
                className={`${chipBase} ${isActive ? chipActive : chipInactive}`}
              >
                {option.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function FilterBar({ filters }: { filters: ModelFilters }) {
  const anyActive = hasActiveFilters(filters);

  return (
    <section aria-label="Filter models" className="flex flex-col gap-group">
      <div className="flex flex-col gap-group min-[560px]:flex-row min-[560px]:gap-section">
        <FacetGroup
          id="filter-size"
          legend={SIZE_FACET.legend}
          options={SIZE_FACET.options}
          active={filters.size}
          hrefFor={(value) => toggleSizeHref(filters, value)}
        />
        <FacetGroup
          id="filter-use"
          legend={USE_FACET.legend}
          options={USE_FACET.options}
          active={filters.use}
          hrefFor={(value) => toggleUseHref(filters, value)}
        />
      </div>

      {anyActive && (
        <Link
          href={clearFiltersHref}
          className="self-start text-label text-brass-deep underline decoration-1 underline-offset-4 hover:decoration-2"
        >
          Clear filters
        </Link>
      )}
    </section>
  );
}
