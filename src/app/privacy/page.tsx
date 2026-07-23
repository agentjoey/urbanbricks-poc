import type { Metadata } from "next";
import Link from "next/link";

import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: `How ${site.name} collects, uses and stores your personal data, and the cookies this site uses.`,
  alternates: { canonical: "/privacy" },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "/privacy",
    siteName: site.name,
    title: "Privacy",
    description: `How ${site.name} collects, uses and stores your personal data, and the cookies this site uses.`,
  },
};

/**
 * Clear placeholder for facts that are genuinely unknown and must be confirmed
 * by the owner or legal adviser before launch. The brackets make the gap
 * unmistakable during review and prevent an invented period from slipping
 * into the legal copy.
 */
const RETENTION_PLACEHOLDER = "[RETENTION PERIOD — TO BE CONFIRMED BY LEGAL/OWNER]";

/** Hand-maintained date; update only when the policy content actually changes. */
const LAST_UPDATED = "2026-07-23";

function Section({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={`py-section ${className}`}>{children}</section>;
}

function Prose({ children }: { children: React.ReactNode }) {
  return <div className="max-w-[75ch] text-body">{children}</div>;
}

export default function PrivacyPage() {
  return (
    <div className="flex flex-col">
      {/* Intro */}
      <Section className="border-b border-line">
        <div className="mx-auto w-full max-w-[90rem] px-4 min-[900px]:px-8">
          <h1 className="text-display text-ink">Privacy notice</h1>
          <Prose>
            <p className="mt-stack text-ink-muted">
              This notice explains how {site.name} ({site.domain}) handles your
              personal data when you use the site or submit the quote form. It is
              written for visitors in the UK and overseas English-speaking markets
              and covers UK GDPR and PECR (the Privacy and Electronic Communications
              Regulations).
            </p>
            <p className="mt-stack text-ink-muted">
              {site.name} is the data controller for information submitted through
              this website. Our registered contact details are listed at the bottom
              of this page.
            </p>
          </Prose>
        </div>
      </Section>

      {/* What we collect */}
      <Section>
        <div className="mx-auto w-full max-w-[90rem] px-4 min-[900px]:px-8">
          <h2 className="text-headline text-ink">What we collect</h2>
          <Prose>
            <p className="mt-stack text-ink-muted">
              The quote form asks for the information we need to understand your
              project and follow up with a quote. We collect:
            </p>
            <ul className="mt-stack space-y-inline text-ink-muted">
              <li>Your name and email address (required).</li>
              <li>Your phone number and country (optional).</li>
              <li>
                Project details: whether the project is residential or commercial,
                your likely timeline, and your rough budget band.
              </li>
              <li>Any message you choose to add about the project.</li>
              <li>
                Which model page you were looking at, if any, and the page you
                submitted the form from.
              </li>
              <li>
                Any UTM campaign parameters in the link you arrived on, so we can
                understand which referrals are useful.
              </li>
              <li>The time you ticked the privacy-consent checkbox.</li>
            </ul>
            <p className="mt-stack text-ink-muted">
              We do <strong className="text-ink">not</strong> store your IP address
              or browser user-agent. They are personal data we do not need at this
              stage, so we deliberately do not collect them.
            </p>
          </Prose>
        </div>
      </Section>

      {/* Lawful basis */}
      <Section className="bg-surface-white">
        <div className="mx-auto w-full max-w-[90rem] px-4 min-[900px]:px-8">
          <h2 className="text-headline text-ink">Lawful basis for processing</h2>
          <Prose>
            <p className="mt-stack text-ink-muted">
              We rely on <strong className="text-ink">consent</strong> for the
              personal data you enter in the quote form. The consent checkbox is not
              pre-ticked, and you can withdraw consent at any time by contacting us.
            </p>
            <p className="mt-stack text-ink-muted">
              For the strictly necessary anti-bot cookie described below, we rely on{" "}
              <strong className="text-ink">legitimate interest</strong> in protecting
              the form from automated abuse. Because that cookie is essential for
              security and is not used for tracking or profiling, PECR does not
              require prior consent, but we still describe it here.
            </p>
          </Prose>
        </div>
      </Section>

      {/* Retention */}
      <Section>
        <div className="mx-auto w-full max-w-[90rem] px-4 min-[900px]:px-8">
          <h2 className="text-headline text-ink">How long we keep your data</h2>
          <Prose>
            <p className="mt-stack text-ink-muted">
              We keep quote-form submissions for {RETENTION_PLACEHOLDER} or until
              you ask us to delete them, whichever is sooner. Once the retention
              period ends, we delete or anonymise the records.
            </p>
          </Prose>
        </div>
      </Section>

      {/* Cookies */}
      <Section className="border-y border-line bg-surface-white">
        <div className="mx-auto w-full max-w-[90rem] px-4 min-[900px]:px-8">
          <h2 className="text-headline text-ink">Cookies</h2>
          <Prose>
            <p className="mt-stack text-ink-muted">
              This site uses the following cookies. We do not use any other
              first-party cookies on visitor-facing pages.
            </p>

            <div className="mt-group space-y-stack">
              <div>
                <h3 className="text-title text-ink">Quote-form timing token</h3>
                <p className="mt-inline text-ink-muted">
                  When you load a page that hosts the quote form, our middleware sets
                  a strictly functional cookie called{" "}
                  <code className="rounded-sm bg-line px-1 py-0.5 text-label text-ink">
                    ub_quote_issue
                  </code>
                  . It stores a signed timestamp so the form can detect bots that
                  submit instantly. The cookie is:
                </p>
                <ul className="mt-stack space-y-inline text-ink-muted">
                  <li>HttpOnly and Secure;</li>
                  <li>SameSite=Lax, path=/;</li>
                  <li>kept for up to 4 hours, then discarded.</li>
                </ul>
                <p className="mt-stack text-ink-muted">
                  It contains no personal data and is not used for analytics,
                  advertising, or tracking.
                </p>
              </div>

              <div>
                <h3 className="text-title text-ink">Admin authentication</h3>
                <p className="mt-inline text-ink-muted">
                  The internal staff area at{" "}
                  <code className="rounded-sm bg-line px-1 py-0.5 text-label text-ink">
                    /admin
                  </code>{" "}
                  sets a session cookie called{" "}
                  <code className="rounded-sm bg-line px-1 py-0.5 text-label text-ink">
                    ub_admin_session
                  </code>{" "}
                  only when an administrator successfully signs in. It is:
                </p>
                <ul className="mt-stack space-y-inline text-ink-muted">
                  <li>HttpOnly and Secure;</li>
                  <li>SameSite=Lax, path=/admin;</li>
                  <li>HMAC-signed (SHA-256) and valid for up to 8 hours;</li>
                  <li>scoped to the internal admin area, never set for visitors.</li>
                </ul>
                <p className="mt-stack text-ink-muted">
                  The cookie carries only a signed session token; it contains no
                  personal data and is not used for analytics, advertising, or
                  tracking.
                </p>
              </div>

              <div>
                <h3 className="text-title text-ink">Google Analytics</h3>
                <p className="mt-inline text-ink-muted">
                  We plan to use Google Analytics 4 to understand how visitors move
                  through the site. It is{" "}
                  <strong className="text-ink">consent-gated</strong>: Google
                  Analytics cookies and scripts are not loaded until you actively
                  consent to analytics cookies. Until then, no analytics data is
                  collected and no Google cookies are placed.
                </p>
              </div>
            </div>
          </Prose>
        </div>
      </Section>

      {/* Rights */}
      <Section className="ink-surface">
        <div className="mx-auto w-full max-w-[90rem] px-4 min-[900px]:px-8">
          <h2 className="text-headline text-on-dark">Your rights</h2>
          <Prose>
            <p className="mt-stack text-ink-muted-on-dark">
              Under UK GDPR you have the right to:
            </p>
            <ul className="mt-stack space-y-inline text-ink-muted-on-dark">
              <li>Ask what personal data we hold about you (access).</li>
              <li>Correct inaccurate or incomplete data (rectification).</li>
              <li>Ask us to delete your data (erasure).</li>
              <li>Restrict how we use your data while a request is resolved.</li>
              <li>Receive your data in a portable format.</li>
              <li>Object to processing based on legitimate interest.</li>
              <li>Withdraw consent at any time.</li>
            </ul>
            <p className="mt-stack text-ink-muted-on-dark">
              If you are unhappy with how we handle your data, you can also complain
              to the Information Commissioner&apos;s Office (ICO) at{" "}
              <a
                href="https://ico.org.uk"
                className="text-on-dark underline underline-offset-4 hover:text-brass"
                rel="noopener noreferrer"
                target="_blank"
              >
                ico.org.uk
              </a>
              .
            </p>
          </Prose>
        </div>
      </Section>

      {/* Contact */}
      <Section>
        <div className="mx-auto w-full max-w-[90rem] px-4 min-[900px]:px-8">
          <h2 className="text-headline text-ink">Contact us</h2>
          <Prose>
            <p className="mt-stack text-ink-muted">
              For any privacy question, to exercise your rights, or to withdraw
              consent, contact us at:
            </p>
            <ul className="mt-stack space-y-inline text-ink-muted">
              <li>
                Email:{" "}
                <a
                  href={`mailto:${site.contact.email.value}`}
                  className="text-ink underline underline-offset-4 hover:text-brass-deep"
                >
                  {site.contact.email.value}
                </a>
              </li>
              <li>
                Phone:{" "}
                <a
                  href={`tel:${site.contact.phone.value.replace(/\s/g, "")}`}
                  className="text-ink underline underline-offset-4 hover:text-brass-deep"
                >
                  {site.contact.phone.value}
                </a>
              </li>
            </ul>
            <p className="mt-stack text-ink-muted">
              We will respond as soon as we can, and within the timeframes set out in
              UK GDPR where they apply.
            </p>
            <p className="mt-stack text-ink-muted">
              Last updated: {LAST_UPDATED}.
            </p>
          </Prose>
        </div>
      </Section>

      {/* Quote CTA */}
      <Section className="border-t border-line bg-surface-white">
        <div className="mx-auto w-full max-w-[90rem] px-4 min-[900px]:px-8">
          <div className="max-w-[75ch]">
            <h2 className="text-headline text-ink">Ready to start a project?</h2>
            <p className="mt-stack text-body text-ink-muted">
              Request a quote and we will get back to you with a price band and next
              steps.
            </p>
            <div className="mt-group">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-md bg-brass px-8 py-4 text-label text-ink transition-colors duration-150 ease-out motion-reduce:transition-none hover:bg-brass-hover focus-visible:outline-ink"
              >
                Get a quote
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
