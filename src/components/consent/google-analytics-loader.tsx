"use client";

import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

/**
 * Loads gtag.js only after the visitor has granted analytics consent.
 *
 * The component renders nothing if NEXT_PUBLIC_GA_ID is missing, but the
 * environment file ships with a placeholder so the real path can be verified.
 * After the inline config script runs, it notifies the analytics transport
 * (src/lib/analytics.ts) that gtag is ready so any queued events flush.
 */
export function GoogleAnalyticsLoader() {
  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            'anonymize_ip': true,
            'cookie_flags': 'SameSite=Lax;Secure'
          });
          if (typeof window.__ubAnalyticsReady === 'function') {
            window.__ubAnalyticsReady();
          }
        `}
      </Script>
    </>
  );
}
