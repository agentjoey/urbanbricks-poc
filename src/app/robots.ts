import type { MetadataRoute } from "next";
import { site } from "@/content/site";

const canonicalHost = `https://${site.domain}`;

/**
 * robots.txt.
 *
 * Indexing is OFF by default and only turns on when SITE_INDEXABLE === "true".
 * The site ships with placeholder facts (prices, specs, lead times wrapped in
 * unverified()); until those are confirmed, crawlers must not index the pages,
 * or search engines would surface fabricated numbers to real prospects. Flip
 * SITE_INDEXABLE to "true" in the environment once verify:content is clean.
 */
export default function robots(): MetadataRoute.Robots {
  const indexable = process.env.SITE_INDEXABLE === "true";

  if (!indexable) {
    // Block everything, everywhere, until the content is verified.
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin",
    },
    sitemap: `${canonicalHost}/sitemap.xml`,
    host: canonicalHost,
  };
}
