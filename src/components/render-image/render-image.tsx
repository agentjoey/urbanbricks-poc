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
 *  - Both labels are required by DESIGN.md to be visible in EVERY state, so
 *    the <figcaption> sits outside the image box and renders whether the
 *    image is loading, loaded, failed, or not yet provided.
 *  - Alt text is a required prop — a render without alt does not compile.
 *
 * What the type system cannot reach (recorded honestly): a page author could
 * still hide the caption with CSS (e.g. `[&_figcaption]:hidden`). That is a
 * review-level red line (DESIGN.md Don'ts: "don't strip the Visualisation
 * label off a render"), not something a component API can prevent.
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
import { useState } from "react";
import { cn } from "@/lib/utils";

/** Module-private. Never exported, never a prop — this is what makes the
 *  label non-removable at the type level. */
const RENDER_LABEL = "Visualisation — not a photograph of a delivered building.";
const CONTEXT_LABEL = "Context photograph — not an urbanbricks building.";

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
  /** Layout classes for the outer <figure> (e.g. cell-span-2). Cannot reach
   *  the caption or the image box. */
  className?: string;
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

  return (
    <figure className={cn("m-0", className)}>
      <div className={cn("relative overflow-hidden rounded-md", ASPECT_CLASS[aspect])}>
        {!src || status === "error" ? (
          <Placeholder note={!src ? pendingNote : errorNote} />
        ) : (
          <>
            {status === "loading" && <Placeholder note={loadingNote} />}
            <Image
              src={src}
              alt={alt}
              fill
              sizes={sizes}
              preload={preload}
              onLoad={() => setStatus("loaded")}
              onError={() => setStatus("error")}
              className={cn(
                "object-cover",
                status === "loading"
                  ? "opacity-0"
                  : "opacity-100 motion-safe:transition-opacity motion-safe:duration-300",
              )}
            />
          </>
        )}
      </div>
      {/* The non-waivable label (DESIGN.md § Imagery policy). Unconditional:
          no prop, no state branch, no render path that skips it. */}
      <figcaption className="mt-2 text-label text-muted-foreground">{label}</figcaption>
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
