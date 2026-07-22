# c3-image evidence

Component: `src/components/render-image/` (`render-image.tsx`, `type-tests.tsx`, `index.ts`).
Exports `RenderImage` (3D visualisations of urbanbricks designs) and
`ContextPhoto` (stock context photography — the Not-Ours Rule variant).

## How the label is made non-removable

The two label strings are module-private constants in `render-image.tsx`,
rendered unconditionally in a `<figcaption>` OUTSIDE the image box, so the
label is present in every state (loading / loaded / error / missing). There
is no prop that reaches the label — nothing to pass, override, or set false.

Honest limit (recorded in the component header too): the type system cannot
stop a page author hiding the caption with CSS (e.g. `[&_figcaption]:hidden`).
That remains a review-level red line per DESIGN.md Don'ts.

## Proof the label cannot be removed (compiler errors from a real attempt)

Temporary probe `src/components/render-image/probe-c3-suppress.tsx`
(deleted after the run) contained three suppression attempts. `npx tsc
--noEmit` exited 2 with:

```
src/components/render-image/probe-c3-suppress.tsx(4,72): error TS2322: Type '{ src: string; alt: string; aspect: "5:2"; showLabel: boolean; }' is not assignable to type 'IntrinsicAttributes & ImageShellProps'.
  Property 'showLabel' does not exist on type 'IntrinsicAttributes & ImageShellProps'.
src/components/render-image/probe-c3-suppress.tsx(5,72): error TS2322: Type '{ src: string; alt: string; aspect: "5:2"; label: string; }' is not assignable to type 'IntrinsicAttributes & ImageShellProps'.
  Property 'label' does not exist on type 'IntrinsicAttributes & ImageShellProps'.
src/components/render-image/probe-c3-suppress.tsx(6,26): error TS2741: Property 'alt' is missing in type '{ src: string; aspect: "5:2"; }' but required in type 'ImageShellProps'.
```

The same guards live permanently in `type-tests.tsx` as `@ts-expect-error`
probes (label suppression, label rewording, missing alt on both components,
non-Module-Grid aspect `"16:9"`, ContextPhoto without src) — tsc re-proves
them on every run; a weakened API fails with "Unused '@ts-expect-error'
directive".

## Screenshots (real production build, real Chrome 150 headless via CDP)

Probe route `src/app/probe-c3` (deleted after the run, together with
`public/probe-c3/*` assets) rendered through the real RSC → client pipeline.
Because four workers share one `.next` and kept invalidating each other's
builds (a CSS chunk 500'd mid-screenshot — the served HTML was stale against
a rebuilt `.next`), the screenshots were taken from a clonefile copy of the
tree at `/tmp/c3-probe` (same sources, `pnpm build` + `next start`, port
3413); the copy was deleted after the run.

- `01-loading-throttled.png` — CDP network throttling (200 kb/s, cache
  disabled) with a 4.8 MB source image mid-flight: the 4:3 slot shows the
  bordered "Loading visualisation…" placeholder WITH the mandatory label.
  Also visible: missing ("Visualisation pending") and load-failure
  ("Visualisation unavailable") placeholders, each labelled.
- `02-settled-full.png` — settled page: loaded 5:2 hero (preload) with
  label; 3:2 missing and error placeholders at correct ratio; stacked
  5/4.125; 4:3 interior; ContextPhoto with "Context photograph — not an
  urbanbricks building." label.
- `04-dark-surface.png` — both variants inside an `.ink-surface` band:
  placeholder border uses `border-border` (→ Line On Dark, not the ~14:1
  near-white Line — caught and fixed after the first screenshot round),
  caption in Muted On Dark, labels fully legible.

SSR HTML check (production server, `curl`): 8× "Visualisation — not a
photograph of a delivered building." + 1× "Context photograph — not an
urbanbricks building." = 9 `<figcaption>` for 9 instances — the label is in
the server-rendered HTML, not added by a client effect. All `<img>` elements
carry full `_next/image` srcsets and `sizes`; the preload instance emits a
`<link rel="preload">`.

## next/image modern formats (real optimizer endpoint)

`next.config.ts` sets `images.formats: ["image/avif", "image/webp"]` (Next 16
default is WebP only). Verified against `/_next/image?url=...&w=1200&q=75`
on the production server with real Accept headers:

```
Accept: image/avif,image/webp,image/*  →  content-type image/avif   3235B  (optimizer-avif.avif: "ISO Media, AVIF Image")
Accept: image/webp,image/*             →  content-type image/webp   6818B  (optimizer-webp.webp: "RIFF ... Web/P image, VP8 ... 1200x800")
Accept: image/png                      →  content-type image/png (source format passthrough)
```

Missing source file → optimizer 400 → browser `onerror` → error placeholder
(the "Load failure" screenshot state).

## API notes

- Aspect ratios: `"5:2"` → `aspect-module`, `"3:2"` → `aspect-3/2`, `"4:3"` →
  `aspect-4/3`, `"stacked"` → `aspect-module-stacked` (Module Grid tokens
  where they exist; nothing added to globals.css).
- LCP: `preload?: boolean` (Next 16 deprecates `priority` in favour of
  `preload` — verified in node_modules/next/dist/docs and
  get-img-props.d.ts).
- `alt` required on both components. `src` optional only on RenderImage
  (renders do not exist yet — pending placeholder); ContextPhoto requires a
  real src.
- Props spread cleanly from f2's `ModelImageSlot` ({ src, alt, aspect }).
- Placeholders are a bordered box with words in surface tokens — never a
  coloured panel, gradient block, or CSS illustration (DESIGN.md § Imagery).
- Fade-in on load is `motion-safe:` only — reduced-motion users get an
  instant swap.

## Gates (final tree state, probe deleted)

- `npx tsc --noEmit` — PASS full tree (0 errors; during the session sibling
  WIP files had errors, all since fixed by their owners — c3 files were
  clean throughout).
- `pnpm lint` — 0 errors; 1 warning in `scripts/probe-c1-cdp.mjs` (c1's
  probe script, not c3). `eslint src/components/render-image next.config.ts`
  — clean.
- `pnpm build` — PASS.
- `pnpm verify:contrast` — ALL PASS.
- `pnpm verify:content` — exit 1 with the same 47 unverified values as the
  f2-accepted baseline (expected, not a regression; c3 touched no content).

## Not verified

- Cross-browser (Firefox/Safari) — same follow-up status as f1.
- No page consumes the component yet (p1–p6 tasks); the "real path" here is
  the component itself through the production RSC/client/optimizer pipeline,
  which is as far as c3's scope reaches.
