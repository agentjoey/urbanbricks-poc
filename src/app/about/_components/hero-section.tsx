import { RenderImage } from "@/components/render-image";
import { site } from "@/content/site";

export function HeroSection() {
  return (
    <section className="border-b border-line">
      <div className="mx-auto w-full max-w-[90rem] px-4 pb-section pt-24 lg:px-8 lg:pb-section lg:pt-32">
        <div className="max-w-[75ch]">
          <h1 className="text-display text-ink">About urbanbricks</h1>
          <p className="mt-stack max-w-[65ch] text-body text-ink-muted">
            {site.tagline}
          </p>
        </div>

        <div className="mt-section">
          <div className="grid-modules">
            <RenderImage
              aspect="5:2"
              alt="Visualisation of an urbanbricks modular building in daylight."
              className="cell-span-3"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
