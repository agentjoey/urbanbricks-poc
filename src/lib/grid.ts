/**
 * Module Grid constants — DESIGN.md § The Module Grid.
 *
 * The layout grid is derived from the real container footprints urbanbricks
 * builds from: a 20ft module is 20×8ft, so the base cell is a 5:2 rectangle.
 * A 40ft module occupies two cells side by side; a stacked two-storey build
 * occupies two cells vertically. Every major composition resolves to whole
 * cells — where a layout cannot, the layout is wrong, not the grid.
 *
 * The matching CSS custom properties (`--module-cell-min`, `--module-gap`,
 * `--aspect-module`) and utilities (`grid-modules`, `cell-span-*`,
 * `aspect-module`, `aspect-module-stacked`) live in `src/app/globals.css`.
 */

/** Base cell proportions (20ft × 8ft footprint). */
export const MODULE_CELL = { width: 5, height: 2 } as const;

/** Aspect ratio of a single cell, for image crops (`aspect-module`). */
export const MODULE_ASPECT = "5 / 2";

/** Aspect ratio of two cells stacked vertically (`aspect-module-stacked`). */
export const MODULE_ASPECT_STACKED = "5 / 4";

/**
 * Total width of `cells` whole cells laid side by side, including the joining
 * gaps between them. All dimensions in the same unit.
 */
export function moduleWidth(cells: number, cellWidth: number, gap: number): number {
  return cells * cellWidth + Math.max(0, cells - 1) * gap;
}
