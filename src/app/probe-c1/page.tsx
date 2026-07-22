/**
 * TEMPORARY probe route for c1-form evidence — DELETE BEFORE COMMIT.
 * Hosts the real <QuoteForm> in its two surface contexts (light / ink-surface)
 * and with/without a model slug, so screenshots exercise the component on the
 * real render path. Query params: ?dark=1, ?model=1.
 */
import { QuoteForm } from "@/components/quote-form/quote-form";

export default async function ProbeC1Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const dark = params.dark === "1";
  const withModel = params.model === "1";

  const form = (
    <QuoteForm
      sourcePath="/probe-c1"
      modelSlug={withModel ? "harbor-20" : undefined}
    />
  );

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-headline">Quote form probe (c1)</h1>
      <p className="mt-2 mb-10 text-body text-muted-foreground">
        Temporary route for task c1-form — not part of the site.
      </p>
      {dark ? (
        <section className="ink-surface rounded-md p-8">{form}</section>
      ) : (
        form
      )}
    </main>
  );
}
