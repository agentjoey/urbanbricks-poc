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
  ink-muted-on-dark: "oklch(0.74 0.006 75)"
  on-dark: "oklch(0.96 0.004 75)"
  line-on-dark: "oklch(0.32 0.008 75)"
  stroke-on-dark: "oklch(0.52 0.008 75)"
  destructive: "oklch(0.577 0.245 27.325)"
  destructive-on-dark: "oklch(0.68 0.19 27.325)"
  success: "oklch(0.50 0.13 150)"
  success-on-dark: "oklch(0.75 0.15 150)"
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
    fontFamily: "Schibsted Grotesk, Helvetica Neue, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "normal"
  body:
    fontFamily: "Schibsted Grotesk, Helvetica Neue, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Schibsted Grotesk, Helvetica Neue, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.01em"
rounded:
  sm: "2px"
  md: "4px"
  lg: "8px"
spacing:
  inline: "8px"
  stack: "16px"
  group: "32px"
  section: "64px"
  band: "120px"
components:
  button-primary:
    backgroundColor: "{colors.brass}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "16px 32px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "oklch(0.63 0.12 78)"
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

Two materials carry this system. Brass is the made thing: warm, precise, machined, the colour of something manufactured to a tolerance. Daylight is the lived thing: buildings shown in real light, with real weather and real people around them. Everything else — the surfaces, the type, the rules — gets out of their way.

### Imagery policy

The company has no photographs of its own completed buildings. Since the entire emotional register of this system is carried by imagery, that gap is a design constraint, not a content backlog, and it is governed by a three-tier policy:

1. **Renders lead.** Product imagery — every model, every hero — is 3D visualisation of urbanbricks' own designs. Each carries a persistent visible label: *"Visualisation — not a photograph of a delivered building."* The label is part of the image component, not an optional caption, and it is not removable by a page author. Prefab manufacturers sell from renders as a matter of course; a labelled render is honest, a render passed off as a photograph is not.
2. **Real process photography where it exists.** Factory floor, welding, materials, fit-out, loading, installation. This is imagery urbanbricks can authentically produce today, and it is the strongest available evidence for the "weeks, not years" claim because it shows the mechanism rather than the outcome.
3. **Stock as context only, with the risk recorded.** Stock photography is permitted for setting and texture — landscape, site, sky, street — but never as the depiction of an urbanbricks building. Human Owner has explicitly accepted the residual risk of stock use; the exemption and its reasoning are recorded in the project spec.

**The Not-Ours Rule.** No image may imply that urbanbricks built something it did not build. A stock photograph of somebody else's container home presented as a product shot is prohibited outright — it is the visual form of the borrowed credibility PRODUCT.md forbids, and it is worse than showing nothing. `ASSET-LICENSES.md` records, per image, not only the licence but the subject and whether it depicts an identifiable third-party product.

Until renders exist, pages ship with labelled placeholder renders at the correct aspect ratio — never with coloured panels, gradient blocks, or CSS illustrations standing in for imagery.

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
- **Ink Surface** (`oklch(0.21 0.012 75)`): full-bleed dark sections used for rhythm — the delivery-process band, the closing quote block. Body text on it lifts to **On Dark** (`oklch(0.96 0.004 75)`, 15.78:1) with line-height raised by 0.05.
- **Muted On Dark** (`oklch(0.74 0.006 75)`, 7.68:1): the dark-surface counterpart to Muted Ink. Spec labels and captions inside an Ink Surface band use this. Muted Ink itself measures 2.28:1 on Ink Surface and is prohibited there.
- **Line** (`oklch(0.90 0.004 75)`): purely decorative hairlines — spec-table dividers, section rules, card edges. 1px, always. At 1.35:1 against white it is deliberately below the UI-component threshold, which is permitted only because it never carries meaning or bounds a control.
- **Line On Dark** (`oklch(0.32 0.008 75)`, 1.40:1 against Ink Surface): the dark-surface counterpart to Line. Decorative hairlines only, same exemption and same prohibition — it never bounds a control. Reusing Line itself inside a dark band produces a ~13.9:1 near-white rule where a hairline was intended, which is a visual defect even though it passes contrast.
- **Stroke On Dark** (`oklch(0.52 0.008 75)`, 3.22:1 against Ink Surface): the dark-surface boundary for anything interactive. Clears the 3:1 WCAG 1.4.11 threshold on Ink Surface, which the light Stroke does not (2.28:1 there).
- **Stroke** (`oklch(0.64 0.006 75)`): the boundary of anything interactive — input fields, select triggers, checkbox and radio outlines, secondary button borders. Clears 3:1 against white (3.37:1) as WCAG 1.4.11 requires for UI component boundaries. Line is never substituted here; a 1.35:1 field border is a failure, not a lighter aesthetic.

### State
- **Destructive** (`oklch(0.577 0.245 27.325)`, 4.76:1 on white): form validation errors and the field stroke of an invalid input. On Ink Surface it drops to 3.72:1 and must be swapped for **Destructive On Dark** (`oklch(0.68 0.19 27.325)`, 5.65:1).
- **Success** (`oklch(0.50 0.13 150)`, 5.65:1 on white): submitted-successfully confirmation only. Never a decorative "positive" accent — brass owns emphasis, green owns one meaning. On Ink Surface, **Success On Dark** (`oklch(0.75 0.15 150)`, 8.45:1).

Both are the only hues in the system besides brass, and both are earned by meaning rather than by mood. Neither ever appears without accompanying text.

### Named Rules

**The Every-Surface Rule.** Every token that can appear on Ink Surface has a dark-surface counterpart, and the counterpart is mandatory — not a fallback. Deep Brass (2.66:1), Muted Ink (2.28:1), Destructive (3.72:1) and an ink focus ring (1.06:1) all fail on Ink Surface. On dark: delivery and price figures use **Brass** (7.60:1) rather than Deep Brass, muted copy uses Muted On Dark, and the focus ring inverts to On Dark (15.78:1). A dark section built from light-surface tokens is a defect, and the delivery-process band — the one place the brand's central claim is argued — is dark.

**The No-Cream Rule.** Backgrounds are pure white or ink. Never sand, bone, parchment, linen, oat, or any near-white with warmth mixed in. Warmth in this brand comes from brass and from photography; the moment it enters the surface, the page becomes every other AI-generated landing page of 2026. If a background swatch reads as "paper", it is wrong.

**The Ten Percent Rule.** Brass covers no more than 10% of any viewport. It is a signal, not a theme. Two brass elements competing in one fold means one of them is not important.

**The Contrast Floor.** Body copy clears 4.5:1; large text clears 3:1; placeholder text is held to the same 4.5:1 as body, never a lighter grey. Muted Ink is the lightest permitted text colour on white. Interactive boundaries and state indicators clear 3:1 — which is why Stroke, not Line, bounds a control, and why the active nav underline is Deep Brass, not Brass. No state, error, or availability is communicated by colour alone — always colour plus text, weight, or icon.

Measured against white: Ink 18.81:1 · Muted Ink 7.77:1 · Deep Brass 6.68:1 · Stroke 3.37:1. Ink on Brass (the primary button) 8.07:1. **Brass is never type and never a lone state indicator** — on white it measures 2.33:1 and fails both thresholds.

## 3. Typography

**Display Font:** Archivo Expanded (fallback Archivo, Helvetica Neue, sans-serif)
**Body Font:** Schibsted Grotesk (fallback Helvetica Neue, sans-serif)

Both are grotesques, and the contrast between them is deliberately **width**, not style. Archivo Expanded is broad, planted, and architectural — headlines occupy space the way a building occupies a site. Schibsted Grotesk is compact, plain, and undramatic — drawn for news and data interfaces, it reads like documentation, which is exactly the register a delivery promise should be written in. Setting a wide display against a compact body produces real hierarchy without reaching for a serif the brand has no reason to own.

> **Why not Golos Text** (the original choice, replaced 2026-07-22): its `tnum` feature is broken in the upstream source. The `.tf` tabular glyphs exist and the feature applies, but they carry five different advance widths (580/585/605/610/620 per 1000 em) instead of one — verified against `google/fonts` main, v2.004, not a subsetting artifact. Numbers in the spec table would not align, which defeats the signature component. Schibsted Grotesk's tabular digits measure a single advance across all ten, spread 0.
>
> The wider lesson, recorded because it cost a rework cycle: **a font advertising `tnum` is not evidence that `tnum` works.** Public Sans and Onest fail the same way; Libre Franklin and Wix Madefor Text have no tabular figures at all. Any future body-font change must be verified at the binary level before it is written into this document.

Both are served self-hosted through `next/font`. No external font requests: this is a performance decision and a privacy one, since a visitor's IP never reaches a third-party font server.

> **Implementation gates — resolve all three before the first page ships.**
> 1. "Archivo Expanded" is not a separate Google Fonts family; it is Archivo's variable `wdth` axis at roughly 125. `next/font/google` must request it explicitly via `axes: ['wdth']`, and the width must be set in CSS. A plain `Archivo` import will silently render at normal width and the entire width-contrast hierarchy disappears.
> 2. The fallback chain must carry `size-adjust` / metric overrides. An expanded display face falling back to Helvetica Neue is a large metric jump and will cause visible layout shift.
> 3. The spec table depends on tabular figures. Confirm the served Schibsted Grotesk build exposes a **working** `tnum` — not merely that the feature is listed. Verify at the binary level that all ten tabular digit glyphs carry one identical advance width. Golos Text passed the "is the feature present" check and still failed here.
>
> The pairing itself is a recommendation, not a locked decision. If Archivo Expanded proves unusable, the replacement must still provide the width-contrast axis and must not appear on the reflex-reject list.

### Wordmark

The company has no logo. Until one exists, the wordmark is typographic and nothing else: **urbanbricks** set in Archivo Expanded 700, lowercase, letter-spacing `-0.02em`, in Ink on light surfaces and On Dark inside dark bands. Lowercase because the name is two common nouns joined, and capitalising it would make it announce itself in a voice this brand does not use.

No symbol, no monogram, no icon mark is to be improvised. The favicon is the letter `u` in the same face on an Ink field; the default OG image is the wordmark on Ink at 1200×630. When a real identity is commissioned, this section is replaced, not extended.

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
- **Hover / Focus:** background deepens to `oklch(0.63 0.12 78)` over 150ms ease-out; no lift, no scale, no shadow. That is a 1.53:1 shift from resting brass — the earlier value was 1.21:1 and read as no feedback at all. The ink label still clears 5.29:1 on the hover fill. Focus-visible draws a 2px ring offset 2px: **Ink** on light surfaces, **On Dark** inside an Ink Surface band. An ink ring on Ink Surface measures 1.06:1 and is invisible; the surface decides the ring, always.
- **Secondary:** white fill, 1px Ink border, ink label. Used for the browse-models path so the quote CTA is never in visual competition with it.

### Cards / Containers
- **Corner Style:** 4px
- **Background:** white on white, separated by a 1px rule rather than by a fill change
- **Shadow Strategy:** none — see Elevation
- **Border:** **Stroke** (`oklch(0.64 0.006 75)`, 3.37:1) whenever the card is itself a link or control — a model-grid card is a UI component and its boundary must clear 3:1 under WCAG 1.4.11. Line (1.35:1) is permitted only on cards that are pure content with no interactive affordance.
- **Internal Padding:** 32px desktop, 16px below 768px

Cards are used only where the content is genuinely a set of peers — the model grid. They are never used to hold a single idea, and never nested.

### Inputs / Fields
- **Style:** white fill, 1px Stroke (`oklch(0.64 0.006 75)`) border, 4px radius, 14px/16px padding
- **Focus:** stroke shifts to Ink and thickens to 2px; no glow, no colour change
- **Error:** stroke shifts to Destructive (or Destructive On Dark inside a dark band), plus an ink-coloured message below the field naming what to fix, associated via `aria-describedby`. Never colour alone.
- **Success:** on submit, the form is replaced by a confirmation in Success with body copy in Ink — not a green field border. Green appears once, with words beside it.
- **Disabled:** Muted Ink label, Line fill, cursor not-allowed, and an explanation of why nearby

Every field has a persistent visible label. Placeholder-as-label is forbidden.

### Navigation
- Schibsted Grotesk at Label size, ink, sentence case. The active item carries a 2px **Deep Brass** underline plus a weight step to 600 — Deep Brass rather than Brass because an active-state indicator is a UI component under WCAG 1.4.11 and needs 3:1 (Brass on white is only 2.33:1), and the weight step means the state survives for anyone who cannot see the colour at all. Sticky on scroll with the hairline rule, never a shadow. Below 900px it collapses to a full-height sheet with the quote CTA pinned to the bottom, thumb-reachable.

### Spacing

Keys are **semantic, never t-shirt sizes**: `inline` (8px, within a component) · `stack` (16px, between related elements) · `group` (32px, between groups) · `section` (64px, between sections) · `band` (120px, between full-bleed bands). Vary them for rhythm — generous separations against tight groupings — rather than applying one step uniformly.

Two reasons for the naming, and the second is not stylistic. The names say *when* to reach for each. And Tailwind 4 resolves named `max-w-*` / `w-*` utilities from the spacing namespace as well, so declaring a `--spacing-sm` silently redefines `max-w-sm` from 24rem to 16px. `f4-shell` lost a mobile navigation sheet to exactly that — clamped to 16px wide, and the failure looked like a layout bug rather than a token bug. **Reintroducing `xs`/`sm`/`md`/`lg`/`xl` here breaks every named width utility in the project.**

### The Module Grid (signature system)

The layout grid is not a generic 12-column scaffold. It is derived from the real dimensions of the containers urbanbricks builds from: a 20ft module is 20×8ft, a 40ft module is 40×8ft. The page grid uses a **5:2 base cell** (the 20ft footprint), and every major composition resolves to whole cells — a 40ft model occupies two cells, a stacked two-storey build occupies two cells vertically.

**Gutter ratio: `0.025` of the cell width** — the joining gap between mated modules, taken as 1/40 of the module length (six inches on a twenty-foot module). Every derived measure follows from this one number, including the stacked crop: two cells plus one gutter is `2 + 2 + 5r` cell-height units, so `aspect-module-stacked` is `5 / 4.125`. Change the ratio and both follow; do not hand-tune either.

**Column counts are fixed per breakpoint, never `auto-fit`.** `auto-fit` makes the number of tracks depend on available width, which leaves cell boundaries unaddressable — and an addressable boundary is the whole point, because hairline rules land on cell boundaries and process steps step across cells. A grid whose cells cannot be named is a generic grid wearing this system's vocabulary.

This is what the brand actually owns. The palette is a reasonable answer to "not industrial, not Scandinavian"; the grid is an answer nobody else in this category has, because it is derived from the product rather than chosen from a mood board. It must therefore be **visible, not merely underlying**: hairline rules land on cell boundaries, image crops obey the 5:2 ratio, the model grid's cards are literal module footprints, and the process band's steps step across cells rather than sitting in equal thirds.

Where a layout cannot resolve to whole cells, the layout is wrong — not the grid. On mobile the grid collapses to a single cell width and the ratio is preserved in image crops, which is what keeps the system recognisable at every size.

### Spec Table (signature component)
The component the automotive-configurator reference exists to justify, and the one that carries the brand's credibility. A two-column list — Label left in Muted Ink, value right in Ink — separated by 1px Line rules, no zebra striping, no card wrapper, no icons. Values are set in Schibsted Grotesk with tabular figures so numbers align down the column.

Delivery-window and price-band rows are the exception that earns brass: the value sits in Deep Brass at Title weight. In development, any value still wrapped in `unverified()` renders with a visible marker so unconfirmed figures cannot be mistaken for facts during review.

## 6. Do's and Don'ts

### Do:
- **Do** keep backgrounds at pure white (`oklch(1 0 0)`) or Ink Surface (`oklch(0.21 0.012 75)`).
- **Do** put warmth in the brass and in the photography, never in the surface.
- **Do** hold brass to ≤10% of any viewport, and to CTAs, the active nav underline, and delivery/price figures only.
- **Do** follow the three-tier imagery policy: labelled renders lead, real process photography where it exists, stock for context only. Zero imagery is a defect, not restraint.
- **Do** resolve every major composition to whole cells of the Module Grid, and keep the grid visible rather than merely underlying.
- **Do** swap in the dark-surface token whenever content sits on Ink Surface — Brass not Deep Brass for figures, Muted On Dark for labels, On Dark for the focus ring.
- **Do** build hierarchy from width and weight — Archivo Expanded against Schibsted Grotesk.
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
- **Don't** present any image in a way that implies urbanbricks built it when it did not, and don't strip the "Visualisation" label off a render.
- **Don't** build a dark section out of light-surface tokens. Deep Brass, Muted Ink, Destructive and an ink focus ring all fail on Ink Surface.
- **Don't** bound a clickable card with Line (1.35:1). Interactive boundaries use Stroke.
- **Don't** use Success green as a decorative positive accent. It carries one meaning, always with words.
