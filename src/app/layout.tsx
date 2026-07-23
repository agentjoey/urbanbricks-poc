import type { Metadata } from "next";
import { Archivo, Schibsted_Grotesk } from "next/font/google";
import { FACTORY_BUILD_TIME, site } from "@/content/site";
import { deliveryStatement } from "@/lib/delivery";
import { SiteHeader } from "@/components/site-header/site-header";
import { SiteFooter } from "@/components/site-footer/site-footer";
import { ConsentProvider } from "@/components/consent/consent-provider";
import "./globals.css";

// Display face (DESIGN.md § Typography): Archivo with its variable `wdth` axis
// requested explicitly — without `axes: ["wdth"]` the font ships at normal width
// and the width-contrast hierarchy disappears. The expanded rendering
// (font-stretch: 125%) is applied in globals.css.
//
// `fallback` is deliberately omitted on both faces. With it omitted, THIS
// build has next/font emit its own metric-adjusted fallback faces
// ("Archivo Fallback", "Schibsted Grotesk Fallback" — local Arial with
// ascent/descent/line-gap overrides and Next's precalculated size-adjust)
// and sets each CSS variable to the real family immediately followed by that
// adjusted face (verified in the production CSS: --font-schibsted resolves to
// "Schibsted Grotesk", "Schibsted Grotesk Fallback"). Passing `fallback: [...]`
// would instead bake generic families into the variable and push the adjusted
// face behind `sans-serif`, where it is unreachable — a generic always
// matches, so anything after it is dead.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

// Body face: Schibsted Grotesk. The spec table depends on its tabular figures
// (`tnum`) — verified working at the binary level on the served woff2 (all ten
// tabular digits at one advance width, spread 0; see .pact/tasks/f1-tokens-evidence/).
const schibstedGrotesk = Schibsted_Grotesk({
  variable: "--font-schibsted",
  subsets: ["latin"],
});

// Canonical host (spec: urbanbricks.uk). Per-page canonical URLs, sitemap and
// OG images are task x1-seo — this is only the site-wide default.
const canonicalHost = `https://${site.domain}`;

// The default title carries the delivery figure through the sanctioned
// accessor — every string deliveryStatement() returns is self-scoping
// ("Built in 30 days in our factory"), never a bare number.
// Indexing is off until the placeholder facts are verified and SITE_INDEXABLE
// is set to "true" (see src/app/robots.ts for the rationale). This meta tag is
// the stronger, per-page signal that backs up robots.txt — a search engine may
// index a URL it discovers elsewhere despite a robots.txt Disallow, but
// `noindex` here keeps it out of results regardless.
const siteIndexable = process.env.SITE_INDEXABLE === "true";

export const metadata: Metadata = {
  metadataBase: new URL(canonicalHost),
  robots: siteIndexable ? undefined : { index: false, follow: false },
  title: {
    default: `${site.name} — ${deliveryStatement(FACTORY_BUILD_TIME).headline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: canonicalHost,
    siteName: site.name,
    title: `${site.name} — ${deliveryStatement(FACTORY_BUILD_TIME).headline}`,
    description: site.description,
  },
};

// Root-level Organization structured data. Only confirmed facts: the name,
// the domain, and brand-voice description copy. Contact details are still
// unverified() and are deliberately not published as machine-readable fact.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  url: canonicalHost,
  description: site.description,
} as const;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${archivo.variable} ${schibstedGrotesk.variable}`}>
      <body className="flex min-h-dvh flex-col">
        {/* Skip link: visually hidden until focused, then a solid ink pill.
            The ring is forced to On Dark because the pill sits on an ink fill —
            an ink ring there would measure 1.06:1 (the Every-Surface Rule). */}
        <a
          href="#content"
          className="absolute top-4 left-4 z-[100] -translate-y-[300%] rounded-md bg-ink px-4 py-3 text-label text-on-dark transition-transform duration-150 ease-out motion-reduce:transition-none focus:translate-y-0 focus-visible:outline-on-dark"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="content" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {/* Consent-gated analytics (x2-analytics): client-only, default-off. */}
        <ConsentProvider />
      </body>
    </html>
  );
}
