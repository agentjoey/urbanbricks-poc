/**
 * TEMPORARY probe route for c3-image — exercises every RenderImage /
 * ContextPhoto state on the real production render path. Deleted before
 * commit (route + public/probe-c3 assets).
 */
import { RenderImage, ContextPhoto } from "@/components/render-image";

export default function ProbeC3() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-headline">c3-image probe</h1>

      <section className="mt-8">
        <h2 className="text-title">Loaded — 5:2, preload (LCP path)</h2>
        <div id="state-loaded" className="mt-2">
          <RenderImage
            src="/probe-c3/render-5x2.png"
            alt="Probe visualisation of a modular home, 5:2 hero crop."
            aspect="5:2"
            preload
          />
        </div>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-title">Missing — no src, 3:2</h2>
          <div id="state-missing" className="mt-2">
            <RenderImage alt="Probe visualisation pending." aspect="3:2" sizes="50vw" />
          </div>
        </div>
        <div>
          <h2 className="text-title">Load failure — 404 src, 3:2</h2>
          <div id="state-error" className="mt-2">
            <RenderImage
              src="/probe-c3/does-not-exist.png"
              alt="Probe visualisation that fails to load."
              aspect="3:2"
              sizes="50vw"
            />
          </div>
        </div>
        <div>
          <h2 className="text-title">Loading — 4.8MB src, 4:3 (screenshot mid-flight)</h2>
          <div id="state-loading" className="mt-2">
            <RenderImage
              src="/probe-c3/big.png"
              alt="Probe visualisation that loads slowly."
              aspect="4:3"
              sizes="50vw"
            />
          </div>
        </div>
        <div>
          <h2 className="text-title">Stacked — 5/4.125</h2>
          <div id="state-stacked" className="mt-2">
            <RenderImage
              src="/probe-c3/stacked.png"
              alt="Probe visualisation of a stacked two-storey build."
              aspect="stacked"
              sizes="50vw"
            />
          </div>
        </div>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-title">Context photograph (stock) — 3:2</h2>
          <div id="state-context" className="mt-2">
            <ContextPhoto
              src="/probe-c3/context.png"
              alt="A grassy rural plot bordered by trees."
              aspect="3:2"
              sizes="50vw"
            />
          </div>
        </div>
        <div>
          <h2 className="text-title">Interior — 4:3</h2>
          <div className="mt-2">
            <RenderImage
              src="/probe-c3/render-4x3.png"
              alt="Probe visualisation of a modular home interior."
              aspect="4:3"
              sizes="50vw"
            />
          </div>
        </div>
      </section>

      <section className="ink-surface mt-8 p-8">
        <h2 className="text-title">On Ink Surface — dark-surface token swap</h2>
        <div id="state-dark" className="mt-2 grid grid-cols-1 gap-8 md:grid-cols-2">
          <RenderImage
            src="/probe-c3/render-3x2.png"
            alt="Probe visualisation on a dark band."
            aspect="3:2"
            sizes="50vw"
          />
          <RenderImage alt="Probe visualisation pending, dark band." aspect="3:2" sizes="50vw" />
        </div>
      </section>
    </main>
  );
}
