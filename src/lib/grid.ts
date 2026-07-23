/**
 * Module Grid constants — DESIGN.md § The Module Grid.
 *
 * The layout grid is derived from the real container footprints urbanbricks
 * builds from: a 20ft module is 20×8ft, so the base cell is a 5:2 rectangle.
 * A 40ft module occupies two cells side by side; a stacked two-storey build
 * occupies two cells vertically. Every major composition resolves to whole
 * cells — where a layout cannot, the layout is wrong, not the grid.
 *
 * The gutter is proportional to the cell: the joining gap between joined
 * modules is 1/40 of the module length, so the gutter is
 * MODULE_GAP_RATIO × cell width. The stacked crop below is two cells plus one
 * gutter: height = 2 + 2 + 5·r in cell units (the gutter scales with the cell
 * WIDTH, and a cell is 5 wide), i.e. 4.125 at r = 0.025.
 *
 * The matching CSS (`--module-gap-ratio`, `--aspect-module`, `.grid-modules`,
 * `.cell-span-*`, `aspect-module`, `aspect-module-stacked`) lives in
 * `src/app/globals.css`.
 */

/** Base cell proportions (20ft × 8ft footprint). */
export const MODULE_CELL = { width: 5, height: 2 } as const;

/** Joining gap between modules, as a fraction of the module length. */
export const MODULE_GAP_RATIO = 0.025 as const;

/** Aspect ratio of a single cell, for image crops (`aspect-module`). */
export const MODULE_ASPECT = "5 / 2";

/** Aspect ratio of two cells stacked vertically (`aspect-module-stacked`). */
export const MODULE_ASPECT_STACKED = "5 / 4.125";
