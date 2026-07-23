# Urbanbricks Image Generation Design

## Goal

Generate the 15 production images specified in `docs/image-generation-worklist.md` and save them as PNG files in `/Users/xtation/AgentWorks/Filmarket/bricks-image/` using the exact required filenames and dimensions.

## Generation Strategy

For each of the seven exterior models, generate two candidate source images from the model-specific prompt plus the global constraints. Automatically inspect both candidates and select the one that best matches the prompt while avoiding prohibited traits. If neither candidate passes, regenerate both candidates, up to two retry rounds.

Generate two candidates for the shared residential interior and apply the same selection and retry policy.

## Exterior Outputs

Use one selected source image per model to preserve architectural identity between its hero and card images. Crop and resize that source independently to:

- Hero: `1600×640`, ratio `5:2`
- Card: `1200×800`, ratio `3:2`

Crop around the building so both outputs retain the full architectural concept, key glazing, module seams, and contextual environment. Do not stretch images.

The seven model pairs are:

- `harbor-20-hero.png`, `harbor-20-card.png`
- `harbor-40-hero.png`, `harbor-40-card.png`
- `meridian-hero.png`, `meridian-card.png`
- `meridian-stack-hero.png`, `meridian-stack-card.png`
- `counter-hero.png`, `counter-card.png`
- `workroom-hero.png`, `workroom-card.png`
- `basecamp-hero.png`, `basecamp-card.png`

## Interior Output

Select one shared residential interior candidate and crop or resize it without distortion to:

- `residential-interior.png`: `1200×900`, ratio `4:3`

## Review Criteria

Every exterior image must visibly read as a refined modern shipping-container structure with smooth panel or composite cladding, substantial glazing, natural light, a real landscaped setting, and refined but legible module seams.

Reject candidates containing exposed corrugated steel, cargo numbers or stencil lettering, warning yellow, rust, graffiti, construction sites, container yards, ports, visibly old containers, loud multicolor treatment, or a Nordic timber-cabin appearance.

Also reject candidates whose module count or arrangement contradicts the assigned model, whose building is materially cropped out of either target ratio, or whose visual quality is unsuitable for architectural product photography.

The interior must remain calm, uncluttered, naturally lit, photorealistic, and subtly legible as a container-derived home. Reject images with people, excessive staging, distorted architecture, or implausible geometry.

## Verification

After generation:

1. Confirm that all 15 exact filenames exist in the destination directory.
2. Confirm every file is encoded as PNG.
3. Confirm exact pixel dimensions for every output.
4. Visually inspect final cropped files, not only their source candidates, against the global and model-specific constraints.
5. Report any image that could not satisfy the constraints within two retry rounds instead of silently accepting it.
