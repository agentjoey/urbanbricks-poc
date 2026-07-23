"use client";

/**
 * ViewModelTracker — fires the `view_model` analytics event once per model
 * detail view (P2-detail acceptance). It renders nothing.
 *
 * The event goes through the C1 analytics shim (src/lib/analytics.ts), which
 * is a deliberate no-op until x2-analytics wires GA behind cookie consent —
 * so this is safe to mount unconditionally, SSR included (trackEvent early
 * returns on the server). No GA is installed here.
 *
 * Fired from an effect, not render, so it runs exactly once after hydration
 * and never during prerender. Guarded by a ref against React 18 double-invoke
 * in development. Keyed on slug so a client-side navigation between two model
 * pages re-fires for the new slug.
 */
import { useEffect, useRef } from "react";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";

export function ViewModelTracker({ slug }: { slug: string }) {
  const firedFor = useRef<string | null>(null);
  useEffect(() => {
    if (firedFor.current === slug) return;
    firedFor.current = slug;
    trackEvent(ANALYTICS_EVENTS.viewModel, { model_slug: slug });
  }, [slug]);
  return null;
}
