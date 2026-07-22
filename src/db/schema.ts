/**
 * Data layer — spec §4.
 *
 * The `leads` table is the whole point of the POC backend: every quote-form
 * submission lands here. `project_type` and `timeline` are modelled as
 * Postgres enums, not free text — they are the instruments that separate
 * "browsing" from "actually buying", and enums keep them queryable and
 * aggregable.
 *
 * Deliberately NOT stored (spec §4, EU/US market): IP address, user-agent.
 * They are personal data, useless at POC stage, and pure compliance burden.
 */
import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const projectTypeEnum = pgEnum("project_type", [
  "residential",
  "commercial",
]);

/**
 * Declared cold → hot: Postgres enums compare by declaration order, so
 * `timeline >= '3-6-months'` reads as "genuinely in-market".
 */
export const timelineEnum = pgEnum("timeline", [
  "exploring",
  "6-12-months",
  "3-6-months",
  "1-3-months",
  "asap",
]);

/**
 * Order-of-magnitude buckets in the site currency (src/content/site.ts).
 * Aligned with the model priceBands in models.ts (roughly 31k–118k). The
 * currency itself is still `unverified()`; if the confirmed currency changes
 * the magnitudes, re-cut the bands with a new migration.
 */
export const budgetBandEnum = pgEnum("budget_band", [
  "under-40k",
  "40k-60k",
  "60k-90k",
  "90k-120k",
  "over-120k",
]);

export const leads = pgTable("leads", {
  id: uuid().primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),

  // Required by spec §4.
  name: text().notNull(),
  email: text().notNull(),

  // Optional by spec §4.
  phone: text(),
  country: text(),

  /** Which model the lead came from; null when submitted from /contact. */
  modelSlug: text("model_slug"),

  /** The two intent instruments — see file header. */
  projectType: projectTypeEnum("project_type"),
  timeline: timelineEnum("timeline"),
  budgetBand: budgetBandEnum("budget_band"),

  message: text(),

  /** Page the form was submitted from — always known server-side. */
  sourcePath: text("source_path").notNull(),

  // Campaign attribution.
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),

  /**
   * When the submitter ticked the privacy-consent checkbox. NOT NULL because
   * consent is mandatory on the form (spec §4) — a row without a consent
   * timestamp must not be able to exist.
   */
  consentAt: timestamp("consent_at", { withTimezone: true, mode: "date" }).notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
