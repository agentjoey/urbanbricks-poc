/**
 * Analytics transport (C1-form + x2-analytics) — the ONLY module form code talks to.
 *
 * GA4 is gated behind cookie consent (PECR). The call surface is fixed:
 *   ANALYTICS_EVENTS and trackEvent(name, params?).
 *
 * Before gtag is available, events are held in a small in-memory queue. Once
 * the visitor consents and the GA loader initialises gtag, the queue flushes
 * and new events go straight through. Before consent, emitting an event is
 * still a safe no-op from the caller's perspective — no network, no storage,
 * no throw — ever.
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
    /** Hook the GA loader calls once gtag has been configured. */
    __ubAnalyticsReady?: () => void;
  }
}

const MAX_QUEUE_SIZE = 50;
const EVENT_QUEUE: Array<{ name: AnalyticsEventName; params?: AnalyticsParams }> = [];
let gtagReady = false;

function sendToGtag(name: AnalyticsEventName, params?: AnalyticsParams): void {
  if (typeof window === "undefined") return;
  try {
    window.dataLayer?.push({ event: name, ...params });
    window.gtag?.("event", name, params);
  } catch {
    // Analytics must never break the conversion path that carries it.
  }
}

function flushQueue(): void {
  while (EVENT_QUEUE.length > 0) {
    const item = EVENT_QUEUE.shift();
    if (item) sendToGtag(item.name, item.params);
  }
}

/** Called by the GA loader once gtag has been configured. */
function markGtagReady(): void {
  gtagReady = true;
  flushQueue();
}

if (typeof window !== "undefined") {
  window.__ubAnalyticsReady = markGtagReady;
}

export function trackEvent(name: AnalyticsEventName, params?: AnalyticsParams): void {
  if (typeof window === "undefined") return;
  try {
    if (gtagReady) {
      sendToGtag(name, params);
    } else if (EVENT_QUEUE.length < MAX_QUEUE_SIZE) {
      EVENT_QUEUE.push({ name, params });
    }
  } catch {
    // Analytics must never break the conversion path that carries it.
  }
}
