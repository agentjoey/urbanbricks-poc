"use server";

/**
 * Quote form Server Action (C1-form) — the core conversion path.
 *
 * Defence order (cheapest and quietest first):
 *   1. Honeypot ("website") filled → silent fake success, nothing stored.
 *   2. Submit-timing trap via a signed cookie issued by middleware. Too fast
 *      (< 3s from the real page load) is a bot → silent fake success. A
 *      missing, forged, or too-old cookie fails closed with a clear reload
 *      message and the submitted values are returned so the visitor does not
 *      lose what they typed; a real visitor in that state just needs to refresh.
 *   3. zod re-validation (never trust the client — the schema is shared,
 *      but this pass is the one that counts). Errors on VISIBLE fields go
 *      back to the user; errors on HIDDEN fields (model_slug, utm_*,
 *      source_path) are the server's problem — the user cannot see or
 *      correct them, so the bad value is logged and dropped, never turned
 *      into a note-less "fix the form" dead end. A renamed model slug must
 *      cost the attribution, never the lead.
 *   4. Per-IP in-memory rate limit — checked AFTER validation so a user
 *      correcting errors never burns quota.
 *   5. DB insert. ANY failure here logs the complete submission as
 *      structured JSON to the runtime log and returns the fallback-email
 *      error — a lost lead is the most expensive defect in this project.
 *
 * Spam-trap successes are deliberately indistinguishable from real ones so
 * bots get no signal about which trap fired. The RESPONSE stays blind; the
 * SERVER does not — every trap rejection is logged (step 1/2) with enough
 * detail to recognise a false positive (e.g. a password manager autofilling
 * the honeypot), which would otherwise be invisible and unrecoverable.
 */
import "server-only";

import { cookies, headers } from "next/headers";

import { site } from "@/content/site";
import { COOKIE_NAME, QUOTE_COOKIE_SECRET, verifyIssueTime } from "@/lib/form-token";
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

/**
 * Maximum age of a quote-form cookie before we ask the visitor to reload.
 *
 * The 3-second MIN_FILL_TIME_MS floor is what catches bots. A low ceiling
 * previously destroyed real leads: the cookie was issued on the first page view
 * (which could be a model page browsed for minutes before the visitor opened the
 * form), and any submission after ten minutes wiped the form and told the user
 * to reload. Four hours is far beyond any plausible human fill time.
 */
const MAX_FORM_AGE_MS = 4 * 60 * 60 * 1000;

const FALLBACK_EMAIL = site.contact.email.value;

const STALE_COOKIE_MESSAGE =
  "This page has been open a while. Please reload the page and try again.";

function fakeSuccess(attempt: number): QuoteFormState {
  return { status: "success", attempt: attempt + 1 };
}

/** Structured server-side log line — one JSON object per runtime-log line. */
function logEvent(event: string, details: Record<string, unknown>) {
  console.warn(JSON.stringify({ event, at: new Date().toISOString(), ...details }));
}

/** Which fields arrived non-empty — presence only, no values. */
function filledFieldNames(formData: FormData): string[] {
  return [...formData.keys()].filter((key) => {
    const raw = formData.get(key);
    return typeof raw === "string" && raw.trim() !== "";
  });
}

/**
 * Trap rejections must stay indistinguishable from success in the RESPONSE
 * (a bot that learns which trap fired adapts), but the server has no reason
 * to be blind: a false positive — classically a password manager autofilling
 * the off-screen honeypot — is otherwise invisible and the lead lost without
 * a trace. Log the trap name, the triggering value, and which fields were
 * filled, so a real person caught here can be recognised and recovered.
 */
function rejectWithTrap(
  attempt: number,
  trap: "honeypot" | "timing",
  details: Record<string, unknown>,
): QuoteFormState {
  logEvent("quote_form_trap_rejected", { trap, ...details });
  return fakeSuccess(attempt);
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
  //    tabIndex -1); anything filled in here is a bot — OR a password
  //    manager / autofill false positive, which the log line exists to catch.
  const honeypot = formData.get("website");
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return rejectWithTrap(attempt, "honeypot", {
      honeypotValue: honeypot.slice(0, 200),
      filledFields: filledFieldNames(formData),
    });
  }

  // 2. Submit-timing trap via a signed cookie. Middleware issues the cookie
  //    on the GET that serves the page, so the timestamp is the real visit
  //    time even when the page is statically prerendered.
  //    - Too fast (< 3s) is a bot → silent fake success.
  //    - Missing, forged, or too-old (> 4 hours) cookie → fail closed with a
  //      reload message; a real visitor just needs to refresh.
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get(COOKIE_NAME);

  const issue = tokenCookie?.value
    ? await verifyIssueTime(QUOTE_COOKIE_SECRET, tokenCookie.value)
    : null;

  if (!issue) {
    return {
      status: "stale",
      attempt: attempt + 1,
      message: STALE_COOKIE_MESSAGE,
      values: submittedValues(formData),
    };
  }

  const ageMs = Date.now() - issue.issueTime;
  if (ageMs < MIN_FILL_TIME_MS) {
    return rejectWithTrap(attempt, "timing", {
      issueTime: issue.issueTime,
      ageMs,
      filledFields: filledFieldNames(formData),
    });
  }

  if (ageMs > MAX_FORM_AGE_MS) {
    return {
      status: "stale",
      attempt: attempt + 1,
      message: STALE_COOKIE_MESSAGE,
      values: submittedValues(formData),
    };
  }

  // 3. Server-side validation — the authoritative pass. Issues are split by
  //    who can act on them. A VISIBLE field's issue goes back to the user as
  //    a field note. An issue on a HIDDEN field (model_slug, utm_*,
  //    source_path) is the server's problem: the user cannot see or correct
  //    it, so asking them to fix it renders a banner with zero notes, zero
  //    aria-invalid and no focus target — a silent dead end that also loses
  //    the lead. Instead the bad hidden value is logged and dropped, and the
  //    (otherwise valid) submission proceeds with that attribution missing.
  const rawInput = Object.fromEntries(formData);
  let parsed = quoteFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<QuoteFormField, string>> = {};
    const hiddenIssues: { field: string; message: string; value: unknown }[] = [];
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field !== "string") continue;
      if ((QUOTE_FORM_FIELDS as readonly string[]).includes(field)) {
        if (fieldErrors[field as QuoteFormField] === undefined) {
          fieldErrors[field as QuoteFormField] = issue.message;
        }
      } else {
        const value = rawInput[field];
        hiddenIssues.push({
          field,
          message: issue.message,
          value: typeof value === "string" ? value.slice(0, 200) : null,
        });
      }
    }

    if (Object.keys(fieldErrors).length > 0) {
      // Visible problems the user CAN correct — report them. Any hidden-field
      // issues ride along in the log; once the visible fields pass, the
      // recovery path below handles the hidden ones on the resubmission.
      if (hiddenIssues.length > 0) {
        logEvent("quote_form_hidden_field_rejected", { issues: hiddenIssues });
      }
      return {
        status: "validation-error",
        attempt: attempt + 1,
        fieldErrors,
        message: "Some fields need attention — see the notes below.",
        values: submittedValues(formData),
      };
    }

    // Hidden fields only: log, drop the offending values, re-validate.
    logEvent("quote_form_hidden_field_rejected", {
      recovered: true,
      issues: hiddenIssues,
    });
    for (const { field } of hiddenIssues) {
      delete rawInput[field];
    }
    parsed = quoteFormSchema.safeParse(rawInput);
    if (!parsed.success) {
      // Every remaining field passed the first pass, so this should be
      // unreachable — but a lead is never lost to an assumption: log and
      // return the fallback-email error rather than a note-less banner.
      logEvent("quote_form_hidden_field_recovery_failed", {
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
      return {
        status: "error",
        attempt: attempt + 1,
        message:
          `We could not process your request just now — our team has been notified. ` +
          `Please email us directly at ${FALLBACK_EMAIL} and we will pick it up from there.`,
        values: submittedValues(formData),
      };
    }
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
