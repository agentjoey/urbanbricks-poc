import type { MetadataRoute } from "next";
import { site } from "@/content/site";

const canonicalHost = `https://${site.domain}`;

/**
 * robots.txt — allow crawlers on all public routes, disallow the internal
 * staff area, and reference the sitemap.
 */
export default function robots(): MetadataRoute.Robots {
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
