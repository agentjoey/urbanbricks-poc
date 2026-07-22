/**
 * SpecTable — the signature component (DESIGN.md § Spec Table).
 *
 * A two-column definition list — label left in Muted Ink, value right in
 * Ink — separated by 1px Line rules. No zebra striping, no card wrapper,
 * no icons. Values carry `tabular-nums` so figures align down the column
 * (Schibsted Grotesk's tnum was verified at the binary level in f1).
 *
 * Surface handling is token-driven, not prop-driven: every colour below is
 * a semantic token that `.ink-surface` redefines (the Every-Surface Rule),
 * so the same markup is correct on white and on dark:
 *   - `text-muted-foreground` — Muted Ink on light, Muted On Dark on dark.
 *   - `text-foreground` — Ink on light, On Dark on dark.
 *   - `text-brass-deep` — Deep Brass on light; `.ink-surface` redefines
 *     `--brass-deep` to Brass (7.60:1) because Deep Brass fails on dark
 *     (2.66:1). Accent rows therefore swap automatically.
 *   - `divide-border` — Line on light, Line On Dark on dark.
 *
 * Accent rows (delivery window, price band) are the exception that earns
 * brass: the value renders at Title weight (600) in `text-brass-deep`.
 *
 * Delivery rows are a dedicated variant that takes the FactoryDelivery
 * itself and renders `deliveryStatement().short` inside the component — a
 * bare "30 days" can never be composed at a call site because the number
 * does not exist on the public surface of src/lib/delivery.ts.
 *
 * Values still wrapped in unverified() render a visible marker in
 * development (gated on NODE_ENV) so unconfirmed figures cannot be mistaken
 * for facts during review. The marker never appears in a production build.
 */
import { cn } from "@/lib/utils";
import { deliveryStatement, type FactoryDelivery } from "@/lib/delivery";
import {
  isUnverified,
  unverified,
  UNVERIFIED_BADGE_LABEL,
  type Unverified,
} from "@/lib/unverified";

/** A spec value is plain text — a formatted string or a bare number. */
export type SpecScalar = string | number;

export type SpecTableRow =
  | {
      label: string;
      /** Pass the Unverified<T> wrapper through untouched — the component unwraps it and renders the dev marker. */
      value: SpecScalar | Unverified<SpecScalar>;
      /** Price-band rows: value in Deep Brass at Title weight (DESIGN.md § Spec Table). Delivery uses the dedicated variant instead. */
      accent?: boolean;
    }
  | {
      label: string;
      /** Delivery rows take the FactoryDelivery itself; the component renders the self-scoping `.short` statement. */
      delivery: FactoryDelivery;
    };

/**
 * Format a spec value while preserving its unverified() wrapper — e.g.
 * appending units to a floor area. A wrapped value stays wrapped (same
 * note) so the dev marker still renders; a plain value stays plain.
 */
export function formatSpecValue<T extends SpecScalar>(
  value: T | Unverified<T>,
  format: (value: T) => string,
): string | Unverified<string> {
  if (isUnverified(value)) {
    return unverified(
      format(value.value as T),
      value.note ?? undefined,
    );
  }
  return format(value);
}

export interface SpecTableProps {
  rows: SpecTableRow[];
  className?: string;
}

export function SpecTable({ rows, className }: SpecTableProps) {
  // The unverified marker is a review aid, never production chrome. In a
  // production build NODE_ENV is "production" (next build / next start) and
  // the badge branch is gone from the rendered output.
  const devMode = process.env.NODE_ENV !== "production";

  return (
    <dl className={cn("divide-y divide-border", className)}>
      {rows.map((row) => {
        let text: SpecScalar;
        let note: string | null = null;
        let wrapped = false;
        if ("delivery" in row) {
          text = deliveryStatement(row.delivery).short;
        } else if (isUnverified(row.value)) {
          wrapped = true;
          text = row.value.value as SpecScalar;
          note = row.value.note;
        } else {
          text = row.value;
        }
        const accent = "delivery" in row || row.accent === true;

        return (
          <div
            key={row.label}
            className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-x-sm py-3.5"
          >
            <dt className="min-w-0 break-words text-label text-muted-foreground">
              {row.label}
            </dt>
            <dd
              className={cn(
                "min-w-0 break-words text-body tabular-nums",
                accent ? "font-semibold text-brass-deep" : "text-foreground",
              )}
            >
              {text}
              {devMode && wrapped && (
                <span
                  className="ml-2 inline-block rounded-sm border border-brass-deep px-1 text-label text-brass-deep"
                  title={note ?? undefined}
                >
                  {UNVERIFIED_BADGE_LABEL}
                </span>
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
