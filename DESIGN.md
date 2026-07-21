<!-- SEED: colours, typography and motion are resolved; components are not yet built. Re-run /impeccable document once real components exist to capture their tokens and generate the .impeccable/design.json sidecar. -->
---
name: urbanbricks
description: Modular buildings that open in weeks — brass, daylight and a delivery date you can plan around.
colors:
  brass: "oklch(0.74 0.115 80)"
  brass-deep: "oklch(0.48 0.095 70)"
  ink: "oklch(0.18 0.008 75)"
  ink-muted: "oklch(0.44 0.006 75)"
  surface-white: "oklch(1 0 0)"
  surface-ink: "oklch(0.21 0.012 75)"
  line: "oklch(0.90 0.004 75)"
  stroke: "oklch(0.64 0.006 75)"
typography:
  display:
    fontFamily: "Archivo Expanded, Archivo, Helvetica Neue, sans-serif"
    fontSize: "clamp(2.75rem, 6vw, 5.25rem)"
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Archivo Expanded, Archivo, Helvetica Neue, sans-serif"
    fontSize: "clamp(1.75rem, 3vw, 2.75rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Golos Text, Helvetica Neue, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "normal"
  body:
    fontFamily: "Golos Text, Helvetica Neue, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Golos Text, Helvetica Neue, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.01em"
rounded:
  sm: "2px"
  md: "4px"
  lg: "8px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "32px"
  lg: "64px"
  xl: "120px"
components:
  button-primary:
    backgroundColor: "{colors.brass}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "16px 32px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "oklch(0.69 0.125 78)"
    textColor: "{colors.ink}"
  button-secondary:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "16px 32px"
  spec-row:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.ink}"
    padding: "14px 0"
  input-field:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "14px 16px"
---

# Design System: urbanbricks

## 1. Overview

**Creative North Star: "Brass and Daylight"**

Two materials carry this system. Brass is the made thing: warm, precise, machined, the colour of something manufactured to a tolerance. Daylight is the lived thing: real buildings photographed in real light, with real weather and real people in them. Everything else — the surfaces, the type, the rules — gets out of their way.

The reference is a modern vehicle configurator, not a builder's brochure. A configurator earns trust by refusing to be vague: the price is a number, the delivery is a date, the specification is a list you can read to the end. urbanbricks sells the same thing an automaker sells at configuration time — a large, slow, expensive decision made survivable by knowing exactly what arrives and when. The interface should feel like reading an order confirmation for something you are excited about.

This system explicitly rejects **hard industrial**: no steel-plate textures, no hazard yellow, no shipping-container stencil lettering, no cargo-orange-on-cool-grey. The container is how the building is made, not what the brand is about. It equally rejects the opposite reflex — the warm Scandinavian cabin, cream backgrounds, reclaimed-wood palettes — because that is the same category cliché wearing a softer coat.

**Key Characteristics:**
- Achromatic architecture, one warm metal accent
- Photography does the emotional work; the interface does the factual work
- Near-square corners (2–4px); nothing is soft or friendly-by-rounding
- Width and weight create hierarchy, never decoration
- Every claim resolves to a number, a date, or a named responsibility

## 2. Colors

An achromatic system — pure white and near-black — interrupted by a single warm metal.

### Primary
- **Brass** (`oklch(0.74 0.115 80)`): the only saturated colour in the system. Fills primary CTAs with ink-coloured labels, marks the delivery-window figure on model pages, and underlines the active navigation item. Nowhere else. Its scarcity is what makes a quote button unmissable on a page of photographs.
- **Deep Brass** (`oklch(0.48 0.095 70)`): the text-safe form. Used when brass must appear as type on white — inline links, the lead-time figure in running copy. Dark enough to clear 4.5:1 against white, which the primary brass is not.

### Neutral
- **Ink** (`oklch(0.18 0.008 75)`): all body and heading text on light surfaces, and the fill of dark sections. Carries a trace of the brass hue so black never reads as blue-cold.
- **Muted Ink** (`oklch(0.44 0.006 75)`): secondary copy, spec labels, captions. The floor for muted text — anything lighter fails contrast and is prohibited.
- **White** (`oklch(1 0 0)`): the default page surface. Literally `#ffffff`, chroma zero.
- **Ink Surface** (`oklch(0.21 0.012 75)`): full-bleed dark sections used for rhythm — the delivery-process band, the closing quote block. Body text on it lifts to `oklch(0.96 0.004 75)` with line-height raised by 0.05.
- **Line** (`oklch(0.90 0.004 75)`): purely decorative hairlines — spec-table dividers, section rules, card edges. 1px, always. At 1.35:1 against white it is deliberately below the UI-component threshold, which is permitted only because it never carries meaning or bounds a control.
- **Stroke** (`oklch(0.64 0.006 75)`): the boundary of anything interactive — input fields, select triggers, checkbox and radio outlines, secondary button borders. Clears 3:1 against white (3.37:1) as WCAG 1.4.11 requires for UI component boundaries. Line is never substituted here; a 1.35:1 field border is a failure, not a lighter aesthetic.

### Named Rules

**The No-Cream Rule.** Backgrounds are pure white or ink. Never sand, bone, parchment, linen, oat, or any near-white with warmth mixed in. Warmth in this brand comes from brass and from photography; the moment it enters the surface, the page becomes every other AI-generated landing page of 2026. If a background swatch reads as "paper", it is wrong.

**The Ten Percent Rule.** Brass covers no more than 10% of any viewport. It is a signal, not a theme. Two brass elements competing in one fold means one of them is not important.

**The Contrast Floor.** Body copy clears 4.5:1; large text clears 3:1; placeholder text is held to the same 4.5:1 as body, never a lighter grey. Muted Ink is the lightest permitted text colour on white. Interactive boundaries and state indicators clear 3:1 — which is why Stroke, not Line, bounds a control, and why the active nav underline is Deep Brass, not Brass. No state, error, or availability is communicated by colour alone — always colour plus text, weight, or icon.

Measured against white: Ink 18.81:1 · Muted Ink 7.77:1 · Deep Brass 6.68:1 · Stroke 3.37:1. Ink on Brass (the primary button) 8.07:1. **Brass is never type and never a lone state indicator** — on white it measures 2.33:1 and fails both thresholds.

## 3. Typography

**Display Font:** Archivo Expanded (fallback Archivo, Helvetica Neue, sans-serif)
**Body Font:** Golos Text (fallback Helvetica Neue, sans-serif)

Both are grotesques, and the contrast between them is deliberately **width**, not style. Archivo Expanded is broad, planted, and architectural — headlines occupy space the way a building occupies a site. Golos Text is narrow, plain, and undramatic — it reads like documentation, which is exactly the register a delivery promise should be written in. Setting a wide display against a compact body produces real hierarchy without reaching for a serif the brand has no reason to own.

Both are served self-hosted through `next/font`. No external font requests: this is a performance decision and a privacy one, since a visitor's IP never reaches a third-party font server.

> Font families are the recommended pairing, not a locked decision. Confirm both render acceptably at display weights before the first page ships; if Archivo Expanded's widths prove unusable, the replacement must still provide the width-contrast axis and must not appear on the reflex-reject list.

### Hierarchy
- **Display** (700, `clamp(2.75rem, 6vw, 5.25rem)`, 0.98): page-opening statements only. One per page. Ceiling is 5.25rem — the page states its case, it does not shout.
- **Headline** (600, `clamp(1.75rem, 3vw, 2.75rem)`, 1.1): section openers and model names.
- **Title** (600, 1.125rem, 1.35): card headings, spec-group labels, form section headers.
- **Body** (400, 1.0625rem, 1.6): running copy, capped at 65–75ch.
- **Label** (500, 0.8125rem, +0.01em): spec keys, form labels, button text, metadata. Sentence case.

### Named Rules

**The Width Rule.** Hierarchy comes from width, weight, and size. Never from colour, never from an underline, never from a decorative rule above a heading.

**The No-Eyebrow Rule.** Tiny uppercase tracked kickers above section headings are forbidden — no `PROCESS`, no `OUR MODELS`, no `01 / 02 / 03` markers. If a section needs an introduction, the heading itself is the introduction. Numbered markers are permitted in exactly one place: the delivery process, where the order is real information the reader needs.

**The Balance Rule.** `text-wrap: balance` on every h1–h3; `text-wrap: pretty` on running prose. Headline copy is tested at every breakpoint — a display word that overflows on tablet is a bug, and the fix is shorter copy or a lower clamp maximum, never a horizontal scroll.

## 4. Elevation

Flat. This system has no ambient shadows and no resting elevation. Depth comes from tonal layering — a white page against an ink band, a hairline rule against a field of white — and from photography, which supplies all the real depth the page needs.

Shadows appear only as a response to state, and only where an element genuinely leaves the page plane: an open dropdown, a modal, a sticky header once the page has scrolled beneath it. A card at rest never has a shadow.

### Shadow Vocabulary
- **Detached** (`box-shadow: 0 8px 32px oklch(0.18 0.008 75 / 0.12)`): overlays, dropdowns, dialogs. The only shadow in the system.
- **Scrolled header** (`box-shadow: 0 1px 0 var(--line)`): a hairline, not a shadow — the header commits to the plane rather than floating above it.

### Named Rules

**The Flat-At-Rest Rule.** If an element has a shadow and the user has not interacted with it, delete the shadow. Test: screenshot the page untouched — any soft grey halo is a defect.

## 5. Components

### Buttons
- **Shape:** near-square, barely relieved corners (4px)
- **Primary:** brass fill with ink label (16px 32px). Ink-on-brass rather than white-on-brass — it clears contrast comfortably and it looks machined rather than webby.
- **Hover / Focus:** background deepens to `oklch(0.69 0.125 78)` over 150ms ease-out; no lift, no scale, no shadow. Focus-visible draws a 2px ink ring offset 2px — visible on both white and brass.
- **Secondary:** white fill, 1px Ink border, ink label. Used for the browse-models path so the quote CTA is never in visual competition with it.

### Cards / Containers
- **Corner Style:** 4px
- **Background:** white on white, separated by a 1px Line rule rather than by a fill change
- **Shadow Strategy:** none — see Elevation
- **Border:** 1px Line, or none where a rule already separates
- **Internal Padding:** 32px desktop, 16px below 768px

Cards are used only where the content is genuinely a set of peers — the model grid. They are never used to hold a single idea, and never nested.

### Inputs / Fields
- **Style:** white fill, 1px Stroke (`oklch(0.64 0.006 75)`) border, 4px radius, 14px/16px padding
- **Focus:** stroke shifts to Ink and thickens to 2px; no glow, no colour change
- **Error:** stroke shifts to the destructive token, plus an ink-coloured message below the field naming what to fix. Never colour alone.
- **Disabled:** Muted Ink label, Line fill, cursor not-allowed, and an explanation of why nearby

Every field has a persistent visible label. Placeholder-as-label is forbidden.

### Navigation
- Golos Text at Label size, ink, sentence case. The active item carries a 2px **Deep Brass** underline plus a weight step to 600 — Deep Brass rather than Brass because an active-state indicator is a UI component under WCAG 1.4.11 and needs 3:1 (Brass on white is only 2.33:1), and the weight step means the state survives for anyone who cannot see the colour at all. Sticky on scroll with the hairline rule, never a shadow. Below 900px it collapses to a full-height sheet with the quote CTA pinned to the bottom, thumb-reachable.

### Spec Table (signature component)
The component the automotive-configurator reference exists to justify, and the one that carries the brand's credibility. A two-column list — Label left in Muted Ink, value right in Ink — separated by 1px Line rules, no zebra striping, no card wrapper, no icons. Values are set in Golos Text with tabular figures so numbers align down the column.

Delivery-window and price-band rows are the exception that earns brass: the value sits in Deep Brass at Title weight. In development, any value still wrapped in `unverified()` renders with a visible marker so unconfirmed figures cannot be mistaken for facts during review.

## 6. Do's and Don'ts

### Do:
- **Do** keep backgrounds at pure white (`oklch(1 0 0)`) or Ink Surface (`oklch(0.21 0.012 75)`).
- **Do** put warmth in the brass and in the photography, never in the surface.
- **Do** hold brass to ≤10% of any viewport, and to CTAs, the active nav underline, and delivery/price figures only.
- **Do** ship real photography of real buildings in real daylight. Zero imagery is a defect, not restraint.
- **Do** build hierarchy from width and weight — Archivo Expanded against Golos Text.
- **Do** give every claim a number, a date, or a named responsibility.
- **Do** keep every surface flat at rest; shadows are a response to interaction only.
- **Do** provide a `prefers-reduced-motion` alternative for every transition — motion is responsive feedback, not choreography.
- **Do** test display copy at every breakpoint before shipping the page.

### Don't:
- **Don't** use hard industrial cues — steel-plate textures, hazard yellow, container stencil lettering, cargo orange on cool grey. This is PRODUCT.md's named anti-reference and it is the first thing a visitor expects from this category.
- **Don't** substitute the opposite cliché: cream, sand, bone, parchment or linen backgrounds, reclaimed-wood palettes, or Scandinavian-cabin warmth.
- **Don't** use `background-clip: text` with a gradient. Ever.
- **Don't** put a coloured `border-left` or `border-right` thicker than 1px on cards, callouts or alerts.
- **Don't** build the hero-metric template — big number, small label, supporting stats.
- **Don't** repeat identical icon + heading + text cards down the page.
- **Don't** put a tiny uppercase tracked eyebrow above section headings, and don't number sections that are not a real sequence.
- **Don't** use glassmorphism, decorative blur, or backdrop-filter as ornament.
- **Don't** use monospace as shorthand for "engineered". This brand has no mono face; spec credibility comes from tabular figures and rule discipline.
- **Don't** let muted text go lighter than Muted Ink (`oklch(0.44 0.006 75)`) on white.
- **Don't** communicate availability, error, or status by colour alone.
- **Don't** replace a photograph with a coloured panel, gradient block, or CSS illustration because assets are missing. Ship fewer, better images instead.
- **Don't** invent proof. No testimonial cards, project case studies, certification badges, or delivery-count figures until real material exists — the slots stay empty.
