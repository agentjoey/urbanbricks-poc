/**
 * Filter logic for /models — pure functions, no JSX, no client state.
 *
 * The whole browse-and-filter surface is URL-driven: the two facets (size and
 * use-case) live in the query string, and the page is a Server Component that
 * reads them from `searchParams` and filters the model list on the server. The
 * filter controls are therefore plain <Link>s, so filtering works with
 * JavaScript disabled — a click is a navigation, not a client state update. The
 * default render (`/models`, no params) lists every model, so nothing is gated
 * behind interactivity.
 *
 * PRODUCT.md § "One narrative, both segments": residential and commercial are
 * modelled as two values of one facet, never as a fork. Both appear in the same
 * grid and are served by the same controls.
 */
import { models, type Model, type ModelCategory, type UseCase } from "@/content/models";

/** The two query-string keys. Kept here so the page and the controls agree. */
export const SIZE_PARAM = "size";
export const USE_PARAM = "use";

interface FacetOption<T extends string> {
  value: T;
  label: string;
}

interface Facet<T extends string> {
  /** Query-string key. */
  param: string;
  /** Visible group label (not a heading — a group legend). */
  legend: string;
  options: readonly FacetOption<T>[];
}

/**
 * Size facet — the real container footprints (DESIGN.md § The Module Grid):
 * a single 20ft or 40ft module, or a multi-module build.
 */
export const SIZE_FACET: Facet<ModelCategory> = {
  param: SIZE_PARAM,
  legend: "Size",
  options: [
    { value: "20ft", label: "20ft module" },
    { value: "40ft", label: "40ft module" },
    { value: "multi-unit", label: "Multi-unit" },
  ],
};

/**
 * Use-case facet. Both segments carry equal weight (PRODUCT.md) — same control,
 * same ordering treatment, both mixed through the same grid.
 */
export const USE_FACET: Facet<UseCase> = {
  param: USE_PARAM,
  legend: "For",
  options: [
    { value: "residential", label: "Homes" },
    { value: "commercial", label: "Commercial" },
  ],
};

export interface ModelFilters {
  size: ModelCategory | null;
  use: UseCase | null;
}

const SIZE_VALUES = new Set<string>(SIZE_FACET.options.map((o) => o.value));
const USE_VALUES = new Set<string>(USE_FACET.options.map((o) => o.value));

/** searchParams values are `string | string[] | undefined`; take the first. */
function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Parse the raw searchParams into a validated filter state. Unknown or invalid
 * values are dropped (they degrade to "no filter") rather than throwing, so a
 * hand-edited or stale URL still renders the full grid instead of an error.
 */
export function parseFilters(
  searchParams: Record<string, string | string[] | undefined>,
): ModelFilters {
  const rawSize = first(searchParams[SIZE_PARAM]);
  const rawUse = first(searchParams[USE_PARAM]);
  return {
    size: rawSize && SIZE_VALUES.has(rawSize) ? (rawSize as ModelCategory) : null,
    use: rawUse && USE_VALUES.has(rawUse) ? (rawUse as UseCase) : null,
  };
}

/** Apply the active filters to the model list. */
export function filterModels(filters: ModelFilters): Model[] {
  return models.filter(
    (m) =>
      (filters.size === null || m.category === filters.size) &&
      (filters.use === null || m.useCase === filters.use),
  );
}

export function hasActiveFilters(filters: ModelFilters): boolean {
  return filters.size !== null || filters.use !== null;
}

/** The pathname the controls point at — the only route these filters live on. */
export const MODELS_PATH = "/models";

function toHref(filters: ModelFilters): string {
  const params = new URLSearchParams();
  if (filters.size) params.set(SIZE_PARAM, filters.size);
  if (filters.use) params.set(USE_PARAM, filters.use);
  const qs = params.toString();
  return qs ? `${MODELS_PATH}?${qs}` : MODELS_PATH;
}

/**
 * Href that TOGGLES `value` on the size facet against the current state,
 * preserving the use facet. Selecting the active value clears it — so every
 * chip is its own on/off exit, and there is always a way back to "all".
 */
export function toggleSizeHref(filters: ModelFilters, value: ModelCategory): string {
  return toHref({ ...filters, size: filters.size === value ? null : value });
}

/** Href that toggles `value` on the use facet, preserving the size facet. */
export function toggleUseHref(filters: ModelFilters, value: UseCase): string {
  return toHref({ ...filters, use: filters.use === value ? null : value });
}

/** Href that clears every filter — the empty-state and "clear all" exit. */
export const clearFiltersHref = MODELS_PATH;
