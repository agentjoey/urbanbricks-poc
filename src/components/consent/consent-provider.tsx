"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  setConsentAndNotify,
  getConsentSnapshot,
  subscribeConsent,
} from "@/lib/consent";
import { ConsentBanner } from "./consent-banner";
import { GoogleAnalyticsLoader } from "./google-analytics-loader";

/**
 * Client-side consent gate.
 *
 * Renders nothing during SSR (server snapshot is always null), so the server
 * response is identical regardless of cookie state and the privacy-safe default
 * (no GA) is guaranteed. After hydration it reads the consent cookie via the
 * external-store pattern and either:
 *   - shows the banner (no choice yet),
 *   - loads GA (granted),
 *   - stays hidden (denied).
 */
export function ConsentProvider() {
  const consent = useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    () => null,
  );

  const handleAccept = useCallback(() => {
    setConsentAndNotify("granted");
  }, []);

  const handleReject = useCallback(() => {
    setConsentAndNotify("denied");
  }, []);

  return (
    <>
      {consent === "granted" && <GoogleAnalyticsLoader />}
      {consent === null && (
        <ConsentBanner onAccept={handleAccept} onReject={handleReject} />
      )}
    </>
  );
}
