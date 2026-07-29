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

**On rendering style (decided 2026-07-27, after batch 13):** a batch may mix
photorealistic and flat-illustrated renders, and should when realism carries
the teaching better — skin findings, tape texture, and limb anatomy read more
clearly rendered realistically, while scenes with people and process/flow
diagrams work better illustrated. Do **not** ask a batch to be stylistically
uniform for its own sake. What stays prohibited is unchanged and is about
subject, not rendering style: **no photographs, and no identifiable or
photorealistic people** — realistic *anonymous body parts* (a forearm, a foot,
hands) are fine and welcome; faces should be illustrated or absent.

## Progress

Done and merged: home hero, 7 category icons, 18 unit thumbnails, and the lesson
diagrams for the **4 safety-critical strands** — concussion, heat-illness,
emergency-action-plan, and wound-care (each 8/8, sourced; wound-care cites
NATA Acute Skin Trauma on all bands plus Stop the Bleed on 9-10/11-12; two
of its images had a right-edge production-sheet bleed fixed in-repo by
white-filling the margin — see `docs/IMAGE-BATCHES.md` batch 6).

**Current totals (recounted 2026-07-28, after batch 15):
105 of 139 lesson-diagram slots live (76%), and 131 of 165 image slots
overall** (139 diagrams + 18 thumbnails + 7 category icons + 1 hero). Count
these from the repo rather than trusting a prior line — an earlier handoff
put diagram progress at "115 of 139," which was the total-mapped-files
number (115/165) mistakenly written against the diagram denominator. To
recount: walk each unit JSON's section `image.asset` values and test each
against `REAL_IMAGE_PATHS` in `src/components/ImagePlaceholder.jsx`.

Batch 7 (**ankle-sprain**) is complete 9/9 (2026-07-15) + sourced with the
NATA Ankle Sprains position statement (2013, doi:10.4085/1062-6050-48.4.02).
Three images (swelling-signs, rice-steps, deformity-warning) first came back
on the wrong topic and were redone on-topic; several images across both the
first delivery and the redo had neighbor-card slivers at a margin, fixed
in-repo the same way as batch 6.

Batch 8 (**fractures-dislocations**) is complete 8/8 (2026-07-16, clean
delivery — no slivers, no photos, all on-topic) + sourced with the NATA
Appendicular Joint Dislocations position statement (2018) and AAOS OrthoInfo
"Open Fractures." Two author refinements (recognition-graphic
fracture-vs-dislocation; small-wound open fracture) were sound and the unit
JSON alts were updated to match.

Batch 9 (**knee-acl**) is complete 8/8 (2026-07-16 — anatomy vetted, no
slivers/photos) + sourced with the NATA ACL Prevention and Patellofemoral
Pain position statements (2018) and AAOS OrthoInfo ACL. Codex caught the
differential chart's meniscal swelling timing ("2-3 days") contradicting the
app's own "hours to a day"/"overnight" teaching; fixed in-repo by removing the
"(2-3 days)" parenthetical (cell now reads "Usually gradual"). Row 8 came as a
skeletal biomechanics diagram (user-approved); its alt was updated to match.

Batch 10 (**shoulder-injuries**) is complete 8/8 (2026-07-16, clean delivery
— best anatomy yet: glenoid/labrum, four rotator-cuff muscles with a
posterior-cuff inset, separate AC joint, Bankart/Hill-Sachs, classic-vs-
internal impingement, dislocation-vs-AC signs all correct) + sourced with the
NATA SLAP and Appendicular Joint Dislocations statements (2018) and AAOS
OrthoInfo shoulder instability. Minor: the dislocation figure cradles the arm
rather than the classic "held away"; landed (squared-off sign is correct),
alt made position-neutral.

Batch 11 (**muscle-strains**) is complete 8/8 (2026-07-16, clean delivery —
anatomy vetted incl. the gracilis/adductor subtlety, DOMS chart timing matches
the lesson) + sourced with the JOSPT hamstring-strain recommendations (2010)
and AAOS OrthoInfo soft-tissue injuries. NOTE: these two sources were not
pre-earmarked in the list below (muscle-strains had none) — worth a quick
human confirm of the JOSPT DOI/citation.

Batch 12 (**overuse-injuries**) is complete 8/8 (2026-07-16, clean delivery —
most number-heavy batch, all values verified against the lesson: ACWR
0.8/1.3/1.5, bone-stress continuum + risk sites, four-stage pain ladder) +
sourced with Gabbett (BJSM 2016), a bone-stress-injury BJSM reference, and
AAOS OrthoInfo stress fractures. Two alts updated to match delivered images
(close-ups not a body outline; throwing shoulder). NOTE: the BJSM
bone-stress DOI and the AAOS stress-fractures URL are best-effort and worth a
human confirm.

Batch 13 (**taping-wrapping**) is complete 8/8 (2026-07-27, clean delivery —
no slivers, no wrong-topic files) + sourced with the NATA ankle-sprains
position statement, whose Recommendation 28 covers prophylactic taping and
bracing. The sensitive `materials-comparison` chart correctly frames
kinesiology tape as mixed evidence / possible sensory cueing with none of
the marketing claims the 11-12 unit teaches students to question.
`capillary-refill-check` arrived at 274 KB and was re-encoded in-repo to
58.2 KB (q=82, alpha preserved); `dont-hide-pain`'s alt was rewritten
because the delivered figures are faceless and show no wince. Landing this
strand also surfaced a lesson-vs-source conflict, fixed in the same PR: the
11-12 unit asserted that taping without rehab shifts load to the knee or
hip, while the NATA statement it now cites says taping and bracing have not
been found to increase knee injuries — the passage was reworked to state
what the evidence does and does not support. See `docs/IMAGE-BATCHES.md`
batch 13 for a style note about this batch mixing photoreal and illustrated
renders.

Batch 14 (**warmup-injury-prevention**) landed **6 of 8** (2026-07-27 —
every file inside the size budget on arrival, no slivers). The two
nuance-sensitive scene images came back right: neither `dynamic-vs-static`
nor `move-vs-hold` marks static stretching as wrong. The two 11-12 graphs were
**held and then redone successfully** (landed 2026-07-28). Both were caught
by Codex on PR #47 after this session's own vet passed them:
`stress-strain-curve` drew cold tissue failing at a higher force than warm,
contradicting the lesson's "shorter length and lower force," and
`pap-window-graph` put the fatigue curve entirely above a y-axis labeled
"performance relative to baseline." Both redos were verified by pixel
measurement rather than by eye — see `docs/IMAGE-BATCHES.md` batch 14 for
the numbers. **Lesson worth carrying forward: an image can satisfy every
number in a brief and still invert a relationship the lesson states in
words. Check direction, not just values — and measure it, because both of
these looked fine at a glance.** One file
arrived named `...-stress-strain-graph.webp` against a slot named
`...-stress-strain-curve.webp`; the art was verified correct for the slot
and then renamed.

**warmup-injury-prevention sources (restored 2026-07-28 with DOIs).** These
three were added when the strand landed, **removed** on a Codex catch
(PR #47) because nothing had been verified, and then **restored** once full
bibliographic records including DOIs came back through ChatGPT:
- *Comprehensive warm-up programme to prevent injuries in young female
  footballers: cluster randomised controlled trial* — Soligard et al., BMJ
  2008;337:a2469, doi:10.1136/bmj.a2469 (all three bands; the FIFA 11+ trial
  behind the 9-10 unit's structured-programs section)
- *A review of the acute effects of static and dynamic stretching on
  performance* — Behm & Chaouachi, Eur J Appl Physiol 2011;111(11):2633-2651,
  doi:10.1007/s00421-011-1879-2 (9-10 and 11-12; the static-stretching power
  dip)
- *Factors modulating post-activation potentiation and its effect on
  performance of subsequent explosive activities* — Tillin & Bishop, Sports
  Med 2009;39(2):147-166, doi:10.2165/00007256-200939020-00004 (11-12; PAP)

**Be precise about what is and isn't established here.** The *publication
records* are verified — full author lists, volume, issue, pages, and DOIs,
which independently matched a separate derivation of the same three
citations. What has *not* happened is anyone in this loop opening the papers
and confirming they support the specific sentences they are attached to.
These three are canonical references for exactly the claims they back, so
the match is high-confidence, but it is inference rather than reading. DOI
hosts (doi.org, Crossref, PubMed) are blocked by the container proxy, so
this cannot be closed from a session — it needs the PDFs uploaded, the way
the NATA statement was checked for taping-wrapping.

**One specific caveat, flagged by ChatGPT and worth keeping:** the Tillin &
Bishop review may not support an *exact universal* 5-12 minute PAP window.
The lesson hedges this correctly in prose ("Most athletes see the window
open somewhere in the roughly 5-12 minute range... though it varies by
individual training status") and the flashcard says "Roughly 5-12 minutes,"
so no text change was made. But `pap-window-graph` draws 5 and 12 as crisp
dashed boundaries, which reads harder than the prose. If that range is ever
challenged, soften the image rather than the already-hedged text.

Also unsourced in this strand: the 11-12 claim that raising muscle
temperature by roughly 1-2 °C meaningfully shifts tissue properties.

✅ **RESOLVED (2026-07-28) — the lesson's "lower force" claim is correct.**
This was flagged during batch 14 as a possible lesson-vs-literature
conflict. It was not one, and the error was in the flag: "warmed muscle
fails at a greater force" and "cold tissue fails at a lower force" are the
same relationship stated from opposite ends, not opposing findings. Checked
against the project source set and reported back with page references:
- *Sports Medicine: Just the Facts*, printed p. 57 (PDF p. 80) — warmed
  muscle "fails at higher loads than control muscle," citing Safran et al.
  (1988).
- *IOC Manual of Sports Injuries*, printed p. 78 (PDF p. 88) — animal
  studies show "the load to failure is higher after warm-up."

So the 11-12 lesson text stands as written, and the corrected
`stress-strain-curve` (cold failure point down-and-left of warm) is
consistent with both the lesson and the sources. No change needed to either.
Worth remembering as a review habit: before flagging a claim as
contradicting the literature, check whether the two statements are just
inverses of each other over the same comparison.

Batch 15 (**cold-exposure**) landed **7 of 8** (2026-07-28) — mechanically
the cleanest delivery so far, and every line of the direction checklist added
to that brief came back satisfied. That checklist (spelling out each
relationship that could be drawn backwards, for the author to tick before
sending) is worth reusing on any strand with counterintuitive teaching.
Landing it also surfaced and fixed a pre-existing defect: the 11-12 flashcard
grouped frostnip with true frostbite as a "freezing injury" while noting in
the same sentence that frostnip has no ice crystals.

✅ **RESOLVED — `cold-exposure-frostbite-severity.webp` landed and the 9-10
lesson was changed to match it (owner decision, 2026-07-28).** ChatGPT
delivered a "frostbite after rewarming" comparison (clear/milky blister =
superficial, hemorrhagic = deep) with a "DO NOT PRESS OR TEST" banner, and
argued the lesson should drop its palpation test. The owner adopted it. The
lesson now says depth is hard to judge while the tissue is frozen, tells
students not to press or rub, and puts the blister distinction after
rewarming under medical care; the slot's description/alt and the "Frostbite:
signs" flashcard were updated to match, and the quiz needed nothing. The
cited guidelines (NATA 2008, WMS 2024, ACSM 2021) could not be read from the
container, so **no source was added** — the change was judged on scope-of-
practice grounds, not on citations. If those PDFs ever land in a session,
this section is the first place to attach them.

**Watch for this pattern:** ChatGPT edited the brief it was handed and
returned the modified copy, and two of its four proposed lesson changes were
reactions to compressions in *the brief's paraphrase* rather than to the
lesson itself. Always diff a proposed content change against the unit JSON
before acting on it.

**Next:** finish batch 15's held image, then batch 16 = **dental-facial-trauma**,
then batches 17–20 (one strand each) per `docs/IMAGE-BATCHES.md`.

**Recurring quality issue to watch (batches 6 + 7):** ChatGPT keeps
exporting cards with a sliver of the neighboring panel bleeding into a
margin, and batch 7 also shuffled three topics onto the wrong filenames and
used photoreal people once. Worth firmer up-front direction to the image
author: one standalone full-frame illustrated card per named file, nothing
from adjacent cards in view, no photographs. Regenerate a batch's per-image brief anytime from the
unit JSONs' `image` descriptions (or run `npm run images:shotlist`).

## Peer-reviewed sources already identified (cite when each strand lands)

The user provided these NATA position statements (Journal of Athletic Training).
Attach to each unit's `sources` when that strand's images land:

- **hydration-nutrition** — Fluid Replacement for the Physically Active.
  2017;52(9):877–895. https://doi.org/10.4085/1062-6050-52.9.02 · and Safe
  Weight Loss and Maintenance Practices in Sport and Exercise. 2011;46(3):
  322–336.

Already cited (merged): concussion → NATA Bridge Statement (2024;59(3):225–242,
doi:10.4085/1062-6050-0046.22); heat-illness → Exertional Heat Illnesses
(2015;50(9):986–1000, doi:10.4085/1062-6050-50.9.07); emergency-action-plan →
EAP Development and Implementation in Sport (2024;59(6):570–583,
doi:10.4085/1062-6050-0521.23); wound-care → Management of Acute Skin Trauma
(2016;51(12):1053–1070, doi:10.4085/1062-6050-51.7.01) plus Stop the Bleed
(ACS Committee on Trauma, stopthebleed.org) on the 9-10/11-12 units for
packing/tourniquet guidance; ankle-sprain → Conservative Management and
Prevention of Ankle Sprains in Athletes (2013;48(4):528–545,
doi:10.4085/1062-6050-48.4.02); fractures-dislocations → Immediate Management
of Appendicular Joint Dislocations (2018;53(12):1117–1128,
doi:10.4085/1062-6050-421-17) plus AAOS OrthoInfo "Open Fractures";
knee-acl → Prevention of ACL Injury (2018;53(1):5–19,
doi:10.4085/1062-6050-99-16) and Management of Patellofemoral Pain
(2018;53(9):820–836, doi:10.4085/1062-6050-231-15) plus AAOS OrthoInfo ACL;
shoulder-injuries → Overhead Athletes With SLAP Injuries (2018;53(3):209–229,
doi:10.4085/1062-6050-59-16) and Immediate Management of Appendicular Joint
Dislocations (2018) plus AAOS OrthoInfo shoulder instability;
taping-wrapping → Conservative Management and Prevention of Ankle Sprains in
Athletes (2013;48(4):528–545, doi:10.4085/1062-6050-48.4.02) on all three
bands — the same statement cited on ankle-sprain, reused here because its
Recommendation 28 is the direct evidence for prophylactic taping/bracing.
Citation verified against the source PDF, so unlike the batch 11/12 sources
it needs no human confirm.

Still uncited in taping-wrapping: the 11-12 unit's claim that a substantial
share of rigid tape's motion restriction is gone within about 20–30 minutes
of activity. It is well established in the taping literature, but the NATA
ankle statement does not address mechanical decay (its reference list was
checked), so no citation was attached rather than guessing one.

Not mapped to any current unit: Type 1 Diabetes (no unit) and Facilitating
Work-Life Balance (professional-practice, not a student lesson).
