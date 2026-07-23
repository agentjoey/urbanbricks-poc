import { FACTORY_BUILD_TIME } from "@/content/site";
import { deliveryStatement } from "@/lib/delivery";

export function StorySection() {
  const delivery = deliveryStatement(FACTORY_BUILD_TIME);

  return (
    <section className="mx-auto w-full max-w-[90rem] px-4 py-section lg:px-8">
      <div className="grid gap-group lg:grid-cols-2 lg:gap-section">
        <div>
          <h2 className="text-headline text-ink">What we are building</h2>
        </div>
        <div className="max-w-[65ch] space-y-stack">
          <p className="text-body text-ink">
            urbanbricks makes modular buildings for homes and businesses —
            studios, family homes, bars, offices and cabins. The building is
            fabricated, fitted out and inspected under one roof, then delivered
            to your prepared site.
          </p>
          <p className="text-body text-ink">{delivery.covers}</p>
          <p className="text-body text-ink">{delivery.customerSide}</p>
          <p className="text-body text-ink">
            Running the two tracks side by side is what makes the schedule
            possible. It also means the factory time is a number we can stand
            behind, because it only covers the work we control.
          </p>
        </div>
      </div>
    </section>
  );
}
