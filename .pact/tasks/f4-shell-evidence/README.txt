f4-shell evidence — 2026-07-22, seat build
===========================================

Build provenance
----------------
All screenshots and measurements are from PRODUCTION builds (pnpm build && pnpm
start, Chrome 150 headless via raw CDP, trusted Input.dispatchKeyEvent key
events — no synthetic focus()).

Because a sibling session was building in the repo tree mid-run (the shared-
.next race, same incident the c3 evidence recorded), the browser evidence was
produced against a clonefile copy of the repo at /tmp/f4-verify — byte-identical
sources (verified with diff -rq against the repo at capture time), built and
served in isolation. Two builds were used:

  BUILD A (with probe route /models/probe-f4): active-nav evidence only.
  BUILD B (probe deleted, route table: / and /_not-found only): everything
  else — these are the FINAL-build screenshots.

The active-nav state cannot be re-shot on build B: after the probe's deletion
no route matches a nav item, and on the 404 tree usePathname() returns
"/_not-found". The probe drove the real mechanism — same layout, same header,
real usePathname(), real production build; only the route table differs.

DEFECT FOUND AND FIXED during verification (not a rewrite — two class changes
in src/components/site-header/site-header.tsx, design intent unchanged):
  The previous worker's flagged measurement "sheetCtaPinnedBottom width 22"
  was REAL. Root cause: f1's @theme defines --spacing-xs/sm/md (DESIGN.md
  spacing scale), and Tailwind 4 resolves the NAMED max-w-xs/sm/md utilities
  from that namespace — max-w-sm compiled to 16px, not 24rem (verified in the
  built CSS: .max-w-sm{max-width:16px}; max-w-3xl, which has no spacing twin,
  correctly stayed var(--container-3xl)). The sheet's max-w-sm clamped it to
  16px wide; the CTA measured 22px. Second layer: the sheet primitive's own
  data-[side=right]:w-3/4 survived tailwind-merge (different variant stack
  than w-[85%]) and won the cascade (measured 293px at 390 after the max-w
  fix, not 331.5px). Fix: literal max-w-[24rem] (= stock max-w-sm, no design
  change) plus variant-matched data-[side=right]:w-[85%] and
  data-[side=right]:sm:max-w-[24rem] overrides. Measured after fix: sheet
  331.5px / CTA 299x48px at 390; sheet 384px at 768 and 899.

  REPORTED FOR LEAD/REVIEW (out of f4 scope): the namespace collision is
  systemic. Any present or future max-w-xs/sm/md (and named w-*) compiles to
  8/16/32px. Live instances: src/app/page.tsx (starter placeholder, renders
  one word per line — visible as such in the screenshots; p4-home replaces
  it) and src/components/ui/sheet.tsx defaults (neutralised at the f4 call
  site, still broken for future consumers). globals.css belongs to f1 — no
  token was touched.

Per item
--------
1. Three widths (build B):
   01-desktop-1440.png        desktop nav + brass CTA
   03-collapse-899.png        Menu button, desktop nav display:none
   04-collapse-900.png        desktop nav flex, Menu button display:none
   05-mobile-390-closed.png   390x844 @2x
   06-mobile-390-sheet-open.png
   collapse-boundary.json     computed display on both sides of the boundary

2. Keyboard walkthrough (build B, keyboard-walkthrough.json + sheet-keyboard.json):
   - Skip link is the first Tab stop, appears as the ink pill
     (08-skip-link-focused.png), outline On Dark 2px/2px (it sits on an ink
     fill). Enter -> location.hash #content; the NEXT Tab lands inside
     main#content (on the starter page's first link), not back at the header.
   - Light surface (09-focus-light-nav.png): Models nav link, computed
     outline 2px solid Ink oklab(0.18 ...) full alpha (no alpha channel),
     offset 2px, :focus-visible matched via real key events.
   - Ink surface (10-focus-dark-footer.png): footer wordmark link, computed
     outline 2px solid lab(95.37 ...) = On Dark oklch(0.96 0.004 75), full
     alpha, offset 2px.
   - Sheet (07-sheet-focus-trap.png): role=dialog, aria-labelledby ->
     SheetTitle "Menu" (accessible name). Focus enters the sheet on open
     (Close button). 12x Tab: every stop inside the sheet, exact cycle
     Models -> How it works -> About -> Get a quote -> Close -> Models...
     Shift+Tab stays inside. Escape removes the sheet from the DOM and
     returns focus to the Menu trigger.

3. Active nav state without colour (build A):
   active-nav-computed.json   Models: weight 600, underline 2px,
                              decoration lab(39.487 15.26 41.69) = Deep Brass
                              oklch(0.48 0.095 70), offset 8px, aria-current=
                              page. Siblings: weight 500, transparent 2px
                              underline.
   active-nav-1440.png        visually bolder + underlined
   active-nav-forced-colors.* forced-colors:active emulation: author colours
                              stripped (links render in system LinkText, the
                              brass CTA becomes an outlined button). The UA
                              underlines ALL links in this mode, so the
                              underline alone no longer differentiates — the
                              WEIGHT STEP does (600 vs 500 survives, measured;
                              visible in the screenshot), plus aria-current for
                              AT. This is exactly why DESIGN.md requires the
                              weight step.

4. Sheet CTA pinned bottom (build B): cta-measurements.json — 299x48px,
   16px from the viewport bottom (mt-auto + p-4), sheet 331.5px = 85% of
   390. The flagged 22px was a real defect; fixed, re-measured, and visually
   confirmed in 06-mobile-390-sheet-open.png.

5. Sticky header hairline (build B): header-hairline.json — at rest
   box-shadow:none; scrolled (scrollY 721) box-shadow resolves to
   lab(88.4 0.34 1.48) = Line oklch(0.9 0.004 75) at 0px 1px 0px 0px — 1px
   offset, zero blur, zero spread. (Computed value also lists four
   rgba(0,0,0,0) 0px 0px 0px 0px entries — Tailwind's shadow-variable
   defaults; they render nothing.) 02-header-scrolled-hairline.png.

6. Automated checks after probe deletion (in the repo, final state):
   pnpm build          clean — route table: / and /_not-found only
   npx tsc --noEmit    clean
   pnpm lint           clean
   pnpm verify:contrast  ALL PASS (exit 0)
   pnpm verify:content   exit 1 BY DESIGN — the pre-launch gate lists 47
                         values still wrapped in unverified(); that is the
                         intended state until the Human Owner confirms facts,
                         not a regression (f2-content was accepted in this
                         state).

Could NOT verify / honest limits
--------------------------------
- Chrome 150 only (project-wide exemption E5; Firefox/Safari due before the
  first page ships).
- The active-nav screenshots necessarily come from build A (with probe);
  build B differs only by the deleted route.
- Focus-trap cycling was verified for 12 Tab stops (2.4 cycles), not
  exhaustively; the cycle repeated exactly twice.
