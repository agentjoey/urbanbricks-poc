import { site } from "@/content/site";

const slots = [
  {
    title: "Customer stories",
    why: "Case studies need a completed building and a customer willing to talk. We do not have either yet.",
    count: site.proof.caseStudies.length,
  },
  {
    title: "Testimonials",
    why: "We will not invent quotes. This space will show real customer feedback once it exists.",
    count: site.proof.testimonials.length,
  },
  {
    title: "Certifications",
    why: "Third-party certifications are not held yet. Any badge here would be decorative and misleading.",
    count: site.proof.certifications.length,
  },
  {
    title: "Delivered buildings",
    why: "We are not publishing a count until it represents real, signed-off deliveries.",
    count: site.proof.deliveredBuildings,
  },
] as const;

export function ProofSlotsSection() {
  return (
    <section className="mx-auto w-full max-w-[90rem] px-4 py-section lg:px-8">
      <div className="max-w-[65ch] space-y-stack">
        <h2 className="text-headline text-ink">Proof we do not have yet</h2>
        <p className="text-body text-ink">
          {site.name} is new, and we will not borrow credibility. The sections
          below are intentionally empty until real material exists.
        </p>
      </div>

      <div className="mt-section grid gap-stack sm:grid-cols-2 lg:grid-cols-4">
        {slots.map((slot) => (
          <div
            key={slot.title}
            className="border-t border-line pt-stack"
          >
            <h3 className="text-title text-ink">{slot.title}</h3>
            <p className="mt-inline text-body text-ink-muted">{slot.why}</p>
            <p className="mt-inline text-label text-ink-muted">
              {typeof slot.count === "number" && slot.count === 0
                ? "Slot empty."
                : slot.count === null
                  ? "Slot empty."
                  : null}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
