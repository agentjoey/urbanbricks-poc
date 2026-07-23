import { desc } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { db, leads } from "@/db";
import type { Lead } from "@/db";
import {
  budgetBandLabels,
  TIMELINE_LABELS,
} from "@/components/quote-form/schema";
import { site } from "@/content/site";
import { logout, requireAdminSession } from "../actions";

/**
 * /admin/leads — password-gated lead list.
 *
 * - Proxy is the primary gate; requireAdminSession() is defence in depth.
 * - Leads are newest-first.
 * - Timeline and budget band are rendered as the intent signal.
 * - CSV export is a plain link to the /admin/leads/csv Route Handler.
 */

const currencySymbol = site.currency.symbol;
const budgetLabels = budgetBandLabels(currencySymbol);

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "UTC",
});

function formatDate(value: Date | null): string {
  if (!value) return "—";
  return dateFormatter.format(value);
}

function EmptyState() {
  return (
    <div className="border border-input bg-background p-8 text-center">
      <p className="text-title text-foreground">No leads yet</p>
      <p className="mt-2 text-body text-muted-foreground">
        Submissions from the quote form will appear here.
      </p>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="border border-destructive bg-background p-8">
      <p className="text-title text-destructive">Could not load leads</p>
      <p className="mt-2 text-body text-foreground">
        The leads list could not be loaded right now.
      </p>
      <p className="mt-4 text-body text-muted-foreground">
        Try refreshing the page. If the problem persists, check the database
        connection.
      </p>
    </div>
  );
}

function LeadTable({ rows }: { rows: Lead[] }) {
  return (
    <div className="overflow-x-auto border border-input bg-background">
      <table className="w-full min-w-[60rem] text-left">
        <thead className="border-b border-input bg-muted">
          <tr>
            <th scope="col" className="px-4 py-3 text-label text-muted-foreground">
              Received
            </th>
            <th scope="col" className="px-4 py-3 text-label text-muted-foreground">
              Name
            </th>
            <th scope="col" className="px-4 py-3 text-label text-muted-foreground">
              Email
            </th>
            <th scope="col" className="px-4 py-3 text-label text-muted-foreground">
              Timeline
            </th>
            <th scope="col" className="px-4 py-3 text-label text-muted-foreground">
              Budget
            </th>
            <th scope="col" className="px-4 py-3 text-label text-muted-foreground">
              Project type
            </th>
            <th scope="col" className="px-4 py-3 text-label text-muted-foreground">
              Model
            </th>
            <th scope="col" className="px-4 py-3 text-label text-muted-foreground">
              Source
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-input">
          {rows.map((lead) => (
            <tr key={lead.id}>
              <td className="px-4 py-3 text-body text-foreground">
                {formatDate(lead.createdAt)}
              </td>
              <td className="px-4 py-3 text-body font-medium text-foreground">
                {lead.name}
              </td>
              <td className="px-4 py-3 text-body text-foreground">
                <a
                  href={`mailto:${lead.email}`}
                  className="underline underline-offset-4 hover:text-brass-deep"
                >
                  {lead.email}
                </a>
              </td>
              <td className="px-4 py-3 text-body font-semibold text-brass-deep">
                {lead.timeline ? TIMELINE_LABELS[lead.timeline] : "—"}
              </td>
              <td className="px-4 py-3 text-body font-semibold text-brass-deep">
                {lead.budgetBand ? budgetLabels[lead.budgetBand] : "—"}
              </td>
              <td className="px-4 py-3 text-body text-foreground">
                {lead.projectType
                  ? lead.projectType.charAt(0).toUpperCase() +
                    lead.projectType.slice(1)
                  : "—"}
              </td>
              <td className="px-4 py-3 text-body text-foreground">
                {lead.modelSlug ?? "—"}
              </td>
              <td className="px-4 py-3 text-body text-foreground">
                {lead.sourcePath}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function AdminLeadsPage() {
  try {
    await requireAdminSession();
  } catch {
    redirect("/admin/login");
  }

  let rows: Lead[];
  try {
    rows = await db.select().from(leads).orderBy(desc(leads.createdAt));
  } catch (error) {
    // Log the real error server-side; never expose raw SQL or connection
    // details in the UI for this personal-data area.
    console.error(
      JSON.stringify({
        event: "admin_leads_query_failed",
        at: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
      }),
    );
    return (
      <AdminLeadsShell>
        <ErrorState />
      </AdminLeadsShell>
    );
  }

  return (
    <AdminLeadsShell>
      {rows.length === 0 ? <EmptyState /> : <LeadTable rows={rows} />}
    </AdminLeadsShell>
  );
}

function AdminLeadsShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[90rem] px-4 py-12 min-[900px]:px-8">
      <div className="flex flex-col gap-4 min-[900px]:flex-row min-[900px]:items-center min-[900px]:justify-between">
        <div>
          <h1 className="text-headline text-foreground">Leads</h1>
          <p className="mt-1 text-body text-muted-foreground">
            Quote-form submissions, newest first.
          </p>
        </div>
        <div className="flex flex-col gap-3 min-[900px]:flex-row min-[900px]:items-center">
          <Button
            asChild
            variant="secondary"
            className="h-auto rounded-md border border-input px-5 py-3 text-label"
          >
            <Link href="/admin/leads/csv" download>
              Export CSV
            </Link>
          </Button>
          <form action={logout}>
            <Button
              type="submit"
              variant="outline"
              className="h-auto w-full rounded-md border border-input px-5 py-3 text-label min-[900px]:w-auto"
            >
              Sign out
            </Button>
          </form>
        </div>
      </div>

      <div className="mt-8">{children}</div>
    </div>
  );
}
