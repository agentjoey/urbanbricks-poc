"use client";

/**
 * <QuoteForm> (C1-form) — the single quote form reused on /contact and
 * /models/[slug] (which passes modelSlug; the slug then travels as a hidden
 * input and the server validates it against the known models).
 *
 * Progressive enhancement: this is a client component for useActionState,
 * but the form is a plain HTML <form> whose fields are all NATIVE elements —
 * with JavaScript disabled the browser posts multipart to the Server Action
 * and the page re-renders with the returned state. That is why the selects
 * and the consent checkbox are native <select> / <input type="checkbox">
 * rather than the Radix primitives in components/ui: the Radix Select and
 * Checkbox render non-form markup that cannot be operated or submitted
 * without JS. Styling matches the DESIGN.md input spec by class instead.
 *
 * Validation is server-side only (noValidate): native bubbles and server
 * errors would be two different error UIs, and only the server one exists
 * without JS. `required` attributes stay for assistive technology.
 */
import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { CircleAlert, LoaderCircle } from "lucide-react";

import { submitQuote } from "@/app/actions/quote";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { site } from "@/content/site";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import {
  BUDGET_BANDS,
  budgetBandLabels,
  initialQuoteFormState,
  PROJECT_TYPE_LABELS,
  PROJECT_TYPES,
  TIMELINE_LABELS,
  TIMELINES,
  type QuoteFormField,
} from "./schema";

export interface QuoteFormProps {
  /** Page the form lives on — stored as leads.source_path. */
  sourcePath: string;
  /** Present on /models/[slug]; carried as a hidden input. */
  modelSlug?: string;
  /** Campaign attribution, forwarded as hidden inputs when present. */
  utm?: { source?: string; medium?: string; campaign?: string };
}

/** DESIGN.md § Inputs: white fill, 1px Stroke border, 4px radius, 14/16 padding. */
const fieldClasses =
  "h-auto w-full rounded-md border border-input bg-transparent px-4 py-3.5 text-base text-foreground transition-colors aria-invalid:border-destructive";

const budgetLabels = budgetBandLabels(site.currency.symbol);

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  // Never colour alone (DESIGN.md): destructive icon + foreground text that
  // names what to fix, associated via aria-describedby on the field.
  return (
    <p id={id} className="flex items-start gap-1.5 text-sm text-foreground">
      <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-destructive" />
      <span>{message}</span>
    </p>
  );
}

export function QuoteForm({ sourcePath, modelSlug, utm }: QuoteFormProps) {
  const [state, formAction, pending] = useActionState(submitQuote, initialQuoteFormState);



  // Analytics: quote_form_start once per mount, generate_lead once per
  // accepted submission. The shim is a no-op until x2-analytics wires GA.
  const startedRef = useRef(false);
  const trackedSuccessRef = useRef(-1);
  useEffect(() => {
    if (state.status === "success" && trackedSuccessRef.current !== state.attempt) {
      trackedSuccessRef.current = state.attempt;
      trackEvent(ANALYTICS_EVENTS.generateLead, {
        model_slug: modelSlug,
        source_path: sourcePath,
      });
    }
  }, [state, modelSlug, sourcePath]);

  function handleFirstFocus() {
    if (startedRef.current) return;
    startedRef.current = true;
    trackEvent(ANALYTICS_EVENTS.quoteFormStart, {
      model_slug: modelSlug,
      source_path: sourcePath,
    });
  }

  // After a server round-trip, move focus to the first invalid field. The
  // form remounts on every attempt (key below) so defaultValue reapplies —
  // without the remount React 19's form reset would wipe the user's input.
  const errors = state.fieldErrors ?? {};
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.status !== "validation-error") return;
    const firstInvalid = formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']");
    firstInvalid?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div role="status" className="rounded-md border border-input p-8">
        <p className="text-title flex items-center gap-2 text-success">
          <span aria-hidden="true">✓</span> Request received
        </p>
        <p className="mt-3 text-body text-foreground">
          Thank you — your request is in. We will reply to the email address you gave us,
          usually within one working day.
        </p>
      </div>
    );
  }

  const describedBy = (field: QuoteFormField) =>
    errors[field] ? `qf-${field}-error` : undefined;

  return (
    <form
      key={state.attempt}
      ref={formRef}
      action={formAction}
      noValidate
      aria-busy={pending || undefined}
      onFocusCapture={handleFirstFocus}
      className="flex flex-col gap-6"
    >
      {/* Failure banners — icon + text, never colour alone. */}
      {(state.status === "error" || state.status === "rate-limited" || state.status === "stale") && (
        <div role="alert" className="flex items-start gap-2 rounded-md border border-destructive p-4">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-destructive" />
          <p className="text-sm text-foreground">{state.message}</p>
        </div>
      )}
      {state.status === "validation-error" && (
        <div role="alert" className="flex items-start gap-2 rounded-md border border-destructive p-4">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-destructive" />
          <p className="text-sm text-foreground">{state.message}</p>
        </div>
      )}

      {modelSlug && (
        <p className="text-sm text-muted-foreground">
          You are asking about a specific model — it is included with your request.
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="qf-name" className="text-label">
            Name
          </Label>
          <Input
            id="qf-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            defaultValue={state.values?.name}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={describedBy("name")}
            className={fieldClasses}
          />
          <FieldError id="qf-name-error" message={errors.name} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="qf-email" className="text-label">
            Email
          </Label>
          <Input
            id="qf-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={state.values?.email}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={describedBy("email")}
            className={fieldClasses}
          />
          <FieldError id="qf-email-error" message={errors.email} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="qf-phone" className="text-label">
            Phone <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="qf-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            defaultValue={state.values?.phone}
            aria-invalid={errors.phone ? true : undefined}
            aria-describedby={describedBy("phone")}
            className={fieldClasses}
          />
          <FieldError id="qf-phone-error" message={errors.phone} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="qf-country" className="text-label">
            Country <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="qf-country"
            name="country"
            type="text"
            autoComplete="country-name"
            defaultValue={state.values?.country}
            aria-invalid={errors.country ? true : undefined}
            aria-describedby={describedBy("country")}
            className={fieldClasses}
          />
          <FieldError id="qf-country-error" message={errors.country} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="qf-project_type" className="text-label">
            What is the building for? <span className="text-muted-foreground">(optional)</span>
          </Label>
          <select
            id="qf-project_type"
            name="project_type"
            defaultValue={state.values?.project_type ?? ""}
            aria-invalid={errors.project_type ? true : undefined}
            aria-describedby={describedBy("project_type")}
            className={fieldClasses}
          >
            <option value="">Choose one…</option>
            {PROJECT_TYPES.map((value) => (
              <option key={value} value={value}>
                {PROJECT_TYPE_LABELS[value]}
              </option>
            ))}
          </select>
          <FieldError id="qf-project_type-error" message={errors.project_type} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="qf-timeline" className="text-label">
            When are you hoping to build? <span className="text-muted-foreground">(optional)</span>
          </Label>
          <select
            id="qf-timeline"
            name="timeline"
            defaultValue={state.values?.timeline ?? ""}
            aria-invalid={errors.timeline ? true : undefined}
            aria-describedby={describedBy("timeline")}
            className={fieldClasses}
          >
            <option value="">Choose one…</option>
            {TIMELINES.map((value) => (
              <option key={value} value={value}>
                {TIMELINE_LABELS[value]}
              </option>
            ))}
          </select>
          <FieldError id="qf-timeline-error" message={errors.timeline} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="qf-budget_band" className="text-label">
            Rough budget <span className="text-muted-foreground">(optional)</span>
          </Label>
          <select
            id="qf-budget_band"
            name="budget_band"
            defaultValue={state.values?.budget_band ?? ""}
            aria-invalid={errors.budget_band ? true : undefined}
            aria-describedby={describedBy("budget_band")}
            className={fieldClasses}
          >
            <option value="">Choose one…</option>
            {BUDGET_BANDS.map((value) => (
              <option key={value} value={value}>
                {budgetLabels[value]}
              </option>
            ))}
          </select>
          <FieldError id="qf-budget_band-error" message={errors.budget_band} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="qf-message" className="text-label">
          Anything we should know? <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="qf-message"
          name="message"
          rows={4}
          defaultValue={state.values?.message}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={describedBy("message")}
          className={fieldClasses}
        />
        <FieldError id="qf-message-error" message={errors.message} />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-3">
          <input
            id="qf-consent"
            name="consent"
            type="checkbox"
            required
            defaultChecked={state.values?.consent === "on"}
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={describedBy("consent")}
            className="mt-0.5 size-4 shrink-0 accent-brass"
          />
          <Label htmlFor="qf-consent" className="inline text-sm font-normal leading-relaxed">
            I agree to urbanbricks storing these details so the team can respond to my
            enquiry, as described in the <Link href="/privacy" className="underline">privacy notice</Link>.
          </Label>
        </div>
        <FieldError id="qf-consent-error" message={errors.consent} />
      </div>

      {/* Spam control: honeypot (invisible to humans). */}
      <div aria-hidden="true" className="absolute -left-[9999px] top-auto size-px overflow-hidden">
        <label htmlFor="qf-website">Website</label>
        <input
          id="qf-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <input type="hidden" name="source_path" value={sourcePath} readOnly />
      {modelSlug && <input type="hidden" name="model_slug" value={modelSlug} readOnly />}
      {utm?.source && <input type="hidden" name="utm_source" value={utm.source} readOnly />}
      {utm?.medium && <input type="hidden" name="utm_medium" value={utm.medium} readOnly />}
      {utm?.campaign && <input type="hidden" name="utm_campaign" value={utm.campaign} readOnly />}

      <div>
        <Button
          type="submit"
          disabled={pending}
          className={cn(
            "h-auto rounded-md px-8 py-4 text-label hover:bg-brass-hover",
            pending && "cursor-not-allowed opacity-70",
          )}
        >
          {pending && (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />
          )}
          {pending ? "Sending…" : "Request a quote"}
        </Button>
      </div>
    </form>
  );
}
