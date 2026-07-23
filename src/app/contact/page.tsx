import type { Metadata } from "next";

import { QuoteForm } from "@/components/quote-form/quote-form";
import { FACTORY_BUILD_TIME, site } from "@/content/site";
import { deliveryStatement } from "@/lib/delivery";
import { isUnverified, UNVERIFIED_BADGE_LABEL, type Unverified } from "@/lib/unverified";

export const metadata: Metadata = {
  title: "Get a quote",
  description:
    "Request a quote from urbanbricks. We reply within one working day with a line-by-line breakdown of what is included.",
  alternates: { canonical: "/contact" },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "/contact",
    siteName: site.name,
    title: "Get a quote",
    description:
      "Request a quote from urbanbricks. We reply within one working day with a line-by-line breakdown of what is included.",
  },
};

/**
 * Development-only marker shown next to values still wrapped in unverified()
 * (spec §3) so unconfirmed contact details cannot be mistaken for verified
 * ones during review.
 */
function DevBadge({ value }: { value: Unverified<unknown> }) {
  if (process.env.NODE_ENV !== "development" || !isUnverified(value)) return null;
  return (
    <span className="ml-1 align-super text-[0.625rem] text-ink-muted">
      [{UNVERIFIED_BADGE_LABEL}]
    </span>
  );
}

function ContactLink({ value, href }: { value: Unverified<string>; href: string }) {
  return (
    <a
      href={href}
      className="text-title text-brass-deep underline-offset-4 hover:underline"
    >
      {value.value}
      <DevBadge value={value} />
    </a>
  );
}

export default function ContactPage() {
  const delivery = deliveryStatement(FACTORY_BUILD_TIME);

  return (
    <div className="bg-background">
      <section className="mx-auto w-full max-w-[90rem] px-4 py-band min-[900px]:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-display">Get a quote</h1>
          <p className="mt-stack text-body text-ink-muted text-pretty">
            Tell us what you are building. We will reply with a line-by-line
            quote and a clear timeline.
          </p>
        </div>

        <div className="mx-auto mt-section max-w-2xl">
          <QuoteForm sourcePath="/contact" />
        </div>

        <div className="mt-band">
          <div className="grid-modules">
            <div>
              <h2 className="text-title">How to reach us</h2>
              <p className="mt-stack text-body text-ink-muted">
                Prefer to email or call? We are here.
              </p>
              <ul className="mt-stack space-y-stack">
                <li>
                  <ContactLink
                    value={site.contact.email}
                    href={`mailto:${site.contact.email.value}`}
                  />
                </li>
                <li>
                  <ContactLink
                    value={site.contact.phone}
                    href={`tel:${site.contact.phone.value.replace(/\s/g, "")}`}
                  />
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-title">What happens next</h2>
              <p className="mt-stack text-body text-ink-muted">
                We reply within one working day. The quote will list what is
                included, what sits on your side of the schedule, and the exact
                next step.
              </p>
              <p className="mt-stack text-body text-ink-muted">
                {delivery.covers} {delivery.customerSide}
              </p>
            </div>

            <div>
              <h2 className="text-title">Asking costs nothing</h2>
              <p className="mt-stack text-body text-ink-muted">
                A quote request commits you to nothing. It is the easiest way to
                get a real number and a named contact before you decide.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
