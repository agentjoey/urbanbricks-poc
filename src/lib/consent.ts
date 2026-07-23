/**
 * First-party consent preference cookie for analytics (PECR / UK GDPR).
 *
 * This is a plain preference cookie — it carries no personal data and is the
 * only cookie set for visitors before analytics consent is given. The value
 * is read client-side only so the server never needs to know the visitor's
 * choice; that keeps the default server response free of any analytics state.
 */

export const CONSENT_COOKIE_NAME = "ub_analytics_consent";

export type ConsentChoice = "granted" | "denied";
export type ConsentState = ConsentChoice | null;

const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;

/** Parse the consent cookie on the client. Returns null if unset or invalid. */
export function getConsentCookie(): ConsentState {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${CONSENT_COOKIE_NAME}=([^;]+)`),
  );
  const value = match?.[1];
  if (value === "granted" || value === "denied") return value;
  return null;
}

/** Persist the visitor's choice so the banner does not nag on reload. */
export function setConsentCookie(value: ConsentChoice): void {
  if (typeof document === "undefined") return;
  document.cookie = `${CONSENT_COOKIE_NAME}=${value};path=/;max-age=${ONE_YEAR_SECONDS};SameSite=Lax;Secure`;
}

// Small external store so consent state can be read via useSyncExternalStore
// without setState-in-effect, and banner/loader re-render on choice.
type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeConsent(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getConsentSnapshot(): ConsentState {
  return getConsentCookie();
}

export function setConsentAndNotify(value: ConsentChoice): void {
  setConsentCookie(value);
  listeners.forEach((listener) => listener());
}
