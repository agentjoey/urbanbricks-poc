/**
 * verify:db — smoke test for the f3-db data layer against the live database.
 *
 * Exercises the REAL request path: it imports the same typed client
 * (`src/db/index.ts`) that Server Actions will use — env guard included —
 * then proves, with SQL and row counts, that:
 *   1. a valid lead row inserts and reads back,
 *   2. the row deletes cleanly,
 *   3. a row missing a NOT NULL field is rejected by the database.
 *
 * SECURITY: this script never prints DATABASE_URL or any part of it. The
 * probe row uses obviously fake data and is deleted before exit.
 */
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function main() {
  // Dynamic imports so loadEnvConfig runs before src/db reads process.env.
  const { eq } = await import("drizzle-orm");
  const { db, leads } = await import("../src/db/index");

  let failures = 0;
  const check = (label: string, ok: boolean) => {
    console.log(`${ok ? "PASS" : "FAIL"}  ${label}`);
    if (!ok) failures += 1;
  };

  // --- 1. Insert a valid lead -------------------------------------------------
  const probe = {
    name: "Smoke Test (verify:db)",
    email: "verify-db@example.invalid",
    phone: null,
    country: "GB",
    modelSlug: "harbor-20",
    projectType: "residential",
    timeline: "exploring",
    budgetBand: "under-40k",
    message: "Automated smoke row — deleted by this script.",
    sourcePath: "/__verify-db__",
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    consentAt: new Date(),
  } as const;

  const insertQuery = db.insert(leads).values(probe);
  const { sql: insertSql, params: insertParams } = insertQuery.toSQL();
  console.log("\nINSERT SQL:", insertSql);
  console.log("INSERT params:", JSON.stringify(insertParams));

  const inserted = await insertQuery.returning({ id: leads.id });
  check(`insert returned ${inserted.length} row(s)`, inserted.length === 1);
  const id = inserted[0]!.id;

  // --- 2. Read it back ----------------------------------------------------------
  const selectQuery = db
    .select({
      id: leads.id,
      name: leads.name,
      email: leads.email,
      projectType: leads.projectType,
      timeline: leads.timeline,
      budgetBand: leads.budgetBand,
      modelSlug: leads.modelSlug,
      sourcePath: leads.sourcePath,
      consentAt: leads.consentAt,
      createdAt: leads.createdAt,
    })
    .from(leads)
    .where(eq(leads.id, id));
  console.log("\nSELECT SQL:", selectQuery.toSQL().sql);

  const readBack = await selectQuery;
  check(`select returned ${readBack.length} row(s)`, readBack.length === 1);
  if (readBack[0]) {
    console.log("row read back:", JSON.stringify(readBack[0]));
    check(
      "round-trip fields match (projectType/timeline/budgetBand/modelSlug)",
      readBack[0].projectType === probe.projectType &&
        readBack[0].timeline === probe.timeline &&
        readBack[0].budgetBand === probe.budgetBand &&
        readBack[0].modelSlug === probe.modelSlug,
    );
  }

  // --- 3. Delete it -------------------------------------------------------------
  const deleted = await db.delete(leads).where(eq(leads.id, id)).returning({ id: leads.id });
  check(`delete removed ${deleted.length} row(s)`, deleted.length === 1);

  const afterDelete = await db.select({ id: leads.id }).from(leads).where(eq(leads.id, id));
  check(`row gone after delete (${afterDelete.length} remaining)`, afterDelete.length === 0);

  // --- 4. NOT NULL enforcement ----------------------------------------------------
  console.log("\nNegative test: insert without required `name`");
  try {
    await db
      .insert(leads)
      // Deliberately bypass the TS type to reach the database constraint.
      .values({ email: "no-name@example.invalid", sourcePath: "/__verify-db__", consentAt: new Date() } as never)
      .returning({ id: leads.id });
    check("database rejected row missing NOT NULL `name`", false);
  } catch (error) {
    // drizzle wraps the driver error as `cause` — walk the whole chain so we
    // check (and show) the actual Postgres error, not just the wrapper.
    const messages: string[] = [];
    let current: unknown = error;
    while (current instanceof Error) {
      messages.push(current.message);
      current = current.cause;
    }
    const full = messages.join("\n--- cause ---\n");
    console.log("actual error:", full);
    check(
      "database rejected row missing NOT NULL `name` (23502)",
      full.includes("not-null constraint") && full.includes('"name"'),
    );
  }

  console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error("verify:db crashed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
