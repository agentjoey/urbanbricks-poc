/**
 * Analytics shim (C1-form) — the ONLY module form code talks to.
 *
 * GA4 itself is task x2-analytics and is gated behind cookie consent (PECR);
 * nothing here loads GA. This shim forwards events to whatever x2 wires up
 * (a window.dataLayer / gtag if present) and is otherwise a deliberate no-op,
 * so emitting events from the form is always safe — SSR included.
 *
 * Keep the call surface this small: trackEvent(name, params?). x2 replaces
 * the transport, not the call sites.
 */

export const ANALYTICS_EVENTS = {
  /** First focus into any quote-form field. */
  quoteFormStart: "quote_form_start",
  /** A quote submission was accepted by the server. */
  generateLead: "generate_lead",
  /** A model detail page (/models/[slug]) was viewed — carries model_slug. */
  viewModel: "view_model",
} as const;

export type AnalyticsEventName =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

export type AnalyticsParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(name: AnalyticsEventName, params?: AnalyticsParams): void {
  if (typeof window === "undefined") return;
  try {
    // Transport placeholder for x2-analytics: forward to GA if it is already
    // on the page (it will not be, until x2 lands the consent gate); silently
    // do nothing otherwise. No network, no storage, no throw — ever.
    window.dataLayer?.push({ event: name, ...params });
    window.gtag?.("event", name, params);
  } catch {
    // Analytics must never break the conversion path that carries it.
  }
}
