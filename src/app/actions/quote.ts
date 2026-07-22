"use server";

/**
 * Quote form Server Action (C1-form) — the core conversion path.
 *
 * Defence order (cheapest and quietest first):
 *   1. Honeypot ("website") filled → silent fake success, nothing stored.
 *   2. Submit-timing trap (< 3s from render) → silent fake success.
 *   3. zod re-validation (never trust the client — the schema is shared,
 *      but this pass is the one that counts).
 *   4. Per-IP in-memory rate limit — checked AFTER validation so a user
 *      correcting errors never burns quota.
 *   5. DB insert. ANY failure here logs the complete submission as
 *      structured JSON to the runtime log and returns the fallback-email
 *      error — a lost lead is the most expensive defect in this project.
 *
 * Spam-trap successes are deliberately indistinguishable from real ones so
 * bots get no signal about which trap fired.
 */
import "server-only";

import { headers } from "next/headers";

import { site } from "@/content/site";
import { consumeRateLimit } from "@/lib/rate-limit";
import {
  QUOTE_FORM_FIELDS,
  quoteFormSchema,
  type QuoteFormField,
  type QuoteFormState,
} from "@/components/quote-form/schema";
import type { NewLead } from "@/db";

/** A submission faster than this was not filled in by a human. */
const MIN_FILL_TIME_MS = 3000;

const FALLBACK_EMAIL = site.contact.email.value;

function fakeSuccess(attempt: number): QuoteFormState {
  return { status: "success", attempt: attempt + 1 };
}

/** Submitted strings carried back so the re-rendered form repopulates. */
function submittedValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const field of [...QUOTE_FORM_FIELDS, "phone", "country", "model_slug"]) {
    const raw = formData.get(field);
    if (typeof raw === "string" && raw !== "") values[field] = raw;
  }
  return values;
}

export async function submitQuote(
  prevState: QuoteFormState,
  formData: FormData,
): Promise<QuoteFormState> {
  const attempt = prevState.attempt ?? 0;

  // 1. Honeypot. Real users never see this field (off-screen, aria-hidden,
  //    tabIndex -1); anything filled in here is a bot.
  const honeypot = formData.get("website");
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return fakeSuccess(attempt);
  }

  // 2. Submit-timing trap. rendered_at is stamped by the server at render;
  //    both clocks are the server's, so there is no skew to excuse. A missing
  //    or unparseable stamp means the POST was scripted around the form.
  const renderedAt = Number(formData.get("rendered_at"));
  if (!Number.isFinite(renderedAt) || Date.now() - renderedAt < MIN_FILL_TIME_MS) {
    return fakeSuccess(attempt);
  }

  // 3. Server-side validation — the authoritative pass.
  const parsed = quoteFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Partial<Record<QuoteFormField, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (
        typeof field === "string" &&
        (QUOTE_FORM_FIELDS as readonly string[]).includes(field) &&
        fieldErrors[field as QuoteFormField] === undefined
      ) {
        fieldErrors[field as QuoteFormField] = issue.message;
      }
    }
    return {
      status: "validation-error",
      attempt: attempt + 1,
      fieldErrors,
      message: "Some fields need attention — see the notes below.",
      values: submittedValues(formData),
    };
  }

  const data = parsed.data;

  // 4. Rate limit (after validation, so failed attempts are free).
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ipKey = forwardedFor || headerList.get("x-real-ip") || "unknown";
  const limit = consumeRateLimit(ipKey);
  if (!limit.allowed) {
    return {
      status: "rate-limited",
      attempt: attempt + 1,
      message:
        `You have sent several requests in a short time, so this one was not submitted. ` +
        `Please try again in about ${Math.ceil(limit.retryAfterSeconds / 60)} minutes, ` +
        `or email us directly at ${FALLBACK_EMAIL}.`,
      values: submittedValues(formData),
    };
  }

  // 5. DB write. The client module is imported lazily so that a failure at
  //    ANY point — missing env at import time or a rejected query — lands in
  //    the same catch and the lead is logged, never silently lost.
  const newLead = {
    name: data.name,
    email: data.email,
    phone: data.phone ?? null,
    country: data.country ?? null,
    modelSlug: data.model_slug ?? null,
    projectType: data.project_type ?? null,
    timeline: data.timeline ?? null,
    budgetBand: data.budget_band ?? null,
    message: data.message ?? null,
    sourcePath: data.source_path,
    utmSource: data.utm_source ?? null,
    utmMedium: data.utm_medium ?? null,
    utmCampaign: data.utm_campaign ?? null,
    consentAt: new Date(),
  } satisfies NewLead;

  try {
    const { db, leads } = await import("@/db");
    await db.insert(leads).values(newLead);
  } catch (error) {
    // Structured JSON to the runtime log — the complete submission, so the
    // lead can be recovered by hand. This is the fallback that makes a DB
    // outage an inconvenience instead of a lost customer.
    console.error(
      JSON.stringify({
        event: "quote_form_db_write_failed",
        at: new Date().toISOString(),
        submission: newLead,
        error: error instanceof Error ? error.message : String(error),
      }),
    );
    return {
      status: "error",
      attempt: attempt + 1,
      message:
        `We could not save your request just now — our team has been notified. ` +
        `Please email us directly at ${FALLBACK_EMAIL} and we will pick it up from there.`,
      values: submittedValues(formData),
    };
  }

  return { status: "success", attempt: attempt + 1 };
}
