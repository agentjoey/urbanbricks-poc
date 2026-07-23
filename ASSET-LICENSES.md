# Asset Licenses & Placeholder Register

Every image shipped in `public/` is recorded here: source, licence, subject, and
whether it is a placeholder that MUST be replaced before launch.

## Policy (from DESIGN.md § Imagery policy + Human Owner "1+2" decision)

- **Renders lead** — final product imagery is 3D visualisation of urbanbricks'
  own designs, labelled "Visualisation…". Not yet produced.
- **Process photography** — real factory/build photos urbanbricks can produce.
  Not yet produced.
- **Stock as context / reference placeholder** — licensed CC0/commercial stock,
  used TEMPORARILY in product slots via the `ReferenceImage` component, labelled
  "Reference image — not an urbanbricks build". The **Not-Ours Rule** holds even
  for placeholders: a stock building is never presented as an urbanbricks build.

**Every row below marked `PLACEHOLDER` must be replaced before the site is shown
to real prospects.** `grep ReferenceImage src/` finds every slot still on
placeholder art; `pnpm verify:image-ratios` confirms crops match the slot ratio.

## Register

All 15 model images are **AI-generated 3D visualisations of urbanbricks' own
designs** (Human Owner, 2026-07-23), rendered from the prompts in
`docs/image-generation-worklist.md`. They carry the `RenderImage`
"Visualisation — not a photograph of a delivered building" label, which is
accurate: they are renders, not photos and not third-party buildings. No stock
`ReferenceImage` is in use. Ratios verified by `pnpm verify:image-ratios`.

| File | Slot (aspect) | Source | Licence | Subject | Status |
|---|---|---|---|---|---|
| `models/harbor-20-hero.png` | Harbor 20 hero (5:2) | AI render (own design) | Owner-generated | Dark 20ft container home, glazing, birch | ✅ Render |
| `models/harbor-20-card.png` | Harbor 20 card (3:2) | AI render (own design) | Owner-generated | Same building, three-quarter view | ✅ Render |
| `models/harbor-40-hero.png` | Harbor 40 hero (5:2) | AI render (own design) | Owner-generated | White 40ft container home, terrace | ✅ Render |
| `models/harbor-40-card.png` | Harbor 40 card (3:2) | AI render (own design) | Owner-generated | Same building | ✅ Render |
| `models/meridian-hero.png` | Meridian hero (5:2) | AI render (own design) | Owner-generated | Dark multi-module home, glazed | ✅ Render |
| `models/meridian-card.png` | Meridian card (3:2) | AI render (own design) | Owner-generated | Same building | ✅ Render |
| `models/meridian-stack-hero.png` | Meridian Stack hero (5:2) | AI render (own design) | Owner-generated | Two-storey stacked — NOTE: crop is close, reads as a detail not a whole building; flagged for a re-generation before launch | ⚠️ Render (weak crop) |
| `models/meridian-stack-card.png` | Meridian Stack card (3:2) | AI render (own design) | Owner-generated | Two-storey stacked | ✅ Render |
| `models/counter-hero.png` | Counter/bar hero (5:2) | AI render (own design) | Owner-generated | Dark-green container bar, serving hatch, blue hour | ✅ Render |
| `models/counter-card.png` | Counter/bar card (3:2) | AI render (own design) | Owner-generated | Same building | ✅ Render |
| `models/workroom-hero.png` | Workroom/office hero (5:2) | AI render (own design) | Owner-generated | White modular office, glazed entrance | ✅ Render |
| `models/workroom-card.png` | Workroom/office card (3:2) | AI render (own design) | Owner-generated | Same building | ✅ Render |
| `models/basecamp-hero.png` | Basecamp/camp hero (5:2) | AI render (own design) | Owner-generated | Dark container cabin, forest, misty | ✅ Render |
| `models/basecamp-card.png` | Basecamp/camp card (3:2) | AI render (own design) | Owner-generated | Same building | ✅ Render |
| `models/residential-interior.png` | Shared interior (4:3) | AI render (own design) | Owner-generated | Open-plan container interior, daylight | ✅ Render |

## Search brief (per slot)

Sources: Unsplash / Pexels only (CC0 / free-commercial). Match DESIGN.md art
direction — modern, natural daylight, clean lines, **no shipping-container
corrugation / cargo stencilling / hazard yellow / rust**, no Scandinavian-cabin
cliché. Crop to the exact ratio before saving.

| Slot | What to look for |
|---|---|
| Harbor 20 (20ft home) | small modern prefab/modular home, single compact box, dark cladding, big windows, daylight |
| Harbor 40 (40ft home) | single-storey modern prefab home, longer/lower, covered terrace, glass sliders |
| Meridian (double-width home) | wide modern modular home, open glazed gable, flat roof |
| Meridian Stack (two-storey) | two-storey modern modular/prefab home, upper cantilever or balcony |
| Counter (bar/café) | compact modern outdoor bar / coffee kiosk, serving hatch, string lights, evening glow |
| Workroom (office) | small modern modular office pod, glazed entrance, landscaped edge, daylight |
| Basecamp (cabin/camp) | small modern cabin at forest/countryside edge, picture window, raised on feet |
| Interior (shared) | modern minimalist small-home interior, open plan, pale wood, big window, daylight |
