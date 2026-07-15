# Session handoff — lesson-diagram image pipeline

This doc lets a fresh Claude session pick up the ongoing effort of landing
ChatGPT-generated **lesson-diagram images** into the app, one topic ("strand")
at a time. Read `PLAN.md` and `CLAUDE.md` first, then this.

Work on branch `claude/new-pr-review-dwy3fu` (branch fresh from `main` if it
already merged).

## How the app uses images

- Each unit JSON (`src/content/units/<strand>[-ms|-adv].json`) has lesson
  sections; a section may carry an `image` object (`asset`, `ratio`,
  `description`, `location`, `alt`). The three grade bands share a strand:
  `<strand>-ms.json` = 7–8, `<strand>.json` = 9–10, `<strand>-adv.json` = 11–12.
- An image only renders once its filename is added to the `REAL_IMAGE_PATHS`
  map in `src/components/ImagePlaceholder.jsx` (maps `"asset.webp"` →
  `"images/units/<strand>/asset.webp"`). Unmapped slots show a placeholder box,
  so it's safe to ship a partial set — the missing ones just stay placeholders.
- Image files live in `public/images/units/<strand>/`.
- **Per-lesson sources**: each unit may have a top-level `sources` array of
  `{ title, publisher, year, url }`, rendered as a collapsible "Sources"
  section on the lesson page. Schema is documented in `src/content/README.md`
  and validated by `scripts/validate-content.mjs`. Cite each strand as its
  images land.

## The workflow (per batch)

1. **The user uploads a zip** of images from ChatGPT. (ChatGPT relays files;
   it does **not** push to the repo — ignore any stray `chatgpt/*` branches.)
2. **Vet every image.** Mechanical: correct filename + folder, WebP, correct
   ratio (16:9 = 900×506, 4:3 = 900×675), 30–60 KB. Then **look at each one**:
   medical accuracy, correct spelling of any labels, non-graphic where required,
   full-frame (not a lone figure in empty space), and age-appropriate **scope**
   for 7–8 (a middle-schooler recognizes a problem and gets an adult; they don't
   perform advanced/emergency care). Use `sharp` (installed in the scratchpad)
   to check dimensions/size and to extract crops you then Read to view.
3. **Hold anything wrong**: leave it unmapped (and `git rm` the file), and write
   a short redo note for the user to hand ChatGPT. Land the good ones.
4. **Wire** the good images into `REAL_IMAGE_PATHS`; **add the strand's
   `sources`** entry to its unit JSONs (see the source list below).
5. **Verify**: `npm run validate:content` (must pass, 0 errors), `npm run build`,
   then browser-check with `playwright-core` (installed in scratchpad; chromium
   at `/opt/pw-browsers/chromium`) against `npm run preview` on port 4173. The
   app uses **hash routing**: `http://localhost:4173/SportsMed-IQ/#/unit/<id>`.
   Confirm mapped diagrams render (`img.image-slot-real`, `complete &&
   naturalWidth > 0`) and only intended slots show placeholders
   (`div.image-slot`). Confirm the Sources link resolves.
6. **Commit → push → PR → review.** Set `git config user.email
   noreply@anthropic.com` first. Open a PR, comment `@codex review`. Codex
   catches real issues (it caught a safety-pedagogy problem in the EAP batch —
   the 7–8 images told kids to run an emergency the lesson reserves for adults).
   Reply to and resolve its threads, fixing anything valid. **The user merges.**

## Standing image rules (put these in every batch brief to ChatGPT)

WebP; exact filenames/folders; render at the stated ratio; 30–60 KB; **no logo /
watermark**; **no empty callout boxes**; **full-frame** (no lone small figure in
empty white); labels spelled correctly; medical accuracy (a batch is reviewed
before merge); **non-graphic / stylized** for wound & blood topics; 7–8 =
simple + correct **scope of action** for the age.

## Progress

Done and merged: home hero, 7 category icons, 18 unit thumbnails, and the lesson
diagrams for the **3 safety-critical strands** — concussion, heat-illness,
emergency-action-plan (each 8/8, sourced). Roughly **58 of 165** image slots
live.

**Next:** batch 6 = **wound-care**, then batches 7–20 (one strand each) per
`docs/IMAGE-BATCHES.md`. Regenerate a batch's per-image brief anytime from the
unit JSONs' `image` descriptions (or run `npm run images:shotlist`).

## Peer-reviewed sources already identified (cite when each strand lands)

The user provided these NATA position statements (Journal of Athletic Training).
Attach to each unit's `sources` when that strand's images land:

- **wound-care** — Management of Acute Skin Trauma. 2016;51(12):1053–1070.
  https://doi.org/10.4085/1062-6050-51.7.01
- **knee-acl** — Prevention of ACL Injury. 2018;53(1):5–19.
  https://doi.org/10.4085/1062-6050-99-16 · and Management of Patellofemoral
  Pain. 2018;53(9):820–836. https://doi.org/10.4085/1062-6050-231-15
- **shoulder-injuries** — Evaluation/RTP for Overhead Athletes with SLAP
  Injuries. 2018;53(3):209–229. https://doi.org/10.4085/1062-6050-59-16
- **hydration-nutrition** — Fluid Replacement for the Physically Active.
  2017;52(9):877–895. https://doi.org/10.4085/1062-6050-52.9.02 · and Safe
  Weight Loss and Maintenance Practices in Sport and Exercise. 2011;46(3):
  322–336.

Already cited (merged): concussion → NATA Bridge Statement (2024;59(3):225–242,
doi:10.4085/1062-6050-0046.22); heat-illness → Exertional Heat Illnesses
(2015;50(9):986–1000, doi:10.4085/1062-6050-50.9.07); emergency-action-plan →
EAP Development and Implementation in Sport (2024;59(6):570–583,
doi:10.4085/1062-6050-0521.23).

Not mapped to any current unit: Type 1 Diabetes (no unit) and Facilitating
Work-Life Balance (professional-practice, not a student lesson).
