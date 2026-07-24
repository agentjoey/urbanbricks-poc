import { RenderImage } from "@/components/render-image";

export function CraftSection() {
  return (
    <section className="mx-auto w-full max-w-[90rem] px-4 py-section lg:px-8">
      <div className="grid gap-section lg:grid-cols-2 lg:gap-section">
        <div className="max-w-[65ch] space-y-stack">
          <h2 className="text-headline text-ink">How we build</h2>
          <p className="text-body text-ink">
            Every building starts as a steel-framed module, built to a fixed
            footprint so it can travel by lorry and be craned into place. The
            frame is insulated, clad and finished inside the factory — floors,
            kitchens, bathrooms, wiring and glazing all happen before delivery.
          </p>
          <p className="text-body text-ink">
            We use composite panel cladding for weather resistance and a calm,
            neutral exterior. Full-height glazing is set into the frame during
            fit-out, not cut in afterwards. The result is a building that reads
            as one finished object when it arrives.
          </p>
          <p className="text-body text-ink">
            The seam between modules is designed to stay visible where two are
            joined or stacked — not as a compromise, but as a clear statement of
            how the building is made.
          </p>
        </div>

        <div className="grid-modules">
          <RenderImage
            aspect="4:3"
            src="/images/context/craft-build.png"
            alt="Visualisation of a container building under construction in the factory."
            className="cell-span-2"
          />
          <RenderImage
            aspect="4:3"
            src="/images/context/craft-fitout.png"
            alt="Visualisation of an interior fit-out inside a container module."
            className="cell-span-2"
          />
        </div>
      </div>
    </section>
  );
}
