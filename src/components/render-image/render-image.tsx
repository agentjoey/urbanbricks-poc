/**
 * render-image — the labelled imagery components (DESIGN.md § Imagery policy).
 *
 * urbanbricks has no photographs of its own completed buildings, so product
 * imagery is 3D visualisation and every render carries a persistent visible
 * label: "Visualisation — not a photograph of a delivered building." Stock
 * photography is context only (the Not-Ours Rule): it may never be presented
 * as an urbanbricks building, so it carries its own persistent label.
 *
 * Enforcement is structural, not conventional:
 *  - The label strings are module-private constants, rendered unconditionally
 *    inside this file. They are NOT props, so there is nothing to pass,
 *    override, or set to false — a call site attempting `showLabel={false}`
 *    or `label="…"` fails type-checking (proven permanently in type-tests.tsx).
 *  - `className` is NOT a string. It is a closed union of Module Grid
 *    cell-span classes — the only layout input a call site legitimately
 *    needs. That union blocks the prop-level escape route: a call site
 *    cannot pass `className="[&_figcaption]:hidden"` because it will not
 *    type-check (DESIGN.md:101 — "not removable by a page author"; :293 —
 *    "don't strip the Visualisation label off a render"). It does NOT block
 *    an author from wrapping the component in a div that hides the caption.
 *    Some Tailwind idioms can be defeated inside this file by hardening the
 *    <figcaption> (`block!`, `visible!`, `opacity-100!`, `text-label!`,
 *    `not-sr-only!`, `text-muted-foreground!`): descendant-selectors such as
 *    `[&_figcaption]:hidden`, `[&_figcaption]:invisible`,
 *    `[&_figcaption]:text-[0px]`, `[&_figcaption]:sr-only`, and
 *    `[&_figcaption]:text-transparent` cannot suppress the label. Idioms
 *    that act on the whole subtree (ancestor `hidden`, `sr-only`,
 *    `opacity-0`, etc.) cannot be defeated by child CSS. They are caught by
 *    `verify:image-label`, which maintains a closed allowlist of safe
 *    ancestor class tokens rather than enumerating bad ones. Any class on an
 *    ancestor of a labelled image that is not on the allowlist is rejected at
 *    build time with file and line. Honest limits: it only reads static
 *    className strings (literals and cn/clsx/classNames arguments it can
 *    parse); it follows an element hoisted into a same-file variable and the
 *    root of a same-file wrapper component, but it does not cross file
 *    boundaries, descend into props/state-built classNames, or see runtime
 *    expressions, inline styles, or injected <style> blocks. The escape
 *    hatch `data-image-label-exempt` is greppable for legitimate exceptions.
 *  - Both labels are required by DESIGN.md to be visible in EVERY state, so
 *    the <figcaption> sits outside the image box and renders whether the
 *    image is loading, loaded, failed, or not yet provided.
 *  - Alt text is a required prop — a render without alt does not compile.
 *  - Visibility never depends on JavaScript. SSR ships the image fully
 *    opaque with no overlay; the loading placeholder and fade-in are armed
 *    only after hydration, and only while the image is still loading. With
 *    scripts disabled — or hydration failed — the image, caption, and
 *    pending/error placeholders are simply there. The fade enhances an
 *    already-visible default; it never gates it.
 *
 * Missing imagery is NEVER replaced by a coloured panel, gradient block, or
 * CSS illustration (DESIGN.md § Imagery policy) — the placeholder states
 * below are a labelled, bordered box at the correct aspect ratio, in surface
 * tokens, with words.
 *
 * Aspect ratios come from the Module Grid (DESIGN.md § The Module Grid):
 * 5:2 (base cell, heroes), 3:2 (grid cards), 4:3 (interiors), and "stacked"
 * (two cells plus one gutter, 5/4.125 — derived from --module-gap-ratio).
 */

"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Module-private. Never exported, never a prop — this is what makes the
 *  label non-removable at the type level. */
const RENDER_LABEL = "Visualisation — not a photograph of a delivered building.";
const CONTEXT_LABEL = "Context photograph — not an urbanbricks building.";
/** POC placeholder imagery: a licensed stock photo standing in for a product
 *  shot until real renders/photography exist. Its label is deliberately blunt
 *  — it is NOT an urbanbricks build and must be replaced before the site is
 *  shown to real prospects (Human Owner decision, "1+2" plan). Module-private
 *  like the others: non-removable at the type level. */
const REFERENCE_LABEL = "Reference image — not an urbanbricks build. Placeholder pending final artwork.";

export type RenderAspect = "5:2" | "3:2" | "4:3" | "stacked";

/** Aspect utilities: the 5:2 and stacked ratios are Module Grid tokens from
 *  globals.css (`aspect-module`, `aspect-module-stacked`); 3:2 and 4:3 are
 *  plain ratio utilities. */
const ASPECT_CLASS: Record<RenderAspect, string> = {
  "5:2": "aspect-module",
  "3:2": "aspect-3/2",
  "4:3": "aspect-4/3",
  stacked: "aspect-module-stacked",
};

/** The ONLY classes a call site may add, applied to the outer <figure>:
 *  whole-cell spans from the Module Grid (globals.css). A closed union —
 *  not `string` — so a Tailwind arbitrary variant that reaches the caption
 *  (`"[&_figcaption]:hidden"`) fails type-checking. Anything else a layout
 *  needs is added here deliberately, in this file. */
export type RenderImageClassName = "cell-span-2" | "cell-span-3";

interface ImageShellProps {
  /**
   * Path under /public (e.g. from ModelImageSlot). Optional on RenderImage:
   * final renders do not exist yet (docs/render-prompts.md is with Human
   * Owner), and an omitted src renders the labelled "pending" placeholder.
   * Required on ContextPhoto — a stock photograph must actually exist.
   */
  src?: string;
  /** Required. Renders and context photographs are never decorative. */
  alt: string;
  aspect: RenderAspect;
  /**
   * Responsive sizes for the fill image. Defaults to "100vw" (safe for
   * heroes); pass a real value for grid cards, e.g.
   * "(min-width: 80rem) 25vw, (min-width: 48rem) 50vw, 100vw".
   */
  sizes?: string;
  /** LCP opt-in: preloads the image (Next 16 replaces `priority` with `preload`). */
  preload?: boolean;
  /** Grid placement for the outer <figure>. Closed union — see
   *  RenderImageClassName; descendant selectors cannot compile. */
  className?: RenderImageClassName;
}

export type RenderImageProps = ImageShellProps;

export type ContextPhotoProps = Omit<ImageShellProps, "src"> & {
  /** Stock photography is real and licensed (ASSET-LICENSES.md); it must exist. */
  src: string;
};

type LoadStatus = "missing" | "loading" | "loaded" | "error";

/** Bordered, worded placeholder — the only permitted stand-in for imagery.
 *  Semantic tokens (background/border/muted-foreground) so the .ink-surface
 *  scope swaps in the dark-surface counterparts automatically. */
function Placeholder({ note }: { note: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center rounded-md border border-border bg-background px-4">
      <span className="text-label text-center text-muted-foreground">{note}</span>
    </div>
  );
}

function ImageShell({
  src,
  alt,
  aspect,
  sizes = "100vw",
  preload = false,
  className,
  label,
  loadingNote,
  pendingNote,
  errorNote,
}: ImageShellProps & { label: string; loadingNote: string; pendingNote: string; errorNote: string }) {
  const [status, setStatus] = useState<LoadStatus>(src ? "loading" : "missing");
  /** Whether the JS-only loading treatment (placeholder + fade) is armed.
   *  SSR and the no-JS path render the image fully visible with no overlay;
   *  this flips true only after hydration AND only if the image is still
   *  in flight, so the fade enhances — never gates — visibility. */
  const [fadeArmed, setFadeArmed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (status !== "loading") return;
    const img = imgRef.current;
    if (!img) return;
    if (img.complete) {
      // Settled before hydration (load and error events do not re-fire for
      // listeners attached afterwards): record the outcome, no fade needed.
      // naturalWidth 0 on a complete image means the request failed.
      setStatus(img.naturalWidth > 0 ? "loaded" : "error");
    } else {
      setFadeArmed(true);
    }
  }, [status]);

  const awaitingLoad = fadeArmed && status === "loading";

  return (
    <figure className={cn("m-0", className)}>
      <div className={cn("relative overflow-hidden rounded-md", ASPECT_CLASS[aspect])}>
        {!src || status === "error" ? (
          <Placeholder note={!src ? pendingNote : errorNote} />
        ) : (
          <>
            {/* Image FIRST among siblings: when the loading placeholder is
                removed on load, React keeps child 0 stable. (Placeholder
                first would unmount the just-loaded <img> and mount a fresh
                one — a redundant re-request.) The placeholder is absolutely
                positioned, so DOM order decides the paint order. */}
            <Image
              ref={imgRef}
              src={src}
              alt={alt}
              fill
              sizes={sizes}
              preload={preload}
              onLoad={() => setStatus("loaded")}
              onError={() => setStatus("error")}
              className={cn(
                "object-cover motion-safe:transition-opacity motion-safe:duration-300",
                awaitingLoad ? "opacity-0" : "opacity-100",
              )}
            />
            {awaitingLoad && <Placeholder note={loadingNote} />}
          </>
        )}
      </div>
      {/* The non-waivable label (DESIGN.md § Imagery policy). Unconditional:
          no prop, no state branch, no render path that skips it. */}
      <figcaption className="mt-2 text-label! block! visible! opacity-100! not-sr-only! text-muted-foreground!">{label}</figcaption>
    </figure>
  );
}

/**
 * A 3D visualisation of an urbanbricks design. Always carries the
 * "Visualisation — not a photograph of a delivered building." label, in
 * every state; the label cannot be removed or reworded by a caller.
 */
export function RenderImage(props: RenderImageProps) {
  return (
    <ImageShell
      {...props}
      label={RENDER_LABEL}
      loadingNote="Loading visualisation…"
      pendingNote="Visualisation pending"
      errorNote="Visualisation unavailable"
    />
  );
}

/**
 * Stock context photography (setting and texture only — the Not-Ours Rule).
 * Always carries the "Context photograph — not an urbanbricks building."
 * label, so a stock image can never be presented as an urbanbricks building.
 * Use RenderImage for anything that depicts an urbanbricks design.
 */
export function ContextPhoto(props: ContextPhotoProps) {
  return (
    <ImageShell
      {...props}
      label={CONTEXT_LABEL}
      loadingNote="Loading photograph…"
      pendingNote="Photograph unavailable"
      errorNote="Photograph unavailable"
    />
  );
}

/**
 * A licensed stock photograph used as a TEMPORARY placeholder in a product
 * slot (hero / card) while real renders or photography are produced. Always
 * carries the "Reference image — not an urbanbricks build" label so it can
 * never read as an actual urbanbricks building — the Not-Ours Rule holds even
 * for placeholders. src is required (a stock file must exist). This variant is
 * expected to disappear before launch; grep for ReferenceImage to find every
 * slot still on placeholder art.
 */
export function ReferenceImage(props: ContextPhotoProps) {
  return (
    <ImageShell
      {...props}
      label={REFERENCE_LABEL}
      loadingNote="Loading reference image…"
      pendingNote="Reference image pending"
      errorNote="Reference image unavailable"
    />
  );
}
