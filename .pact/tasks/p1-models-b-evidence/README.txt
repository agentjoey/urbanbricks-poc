p1-models-b — /models model library (browse & filter)
seat build2 · branch wt/p1

All evidence is from the PRODUCTION build (pnpm build + pnpm start -p 3701),
never dev. Browser: HeadlessChrome 149 via raw CDP (Node 24 global WebSocket,
no puppeteer/playwright wrapper), deviceScaleFactor 2. Server + Chrome killed
and temp files removed after the run. This page performs NO database writes,
so no Neon rows were created.

FILES
  01-grid-desktop-1440.png     Populated grid, 1440px. 4-column Module Grid,
                               all 7 models, "All 7 models" status, closing
                               "Get a quote" CTA, dark footer.
  02-filter-commercial-desktop.png  Active filter ?use=commercial — the 3
                               commercial models (Counter, Workroom, Basecamp),
                               "Commercial" chip filled Ink, "3 of 7 models".
  03-empty-state-desktop.png   ?size=40ft&use=commercial — no such model. Empty
                               state with heading, explanation, "Clear filters"
                               (secondary) + "Get a quote" (primary). Both the
                               40ft and Commercial chips show active.
  04-grid-mobile-390.png       390px — single column, filter chips wrap, header
                               collapsed to the Menu sheet trigger. (Some cards
                               caught mid image-load = the RenderImage loading
                               placeholder, an accepted C3 state; label present.)
  05-grid-tablet-768.png       768px mid-width — 2-column grid.
  06-filter-residential-NOJS.png  JS EXECUTION DISABLED (CDP
                               Emulation.setScriptExecutionDisabled). ?use=
                               residential still renders the 4 residential
                               models server-side, "Homes" chip active, "4 of 7
                               models", and every card keeps the non-removable
                               "Visualisation — not a photograph of a delivered
                               building." caption. The broken-image glyph is the
                               native 404 icon (no JS to swap the placeholder) —
                               the caption persists regardless, as DESIGN.md
                               requires in every state.
  measurements.json            Computed styles from the real pages (below).

PROGRESSIVE ENHANCEMENT (no-JS) — curl of the raw SSR HTML, zero JS executed:
  /models                       -> All 7 models  (basecamp counter harbor-20
                                   harbor-40 meridian meridian-stack workroom)
  /models?use=residential       -> 4 of 7 (harbor-20 harbor-40 meridian
                                   meridian-stack)
  /models?use=commercial        -> 3 of 7 (basecamp counter workroom)
  /models?size=40ft             -> 1 of 7 (harbor-40)
  /models?size=multi-unit&use=commercial -> 1 of 7 (workroom)
  /models?size=40ft&use=commercial       -> 0 of 7, empty state in the HTML
  Filtering is done on the SERVER from searchParams; the controls are <Link>s.
  It works with JavaScript fully disabled; the default render lists all 7.

CARDS USE STROKE BORDERS (interactive boundary, DESIGN.md § Cards):
  Source class:   border-stroke
  Compiled CSS:   .border-stroke{border-color:var(--stroke)}
  Token:          --stroke: oklch(0.64 0.006 75)   (Stroke, 3.37:1 on white)
  Computed (CDP): border-top-color lab(58.25 0.52 2.22), style solid, width 1px
                  = the Stroke token rendered (NOT Line oklch(0.90), which would
                  measure lab L~90). Hover/focus deepens to Ink; flat at rest.

STATE NOT BY COLOUR ALONE (DESIGN.md § Contrast Floor):
  Active chip = Ink fill (bg lab 5.28) + weight 600 + aria-current="true".
  Verified in measurements.json (filterCommercial.activeChips).

PRICE BAND (unverified() rendered through the sanctioned mechanism):
  "£34,000 – £46,000" in Deep Brass (lab 39.49 15.26 41.69, the exact token
  from c2), weight 600. A dev-only "Unverified" marker sits beside it (gated on
  NODE_ENV, absent from this production build — confirmed no marker in the shots).

GATES (final clean tree, after the empty-state copy fix):
  npx tsc --noEmit        clean
  pnpm lint               clean (zero warnings)
  pnpm build              exit 0 — /models is ƒ (dynamic, reads searchParams)
  pnpm verify:image-label all ancestor classes on the allowlist
  pnpm verify:contrast    ALL PASS
  pnpm verify:content     exits 1 on the SAME 47 pre-existing unverified()
                          placeholders as the accepted baseline — no new content
                          values introduced (this page's copy lives in src/app,
                          not src/content).

DEFECT FOUND + FIXED DURING VERIFICATION:
  First empty-state render read "see all 7models" — JSX dropped the space around
  {TOTAL}. Rewrote the sentence as a single interpolated string; rebuilt;
  re-captured ALL screenshots from the fixed build (03 now reads "all 7 models").

FILES OWNED BY THIS TASK (nothing else touched):
  src/app/models/page.tsx
  src/components/models-index/filters.ts
  src/components/models-index/filter-bar.tsx
  src/components/models-index/model-card.tsx
Built ON the accepted components (unchanged): <RenderImage> (C3), the root shell
header/footer (F4), content/models.ts + site.ts (F2), lib/unverified + delivery.
QUOTE_CTA imported from the accepted site-header/nav-items (import only).

NOT VERIFIED: Chromium only (per project exemption E5, cross-browser is a
follow-up). Real render images do not exist yet (docs/render-prompts.md is with
Human Owner), so cards show the accepted labelled placeholder; with real art the
same <RenderImage> paints the image and keeps the caption.
