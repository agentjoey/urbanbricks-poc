import { SpecTable } from "@/components/spec-table";
import { warranty } from "@/content/process";
import { isUnverified, unverified } from "@/lib/unverified";

export function WarrantySection() {
  const rows = warranty.terms.map((term) => {
    const period = `${term.period.value.value} ${term.period.value.unit}`;
    const value = term.period.__unverified
      ? unverified(`${period} — ${term.covers}`, term.period.note ?? undefined)
      : `${period} — ${term.covers}`;

    return {
      label: term.label,
      value,
      accent: true,
    };
  });

  const responseDays = warranty.aftercare.responseWorkingDays;
  const responseText = `${responseDays.value} working days`;
  const response = responseDays.__unverified
    ? unverified(responseText, responseDays.note ?? undefined)
    : responseText;

  return (
    <section className="border-y border-line bg-surface-white">
      <div className="mx-auto w-full max-w-[90rem] px-4 py-section lg:px-8">
        <div className="grid gap-section lg:grid-cols-2 lg:gap-section">
          <div className="max-w-[65ch] space-y-stack">
            <h2 className="text-headline text-ink">What we put our name to</h2>
            <p className="text-body text-ink">{warranty.intro}</p>
            <p className="text-body text-ink">
              {warranty.aftercare.body} We aim to respond within{" "}
              {isUnverified(response) ? response.value : response}.
            </p>
          </div>

          <div>
            <SpecTable rows={rows} />
          </div>
        </div>
      </div>
    </section>
  );
}
