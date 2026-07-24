import Link from "next/link";

import { RenderImage } from "@/components/render-image";
import { processTracks, parallelNote } from "@/content/process";

export function ProcessSection() {
  return (
    <section className="ink-surface">
      <div className="mx-auto w-full max-w-[90rem] px-4 py-band lg:px-8">
        <div className="grid gap-section lg:grid-cols-2 lg:gap-section">
          <div className="max-w-[65ch] space-y-stack">
            <h2 className="text-headline text-on-dark">How the schedule works</h2>
            <p className="text-body text-on-dark">{parallelNote}</p>
            <p className="text-body text-on-dark">
              <Link
                href="/how-it-works"
                className="underline underline-offset-4 hover:text-brass"
              >
                Read the full delivery process
              </Link>
            </p>
          </div>

          <div className="grid gap-group">
            {processTracks.map((track) => (
              <div key={track.id} className="space-y-stack">
                <h3 className="text-title text-on-dark">{track.title}</h3>
                <p className="text-body text-ink-muted-on-dark">{track.intro}</p>
                <ul className="space-y-inline">
                  {track.steps.map((step) => (
                    <li
                      key={step.order}
                      className="text-body text-on-dark"
                    >
                      {step.title}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-section">
          <div className="grid-modules">
            <RenderImage
              aspect="5:2"
              src="/images/context/process-fitout.png"
              alt="Visualisation of an urbanbricks module being fitted out in the factory."
              className="cell-span-3"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
