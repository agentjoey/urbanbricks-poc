import Link from "next/link";

import { site } from "@/content/site";
import {
  isUnverified,
  UNVERIFIED_BADGE_LABEL,
  type Unverified,
} from "@/lib/unverified";
import { NAV_ITEMS, QUOTE_CTA } from "@/components/site-header/nav-items";
import { Wordmark } from "@/components/site-header/wordmark";

/**
 * Development-only marker shown next to values still wrapped in unverified()
 * (spec §3, same convention as the C2 spec table) so unconfirmed facts cannot
 * be mistaken for verified ones during review. Rendered only in development.
 */
function UnverifiedBadge() {
  if (process.env.NODE_ENV !== "development") return null;
  return (
    <span className="ml-1 align-super text-[0.625rem] text-ink-muted-on-dark">
      [{UNVERIFIED_BADGE_LABEL}]
    </span>
  );
}

function ContactValue({ value }: { value: Unverified<string> }) {
  return (
    <>
      {value.value}
      {isUnverified(value) && <UnverifiedBadge />}
    </>
  );
}

/**
 * Site footer — an Ink Surface band, so every token comes from the mandatory
 * dark-surface counterparts (the Every-Surface Rule): On Dark text, Muted On
 * Dark secondary copy, Line On Dark hairlines, and the On Dark focus ring
 * (swapped automatically by the .ink-surface scope).
 */
export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="ink-surface">
      <div className="mx-auto w-full max-w-[90rem] px-4 py-16 min-[900px]:px-8">
        <div className="grid gap-12 min-[900px]:grid-cols-[1fr_auto_auto] min-[900px]:gap-24">
          <div>
            <Link href="/" aria-label="urbanbricks — home" className="inline-block text-on-dark">
              <Wordmark />
            </Link>
            <p className="mt-4 max-w-[45ch] text-body text-ink-muted-on-dark">
              {site.description}
            </p>
          </div>

          <nav aria-label="Footer">
            <h2 className="text-label text-ink-muted-on-dark">Explore</h2>
            <ul className="mt-4 space-y-3">
              {[...NAV_ITEMS, QUOTE_CTA].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-label text-on-dark underline-offset-4 hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-label text-ink-muted-on-dark">Contact</h2>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href={`mailto:${site.contact.email.value}`}
                  className="text-label text-on-dark underline-offset-4 hover:underline"
                >
                  <ContactValue value={site.contact.email} />
                </a>
              </li>
              <li>
                <a
                  href={`tel:${site.contact.phone.value.replace(/\s/g, "")}`}
                  className="text-label text-on-dark underline-offset-4 hover:underline"
                >
                  <ContactValue value={site.contact.phone} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-line-on-dark pt-8 min-[900px]:flex-row min-[900px]:items-center min-[900px]:justify-between">
          <p className="text-label text-ink-muted-on-dark">
            © {year} {site.name}
          </p>
          <Link
            href="/privacy"
            className="text-label text-ink-muted-on-dark underline-offset-4 hover:text-on-dark hover:underline"
          >
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
