import { QuoteForm } from "@/components/quote-form/quote-form";

export function QuoteSection() {
  return (
    <section className="mx-auto w-full max-w-[90rem] px-4 pb-band pt-section lg:px-8">
      <div className="grid gap-section lg:grid-cols-2 lg:gap-section">
        <div className="max-w-[65ch]">
          <h2 className="text-headline text-ink">Ask us anything</h2>
          <p className="mt-stack text-body text-ink-muted">
            Tell us what you are planning and we will come back with clear
            answers — what is possible, what it costs, and what happens next.
          </p>
        </div>

        <div className="max-w-[45rem]">
          <QuoteForm sourcePath="/about" />
        </div>
      </div>
    </section>
  );
}
