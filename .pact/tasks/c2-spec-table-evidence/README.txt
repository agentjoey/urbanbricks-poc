c2-spec-table evidence — which file proves what
===============================================

RE-RUN 2026-07-22 (post changes_requested): the only change vs the original
run is spec-table.tsx `gap-x-sm` -> `gap-x-stack` (lead renamed the spacing
scale xs/sm/md/lg/xl -> inline/stack/group/section/band after the first
submission; `--spacing-sm` no longer existed, so the row grid computed
`column-gap: normal` and the two columns touched — measured 0px by review).
All six files below were recaptured from the FIXED build; every figure in
the JSONs is current. The gap section is new — the original JSONs predate
the rename and recorded no gap measurement at all.

All screenshots/measurements were taken with headless Chrome 150 over CDP
(Emulation deviceMetrics 2x, document.fonts.ready awaited before measuring)
against a temporary route src/app/probe-c2 (deleted after the runs). The
route rendered the REAL content path: rows built from src/content/models.ts
(The Meridian) with unverified() wrappers passed through intact, the price
band formatted via site.currency, and the delivery row passed as the
FactoryDelivery itself. Colors below are lab() conversions of the OKLCH
tokens as reported by getComputedStyle (Chrome serializes oklch as lab).

GAP (the defect under review) — dev-1280.json, prod-1280.json, prod-400.json
  `gap` section per surface: computed columnGap "16px" on every row
  (gap-x-stack = --spacing-stack = 16px, the renamed equivalent of the old
  sm), dt.right -> dd.left distance 16px on EVERY row of the spec table on
  BOTH surfaces (minDtToDdDistance 16), and on the long-label stress row
  whose label wraps to three lines (longLabelRow.dtToDdDistance 16,
  labelWrapped true) — at 1280px AND at 400px, in dev AND prod. The
  screenshots show the gap visibly; at 400px label and value no longer
  touch.

dev-1280.png / dev-1280.json
  next dev (NODE_ENV=development) on :3522, this working tree.
  - 12 "Unverified" badges in the DOM (6 wrapped values x 2 surfaces);
    bodyIncludesBadgeLabel true. Screenshot shows the bordered badge on
    both surfaces.
  - White surface: label Muted Ink lab(35.05 ...), value Ink lab(5.28 ...),
    accent (price + delivery) Deep Brass lab(39.49 15.26 41.69) at weight
    600, divider Line lab(88.41 ...) 1px.
  - Ink surface: section bg Ink Surface lab(8.37 ...), label Muted On Dark
    lab(69.85 ...), value On Dark lab(95.37 ...), accent Brass
    lab(69.92 11.13 49.26) — the .ink-surface --brass-deep -> --brass
    redefinition reaches the real component, not a probe path.
  - Delivery row renders "30 days (factory build)" — self-scoping .short,
    no bare figure.

prod-1280.png / prod-1280.json
  pnpm build && pnpm start on :3521 (started by me immediately after my own
  build; page 200 and the served CSS chunk verified 200 AND grep-verified to
  contain `gap-x-stack` before any measurement — the served stylesheet is
  the fixed one). Route was prerendered static (build output: "○ /probe-c2").
  - badgeCount 0, bodyIncludesBadgeLabel false — the dev marker is absent
    from the production build; footer contact values also render bare.
  - Same computed colors/weights as dev on both surfaces (mechanism is the
    CSS tokens, not dev-only code).

prod-400.png / prod-400.json
  Same production server at 400px viewport. scrollWidth == clientWidth == 400
  (no horizontal scroll); two-column layout holds with the 16px gap intact;
  long label wraps, long sentence value wraps, the unbroken 70-char string
  breaks mid-word (break-words); tabular widths still identical at mobile
  size.

tnum proof (in dev-1280.json and prod-1280.json, identical numbers)
  Five five-digit values of maximally mixed digit widths (11111 / 22222 /
  55555 / 88888 / 12345) rendered through the component measure
  50.78125px EACH (Range over the text node). A control block with the same
  values, same font, rendered OUTSIDE the component without tabular-nums
  measures 29.19 / 49.34 / 50.34 / 51.19 / 45.39px. getComputedStyle
  confirms fontVariantNumeric "tabular-nums" on the component cells,
  "normal" on the control — the alignment is the component's doing, not
  the font's default.

Known rendering note
  Under tnum, Schibsted Grotesk also substitutes the thousands comma with
  a full-advance tabular comma, so "£79,000" renders with an airy gap
  ("£79, 000"). This is the same mechanism that aligns the digits
  (separators align down the column too) and is standard tnum behaviour,
  not a markup bug — the unstyled render shows no gap.

Environment note
  Other workers were live in this tree during the re-run (next start on
  :3411 and :3466, both serving OTHER directories — left untouched). My prod
  figures come from a server I started myself on :3521 immediately after my
  own build, CSS asset checked 200 and content-checked for `gap-x-stack`
  first; my dev figures from my own next dev on :3522. Both were killed
  after the runs; no server of mine is left running.
