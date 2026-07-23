import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";

import { db, leads } from "@/db";
import type { Lead } from "@/db";
import { requireAdminSession } from "@/app/admin/actions";

/**
 * CSV export of all leads.
 *
 * Protected by the same app-level admin session as /admin/leads. The columns
 * match the leads table so the export is a complete dump of the personal data
 * this area holds.
 */

const CSV_COLUMNS: (keyof Lead)[] = [
  "id",
  "createdAt",
  "name",
  "email",
  "phone",
  "country",
  "modelSlug",
  "projectType",
  "timeline",
  "budgetBand",
  "message",
  "sourcePath",
  "utmSource",
  "utmMedium",
  "utmCampaign",
  "consentAt",
];

const CSV_HEADER = CSV_COLUMNS.join(",");

function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);

  // Neutralise spreadsheet formula triggers at the start of a cell.
  // Excel / Google Sheets / LibreOffice evaluate cells that begin with
  // =, +, -, @, tab or carriage return. A leading apostrophe forces the
  // cell to be treated as plain text (OWASP CSV Injection guidance).
  const needsFormulaGuard = /^[\t\r=+\-@]/.test(text);
  const safeText = needsFormulaGuard ? `'${text}` : text;

  if (/[",\n\r]/.test(safeText)) {
    return `"${safeText.replace(/"/g, '""')}"`;
  }
  return safeText;
}

function leadToRow(lead: Lead): string {
  return CSV_COLUMNS.map((col) => csvCell(lead[col])).join(",");
}

export async function GET() {
  try {
    await requireAdminSession();
  } catch {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let rows: Lead[];
  try {
    rows = await db.select().from(leads).orderBy(desc(leads.createdAt));
  } catch (error) {
    // Log the real error server-side; never expose raw SQL or connection
    // details in the response for this personal-data area.
    console.error(
      JSON.stringify({
        event: "admin_csv_query_failed",
        at: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
      }),
    );
    return new NextResponse("Could not generate CSV", { status: 500 });
  }

  const lines = [CSV_HEADER, ...rows.map(leadToRow)];
  const csv = lines.join("\r\n") + "\r\n";

  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="urbanbricks-leads-${date}.csv"`,
    },
  });
}
