import type { ReactNode } from "react";

/**
 * JSON-LD — render a schema.org object as a safe, server-side <script> block.
 *
 * Use this for every structured-data block so the serialization is consistent
 * and easy to grep for in verification.
 */
export function JsonLd<T extends Record<string, unknown>>({ data }: { data: T }): ReactNode {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * FAQPage structured data from the FAQ items shown on the homepage.
 */
export function faqPageJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  } as const;
}
