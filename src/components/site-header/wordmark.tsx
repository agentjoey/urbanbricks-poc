import { cn } from "@/lib/utils";

/**
 * The wordmark (DESIGN.md § Wordmark): typographic and nothing else —
 * "urbanbricks" in Archivo Expanded 700, lowercase, letter-spacing -0.02em.
 * Archivo Expanded is Archivo's variable `wdth` axis rendered at 125
 * (font-stretch), the same treatment the base layer gives h1/h2.
 * There is no logo: no symbol, no monogram, no icon mark.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-display text-[1.125rem] leading-none font-bold tracking-[-0.02em] lowercase [font-stretch:125%]",
        className
      )}
    >
      urbanbricks
    </span>
  );
}
