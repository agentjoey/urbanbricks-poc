import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { models } from "@/content/models";

const canonicalHost = `https://${site.domain}`;

/**
 * Site-wide sitemap. Public routes only — /admin/* is excluded because it is
 * an internal staff area and must not be advertised to crawlers.
 *
 * /models/[slug] entries are generated from content/models.ts so the sitemap
 * stays in sync automatically when models are added or removed.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: canonicalHost,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${canonicalHost}/models`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${canonicalHost}/how-it-works`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${canonicalHost}/contact`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${canonicalHost}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${canonicalHost}/privacy`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  const modelRoutes: MetadataRoute.Sitemap = models.map((model) => ({
    url: `${canonicalHost}/models/${model.slug}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...modelRoutes];
}
