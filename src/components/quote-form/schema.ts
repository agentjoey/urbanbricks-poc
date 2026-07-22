/**
 * Quote form — shared zod schema and types (spec §4, C1-form).
 *
 * This module is imported by BOTH the client component (field metadata,
 * option lists, state type) and the Server Action (validation). It must
 * therefore stay free of server-only imports — do not import "server-only",
 * src/db, or anything env-dependent here.
 *
 * The server ALWAYS re-validates with this schema; the client uses it only
 * for option lists and error display. FormData arrives as strings (or null),
 * so every optional field starts with a normalising preprocess that turns
 * "" / null into undefined before the real check runs.
 */
import { z } from "zod";

import { models } from "@/content/models";

/** "", missing, or whitespace-only → undefined, so optional fields stay optional. */
function optionalText(max: number) {
  return z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().max(max).optional(),
  );
}

function optionalEnum<T extends readonly [string, ...string[]]>(values: T, error: string) {
  return z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.enum(values, error).optional(),
  );
}

export const PROJECT_TYPES = ["residential", "commercial"] as const;
export const TIMELINES = [
  "exploring",
  "6-12-months",
  "3-6-months",
  "1-3-months",
  "asap",
] as const;
export const BUDGET_BANDS = [
  "under-40k",
  "40k-60k",
  "60k-90k",
  "90k-120k",
  "over-120k",
] as const;

const modelSlugs = models.map((model) => model.slug) as [string, ...string[]];

export const quoteFormSchema = z.object({
  name: z
    .string({ error: "Enter your name." })
    .trim()
    .min(1, "Enter your name.")
    .max(100, "Name is too long."),
  email: z
    .email({ error: "Enter a valid email address." })
    .max(320, "Email address is too long."),
  phone: optionalText(40),
  country: optionalText(100),

  /** Set automatically when the form is embedded on a model page. */
  model_slug: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.enum(modelSlugs, "Unknown model.").optional(),
  ),

  /** The two intent instruments this POC exists to read — optional, never coerced. */
  project_type: optionalEnum(PROJECT_TYPES, "Choose a project type."),
  timeline: optionalEnum(TIMELINES, "Choose a timeline."),
  budget_band: optionalEnum(BUDGET_BANDS, "Choose a budget band."),

  message: optionalText(2000),

  /** Page the form was submitted from — rendered as a hidden input. */
  source_path: z.string().trim().min(1).max(500).catch("/unknown"),

  utm_source: optionalText(200),
  utm_medium: optionalText(200),
  utm_campaign: optionalText(200),

  /**
   * Privacy consent is mandatory (spec §4). A native checkbox submits the
   * string "on" when ticked and nothing at all otherwise, so a literal check
   * is exact. consent_at is stamped server-side on insert.
   */
  consent: z.literal("on", {
    error: "Please confirm you agree to us storing your details to respond.",
  }),
});

export type QuoteFormInput = z.input<typeof quoteFormSchema>;
export type QuoteFormData = z.output<typeof quoteFormSchema>;

/** Field keys a validation error can attach to (UI display order). */
export const QUOTE_FORM_FIELDS = [
  "name",
  "email",
  "phone",
  "country",
  "project_type",
  "timeline",
  "budget_band",
  "message",
  "consent",
] as const;
export type QuoteFormField = (typeof QUOTE_FORM_FIELDS)[number];

/**
 * The Server Action's return value, also consumed by useActionState on the
 * client. `values` carries the submitted strings back so the re-rendered
 * form (JS or progressive-enhancement path alike) repopulates its fields
 * instead of wiping them.
 */
export interface QuoteFormState {
  status: "idle" | "validation-error" | "success" | "error" | "rate-limited";
  /** Monotonic counter — remounts the form fields so defaultValue reapplies. */
  attempt: number;
  fieldErrors?: Partial<Record<QuoteFormField, string>>;
  /** Banner copy for the error / rate-limited states. */
  message?: string;
  /** Submitted values for repopulation on failure states. */
  values?: Record<string, string>;
}

export const initialQuoteFormState: QuoteFormState = {
  status: "idle",
  attempt: 0,
};

/**
 * Display labels for the select instruments. Timeline is listed cold → hot
 * (matching the enum declaration order in src/db/schema.ts) and worded so it
 * is easy to answer honestly — "Just exploring" is a first-class answer, not
 * an admission.
 */
export const PROJECT_TYPE_LABELS: Record<(typeof PROJECT_TYPES)[number], string> = {
  residential: "A home or annexe",
  commercial: "A business or commercial space",
};

export const TIMELINE_LABELS: Record<(typeof TIMELINES)[number], string> = {
  exploring: "Just exploring",
  "6-12-months": "6–12 months",
  "3-6-months": "3–6 months",
  "1-3-months": "1–3 months",
  asap: "As soon as possible",
};

export function budgetBandLabels(currencySymbol: string): Record<(typeof BUDGET_BANDS)[number], string> {
  return {
    "under-40k": `Under ${currencySymbol}40,000`,
    "40k-60k": `${currencySymbol}40,000 – ${currencySymbol}60,000`,
    "60k-90k": `${currencySymbol}60,000 – ${currencySymbol}90,000`,
    "90k-120k": `${currencySymbol}90,000 – ${currencySymbol}120,000`,
    "over-120k": `Over ${currencySymbol}120,000`,
  };
}
