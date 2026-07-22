/**
 * render-image/type-tests.tsx — compile-time guards for the imagery red
 * lines. Never imported at runtime: it exists so `tsc` keeps proving the
 * enforcement works on every run. Every @ts-expect-error below MUST keep
 * erroring — if one stops being an error (a prop got added, alt got
 * optional), tsc fails here with "Unused '@ts-expect-error' directive".
 *
 * Red lines under test (DESIGN.md § Imagery policy, C3 spec):
 *  1. The "Visualisation" label cannot be suppressed, reworded, or reached
 *     from a call site — there is no prop for it.
 *  2. Alt text is required — a render without alt does not compile.
 *  3. Aspect ratios are the Module Grid set only — no "16:9".
 *  4. A stock context photograph must have a real src — stock may never be
 *     a pending placeholder pretending to exist.
 */
import { RenderImage, ContextPhoto } from "./render-image";

// ── Happy paths (must KEEP compiling — if these break, the guards above
//    them may be erroring for the wrong reason) ──

const okRender = <RenderImage src="/images/models/harbor-20-hero.png" alt="Visualisation of the Harbor 20." aspect="5:2" preload />;
const okPending = <RenderImage alt="Visualisation of the Harbor 20." aspect="3:2" />;
const okStacked = <RenderImage src="/images/models/meridian-stack-hero.png" alt="Visualisation of the Meridian Stack." aspect="stacked" />;
const okContext = <ContextPhoto src="/images/context/site.png" alt="A grassy rural plot bordered by birch trees." aspect="3:2" />;

// ── Red line 1: the label is not a prop ──

const suppressLabel = (
  // @ts-expect-error — there is no showLabel prop; the label is unconditional
  <RenderImage src="/x.png" alt="x" aspect="5:2" showLabel={false} />
);

const rewordLabel = (
  // @ts-expect-error — there is no label prop; the wording is fixed in the component
  <RenderImage src="/x.png" alt="x" aspect="5:2" label="" />
);

const hideCaption = (
  // @ts-expect-error — there is no caption prop either; no API surface reaches the label
  <ContextPhoto src="/x.png" alt="x" aspect="3:2" caption={null} />
);

// ── Red line 2: alt is required ──

const noAlt = (
  // @ts-expect-error — alt is required; a render without alt must not compile
  <RenderImage src="/x.png" aspect="5:2" />
);

const noAltContext = (
  // @ts-expect-error — alt is required on context photographs too
  <ContextPhoto src="/x.png" aspect="3:2" />
);

// ── Red line 3: aspect ratios are the Module Grid set only ──

const wrongAspect = (
  // @ts-expect-error — 16:9 is not a Module Grid ratio
  <RenderImage src="/x.png" alt="x" aspect="16:9" />
);

// ── Red line 4: stock photography must exist ──

const stockNoSrc = (
  // @ts-expect-error — ContextPhoto requires src; only renders may pend
  <ContextPhoto alt="A grassy plot." aspect="3:2" />
);

void okRender;
void okPending;
void okStacked;
void okContext;
void suppressLabel;
void rewordLabel;
void hideCaption;
void noAlt;
void noAltContext;
void wrongAspect;
void stockNoSrc;
