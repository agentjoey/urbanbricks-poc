/**
 * Verify that the two test submissions landed in Neon, then delete them.
 *
 * This script bypasses src/db/index.ts (which imports `server-only` and cannot
 * be loaded outside a Next.js server context) by building the same neon-http
 * client from the environment directly.
 *
 * Usage:
 *   npx tsx .pact/tasks/p5-contact-evidence/cleanup.ts p5-js-... p5-nojs-...
 */
import { loadEnvConfig } from "@next/env";
import { eq, or } from "drizzle-orm";

loadEnvConfig(process.cwd());

async function main() {
  const emails = process.argv.slice(2).filter((arg) => arg.includes("@"));
  if (emails.length === 0) {
    console.error("No test email addresses provided.");
    process.exit(1);
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const [{ neon }, { drizzle }, schema] = await Promise.all([
    import("@neondatabase/serverless"),
    import("drizzle-orm/neon-http"),
    import("../../../src/db/schema"),
  ]);

  const db = drizzle({ client: neon(databaseUrl), schema });

  const found = await db
    .select({ id: schema.leads.id, email: schema.leads.email })
    .from(schema.leads)
    .where(or(...emails.map((email) => eq(schema.leads.email, email))));

  const foundEmails = new Set(found.map((r) => r.email));
  const missing = emails.filter((email) => !foundEmails.has(email));

  if (missing.length > 0) {
    console.error(`Missing rows for: ${missing.join(", ")}`);
    process.exit(1);
  }

  const deleted = await db
    .delete(schema.leads)
    .where(or(...emails.map((email) => eq(schema.leads.email, email))))
    .returning({ id: schema.leads.id });

  console.log(`Verified and deleted ${deleted.length} test row(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
