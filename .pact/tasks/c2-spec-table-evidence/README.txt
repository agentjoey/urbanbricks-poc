c2-spec-table evidence — which file proves what
===============================================

All screenshots/measurements were taken with headless Chrome 150 over CDP
(Emulation deviceMetrics 2x, document.fonts.ready awaited before measuring)
against a temporary route src/app/probe-c2 (deleted after the runs). The
route rendered the REAL content path: rows built from src/content/models.ts
(The Meridian) with unverified() wrappers passed through intact, the price
band formatted via site.currency, and the delivery row passed as the
FactoryDelivery itself. Colors below are lab() conversions of the OKLCH
tokens as reported by getComputedStyle (Chrome serializes oklch as lab).

dev-1280.png / dev-1280.json
  next dev (NODE_ENV=development, the other seat's already-running server
  on :3101 serving this working tree — read-only GETs only).
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
  pnpm build && pnpm start on a verified-free port (:3467). Route was
  prerendered static (build output: "○ /probe-c2").
  - badgeCount 0, bodyIncludesBadgeLabel false — the dev marker is absent
    from the production build; footer contact values also render bare.
  - Same computed colors/weights as dev on both surfaces (mechanism is the
    CSS tokens, not dev-only code).

prod-400.png / prod-400.json
  Production build at 400px viewport. scrollWidth == clientWidth == 400
  (no horizontal scroll); two-column layout holds; long label wraps, long
  sentence value wraps, the unbroken 70-char string breaks mid-word
  (break-words); tabular widths still identical at mobile size.

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
  Three other workers were live in this tree during the run. An early
  production screenshot accidentally hit ANOTHER seat's `next start`
  (port 3413) serving a build whose CSS chunk hashes my rebuild had
  replaced — the page rendered unstyled and the measurements honestly
  reported black/default everything. That run was discarded; the final
  numbers above come from a server I started myself on a verified-free
  port immediately after my own build (CSS asset checked 200 first).
