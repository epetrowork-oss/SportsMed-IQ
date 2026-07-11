# Image production batch plan

This is the working contract for producing the app's real images in
reviewable batches. It covers ordering, specs, and the per-batch quality
gate. The **per-asset briefs** (description, alt text, exact filename and
location for every slot) are NOT duplicated here — regenerate them anytime
with `npm run images:shotlist`; that output is the source of truth for
what each image should depict.

**Inventory (2026-07-11):** 165 slots total — 1 home hero, 7 category
icons, 18 unit-card thumbnails, 139 lesson diagrams (72 in grade band
7-8, 36 in 9-10, 31 in 11-12, matching the picture-density guideline in
`src/content/README.md`).

## Specs by image purpose

| Purpose | Ratio | Minimum pixels | Background | Per-file budget | Where displayed |
|---|---|---|---|---|---|
| Home hero | 21:9 | **1280×549** | white | ≤ 60 KB | Landing page, up to 640 CSS px wide |
| Category icon | 1:1 | 256×256 | transparent | ≤ 10 KB | Library section headers, 40 CSS px |
| Unit-card thumbnail | 3:2 | **680×453** | white | ≤ 30 KB | Library cards, ~340 CSS px wide |
| Lesson diagram | per brief (mostly 4:3 and 16:9) | **832 px wide** | per brief (mostly white) | ≤ 40 KB | Lesson body, up to 416 CSS px wide |

All files are WebP. Minimums are 2× the CSS display width so images stay
sharp on retina displays. The 450×300 thumbnails from the first batch are
below this bar — acceptable for now, but new thumbnails should meet it.

Worst-case total payload if every slot hits its budget: ~5.9 MB. Everything
ships in the offline precache (see rule 2 below), so report the batch's
actual byte total in each PR. If the running total trends past ~8 MB,
pause and flag it — we'd revisit compression targets before continuing.

## Hard rules (every batch — learned from PRs #26/#27)

1. **Verify every file decodes before committing.** Open each WebP from
   disk in a browser and look at it. PR #26 shipped a hero whose VP8
   bitstream was corrupt; it rendered as glitch noise on the landing page.
2. **Precache must include WebP.** The first batch to land adds `webp` to
   `globPatterns` in `vite.config.js` (currently
   `**/*.{js,css,html,svg,png,ico,woff2}`). Without it, images 404 on
   offline reload and the offline-first contract breaks. Do not claim
   offline support in a PR body without checking `dist/sw.js` actually
   lists the files after `npm run build`.
3. **PR descriptions must describe what is actually in the files.** The
   human reviewer (Evan) vets images against the PR's scene descriptions;
   that only works if they match. Don't paste the brief's aspirational
   description — describe the produced image.
4. **One batch in flight at a time, based on current `main`.** Every batch
   touches the shared `REAL_IMAGE_PATHS` map in
   `src/components/ImagePlaceholder.jsx` (add entries only; never remove
   others). Parallel image PRs conflict — #26 and #27 proved it.
5. **Code changes are limited to** new files under `public/images/…` plus
   map entries in `ImagePlaceholder.jsx` (and the one-time rule-2 glob
   fix). No content JSON, no workflows, no planning docs.
6. **Each PR reports:** file list with byte sizes, running payload total,
   `npm run build` output showing the files in the precache count, and
   confirmation of the decode check.

## Content-sensitivity notes

- **Wound care / bleeding (all bands):** instructional-illustration style,
  non-graphic — no realistic blood. The briefs already say this; it is a
  hard requirement, not a style preference.
- **Sports psychology (7-8 and 9-10 diagrams):** these units contain a
  carefully-reviewed crisis callout (suicide/self-harm disclosure). Images
  must be supportive scenes only — athletes talking, listening, resting.
  Never depict self-harm, crisis, or distress imagery. Evan reviews these
  images individually before merge.
- **7-8 band:** concrete, friendly, recognize-it scenes. **11-12 band:**
  technical diagram style is appropriate (grading charts, mechanism
  diagrams) per that band's depth contract.

## Batch schedule

Ordered by classroom visibility, then by safety-critical strands first
(concussion, heat illness, wound care, EAP, fractures, ankle), then the
rest. 7-8 gets its diagrams first — it's the picture-heavy band and the
most image-dependent audience.

### Batch 0 — IN FLIGHT: rework of PRs #26/#27 (12 images + glob fix)

Home hero (regenerated — old file corrupt, and at ≥1280px this time),
7 category icons (the head-spine, muscle-soft-tissue, and both extremity
icons need redesign — see PR #26 review), 4 safety-strand thumbnails
(concussion, heat-illness, emergency-action-plan, wound-care — see PR #27
review for what didn't match), plus the `webp` precache-glob fix.
Consolidate into **one** PR.

### Batch 1 — remaining 14 unit-card thumbnails

ankle-sprain, cold-exposure, dental-facial-trauma, eye-injuries,
fractures-dislocations, hydration-nutrition, knee-acl, muscle-strains,
overuse-injuries, shoulder-injuries, skin-conditions, sports-psychology,
taping-wrapping, warmup-injury-prevention. One shared style with batch 0's
four so the library grid reads as a set.

### Batches 2–7 — grade 7-8 lesson diagrams (72 images, 4 per unit, 12 per batch)

| Batch | Units (strand, `-ms` files) | Images |
|---|---|---|
| 2 | concussion, heat-illness, wound-care | 12 |
| 3 | emergency-action-plan, fractures-dislocations, ankle-sprain | 12 |
| 4 | eye-injuries, dental-facial-trauma, cold-exposure | 12 |
| 5 | knee-acl, muscle-strains, overuse-injuries | 12 |
| 6 | shoulder-injuries, taping-wrapping, warmup-injury-prevention | 12 |
| 7 | hydration-nutrition, skin-conditions, sports-psychology ⚠ sensitivity notes | 12 |

### Batches 8–10 — grade 9-10 lesson diagrams (36 images, ~2 per unit)

| Batch | Units (baseline files) | Images |
|---|---|---|
| 8 | concussion, heat-illness, wound-care, emergency-action-plan, fractures-dislocations, ankle-sprain | 13 |
| 9 | eye-injuries, dental-facial-trauma, cold-exposure, knee-acl, muscle-strains, overuse-injuries | 12 |
| 10 | shoulder-injuries, taping-wrapping, warmup-injury-prevention, hydration-nutrition, skin-conditions, sports-psychology ⚠ | 11 |

### Batches 11–12 — grade 11-12 lesson diagrams (31 images, ~2 per unit)

Technical/diagram style per the band contract. skin-conditions-adv and
sports-psychology-adv have no image slots.

| Batch | Units (`-adv` files) | Images |
|---|---|---|
| 11 | concussion, heat-illness, wound-care, emergency-action-plan, fractures-dislocations, ankle-sprain, eye-injuries, dental-facial-trauma | 16 |
| 12 | cold-exposure, knee-acl, muscle-strains, overuse-injuries, shoulder-injuries, taping-wrapping, warmup-injury-prevention, hydration-nutrition | 15 |

## Per-batch acceptance checklist (copy into each PR)

- [ ] Every file opened from disk in a browser and visually verified (no corrupt/garbled files)
- [ ] Dimensions meet the minimums in the spec table; ratio matches the brief
- [ ] Background matches the brief (white / transparent)
- [ ] PR body describes the actual produced images; Evan vets scenes against the files, not the brief
- [ ] Byte sizes listed per file; running payload total updated
- [ ] `npm run build` green; new files appear in the precache entry count in the build output
- [ ] `npm run validate:content` green (should be trivially true — no JSON changes allowed)
- [ ] Browser spot-check of the affected pages at 375px and desktop widths
- [ ] Sensitive-content notes respected (wound care non-graphic; sports-psychology supportive only)
