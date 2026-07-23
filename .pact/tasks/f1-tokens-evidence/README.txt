f1-tokens rework evidence — which file proves what
==================================================

verify-contrast.txt          pnpm verify:contrast output (ALL PASS, exits 0).
                             The script parses DESIGN.md + globals.css and fails
                             on drift/missing tokens — run it, don't trust this file.

schibsted-tnum-analysis.txt  GATE 3 binary proof. fontTools resolution of the tnum
                             single-substitution for all ten digits in the ACTUAL
                             SERVED woff2 (.next/static/media/31a9145ccb84606d-s.p.
                             3j3x29wbycqkn.woff2, latin subset) and in upstream
                             google/fonts main. All ten .tf advances = 1300/2048em,
                             spread 0, tables identical. Exit 0.

font-gates.json              Browser gates, unblocked (canonical copy of
  = font-gates-unblocked.json  font-gates-unblocked.json): Gate 1 wdth (h1 computes
                             font-stretch 125%, 103.47px vs 83.42px = 1.24x),
                             Gate 3 rendered (all ten digits 40.63px, max delta
                             0.00px; proportional 11111.11 vs 88888.88 differ,
                             tabular equal at 325px), module grid (4 cols,
                             gutter = 0.025 x cell on BOTH axes, spans exact,
                             trailing gutter residue 0), ink surface (line-height
                             1.65, hairline resolves to line-on-dark, verified
                             against a var(--line-on-dark) control), focus ring
                             (2px solid offset 2px; Ink on light, On Dark inside
                             .ink-surface, measured via :focus-visible), and
                             darkMediaRuleCount 0 (no prefers-color-scheme rule
                             anywhere in the served CSS).
                             NOTE: the gate2 section in THIS file is superseded —
                             see below.

font-gates-blocked.json/png  GATE 2 proof, through the real cascade. Same page,
                             loaded with all *.woff2 requests blocked at the
                             network layer (CDP Network.setBlockedURLs, cache
                             disabled, fresh target). Schibsted/Archivo faces go
                             to status "error"; the probes (one plain element
                             inheriting font-sans from <html>, one with the plain
                             font-sans utility — neither names a fallback family)
                             render at 411.34px vs raw Arial 393.69px = 1.0449,
                             exactly size-adjust 104.49%; the display probe
                             measures 0.9868x = size-adjust 98.7%. The adjusted
                             faces sit immediately after the real family in the
                             computed stack, before any generic — the stacks are
                             printed in the JSON.

font-gates-mobile.json       Module grid at 400px: collapses to 1 column;
                             cell-span-2/3 fall back to span 1 (352px = full cell,
                             no implicit tracks, no overflow); row gutter still
                             0.025 x cell; trailing residue 0.

font-gates-dom.html          DOM dump of the harness page (pre-CDP run; kept for
                             the rendered source).

ink-surface-text-body.json   ROUND 3, item 1 proof — the line-height raise
                             measured on the REAL path: a production build
                             (pnpm build && next start) serving a route whose
                             elements carry the .text-body utility inside
                             .ink-surface. Element with class text-body inside
                             .ink-surface computes 17px/28.05px (ratio 1.65);
                             the same utility on the default surface computes
                             27.2px (1.6); a plain inheriting element inside
                             .ink-surface computes 16px/26.4px (1.65). Also
                             shows the computed body stack with exactly one
                             "Schibsted Grotesk Fallback" (round-3 dedupe).
                             The compiled utility itself reads
                             line-height: var(--tw-leading, 1.6) — a literal,
                             because the type scale sits under @theme inline —
                             which is why the raise needed the explicit scoped
                             override .ink-surface .text-body (unlayered author
                             CSS outranks @layer utilities) instead of an
                             inherited value. The probe route
                             (src/app/probe-f1/) was deleted after the run.

golos-tnum-analysis.txt      Previous round: the Golos Text finding that led to
                             the font swap. Kept for the record.

Methodology notes
-----------------
- The temporary harness page src/app/font-evidence/page.tsx measured everything
  through the cascade and was deleted after the runs.
- document.fonts.delete() cannot suppress a CSS-connected @font-face (Blink
  re-adds it on style recalc — the unblocked file's gate2 section shows this),
  which is why Gate 2 uses network-layer blocking instead.
- Headless Chrome viewport quirk: default window is 800x600 minus scrollbar
  (756px usable); desktop runs use an explicit 1440x2600 window.
