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

# ✅ THE IMAGE PIPELINE IS COMPLETE (2026-08-03)

**139 of 139 lesson-diagram slots live (100%), and 165 of 165 image slots
overall.** Verified by walking all 54 unit pages in a browser: 139 diagrams
rendered, **0 placeholders remaining anywhere**, 0 console or network errors.
All 20 batches are landed and merged.

There is no remaining image work. What follows is kept as the record of how
it was done, and what is still open elsewhere.

**Old totals line (superseded, recounted 2026-08-01 after batch 19):
134 of 139 lesson-diagram slots live (96%), and 160 of 165 image slots
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

Batch 16 (**dental-facial-trauma**) landed **5 of 8** (2026-07-29). All
three reversals the brief flagged came back correct — intrusion/extrusion,
crown-not-root, and the opposite-side mandible fracture — so the direction
checklist continues to earn its place. `mouthguard` was landed with its
alt reconciled (a dental model rather than the briefed athlete).

✅ **All three redos landed (2026-07-30), batch 16 complete 8/8.** Both
nosebleed images had come back as anatomical skeletons instead of athletes,
and `injury-types-overview` had been a photorealistic adult face using 11-12
clinical vocabulary that omitted the avulsed tooth. The redos fixed all of
it, and the 9-10 nosebleed image kept the salvageable idea from its rejected
version as a labelled BONY BRIDGE / SOFT PART inset. Three alt/description
fields were reconciled in the process.

**Two patterns worth carrying into later briefs.** First, "an athlete" needs
saying twice — twice now a delivery has substituted a non-person subject
(skeletons here) where a relatable figure was the point. Second, for 7-8
slots, state the vocabulary level explicitly and list the plain-language
terms the lesson uses, because the clinical register creeps in otherwise.

Batch 17 (**eye-injuries**) landed **7 of 8** (2026-07-31). The batch's
riskiest image, `subconjunctival-vs-hyphema`, came back correct — flat patch
on the white with the iris clear, versus blood pooled inside the anterior
chamber with a fluid level, not swapped — and `anatomy-cross-section` placed
all five leader lines on their own structures after the batch-16 problem was
flagged in its brief. `protective-eyewear` was landed with its alt
reconciled (goggles alone rather than worn).

✅ **Both outstanding corrections landed 2026-07-31, and nothing is now
queued behind the image pipeline.** `eye-injuries-minor-irritation-rinse` was
redrawn with two people — an adult doing the rinsing — replacing a version
that showed the athlete rinsing their own eye. The batch-16
`dental-trauma-tooth-anatomy-handling` leader line was corrected surgically:
a pixel-diff against the live original showed only 0.42% of pixels changed,
and a 3x crop confirmed the `Root` dot now lands on the cream dentin clear of
the blue ligament layer.

**Transfer gotcha worth knowing:** a bare `.webp` sent to the image author
failed to arrive twice. Zips have transferred reliably in both directions all
project, so **send source files for surgical edits inside a zip**, and
include a PNG copy as a fallback in case the WebP extension is what the
uploader rejects. Also worth stating explicitly when a correction is a *pixel
edit* versus a *fresh redraw* — a request that grouped both under
"corrections" led to the author waiting on an "approved" file for an image
that had actually been rejected and needed regenerating from spec.

**A recurring pattern, now three batches running:** specs that say "an
athlete wearing/doing X" keep coming back with the person removed —
skeletons in batch 16, object-only product shots for `mouthguard` and
`protective-eyewear`. Landing the object-only ones with reconciled alts is
fine when nothing is wrong, but if a slot genuinely needs the behaviour
modelled, say so twice and say why.

Batch 18 (**hydration-nutrition**) landed **7/7 clean** (2026-08-01) — the
first delivery since batch 15 with nothing held and nothing reconciled. All
three flagged reversals came back right, including the safety-critical one:
`hyponatremia-vs-dehydration` carries the "more water makes this WORSE"
banner with no drink-more cue anywhere in that panel.

**Sourced, and scoped by content rather than by the earmark.** Fluid
Replacement (2017, doi:10.4085/1062-6050-52.9.02) went on all three bands;
Safe Weight Loss (2011, no DOI in the earmark) went on **11-12 only**,
because that is the one band with a weight-class/RED-S section. Worth
repeating the habit: an earmarked source still has to be checked against
what each band actually teaches before it is attached.

Batch 19 (**skin-conditions**) landed **6/6 clean** (2026-08-01). Both
accuracy risks came back right: ringworm is drawn as a ring with a clearer
centre rather than a solid disc, and MRSA is drawn as deceptively minor,
which is the lesson's actual point.

⚠ **A correction worth carrying forward.** The batch table in
`docs/IMAGE-BATCHES.md` summarised this strand as "recognize/**cover**/refer."
That was wrong — the lesson explicitly names *"covering it with a bandage and
playing through"* as the mistake, and says *"Tell an adult — don't just cover
it up."* Covering is correct only for a closed blister, which is not an
infection. **Treat the one-line strand summaries in that table as prompts to
go read the lesson, not as specifications.** This is the second time an
inherited one-liner nearly produced a wrong image — the other was the bonking
annotation in a slot `description` (batch 18). Audit inherited text against
the lesson body before writing any brief from it.

✅ **The jock-itch panel is corrected and landed (2026-08-03).** It now reads
as a broad demarcated plaque at phone width rather than a red line, with
panels 1 and 2 preserved (0.44% pixel-diff over the left 600 px, i.e.
recompression only).

**Standing lesson from it: judge recognition images at the size students see
them, not zoomed in.** Cropping and magnifying proves a detail exists; it
does not prove a student will see it. Every diagram in this project was
checked the magnified way, so a display-size sweep across the landed images
is worth doing — the multi-panel comparison charts are the likeliest
candidates, since each panel gets a third of 900 px and far less on mobile.
When requesting a fix for this class of defect, ship a render at display size
alongside the source file so the failure mode is visible rather than
described.

Batch 20 (**sports-psychology**) landed **5/5 clean** on 2026-08-03 — the
final batch. All the strand's safety requirements were met: no image depicts
crisis, self-harm, or acute distress (that material is text-only in all three
bands by design), nothing is clinical, and the tone is warm throughout.
`recognize-withdrawal` correctly shows withdrawal rather than exclusion, and
`listening-scene` includes the approaching adult, which was non-negotiable
since without it the image would teach peer support as the endpoint.

✅ **RESOLVED 2026-08-04 — the RED-S gap is closed.** The IOC REDs consensus
was supplied and is now attached to the four units that actually teach the
topic. The original finding is kept below because the reasoning still matters.

⚠ **(Historical) Still uncited in sports-psychology: the 11-12 unit's RED-S section**
(`sports-psychology-adv.json`, "RED-S: the medical urgency behind the
pattern"). Neither attached source supports it, and both PDFs were searched
to confirm that rather than assumed: AMSSM 2020 mentions "relative energy
deficiency" exactly once and only in its **reference list** (ref 36, the IOC
RED-S consensus), with zero occurrences of "energy availability,"
"menstrual," "bone stress," or "stress fracture" anywhere; NATA 2015 mentions
amenorrhea twice, once as an anorexia-nervosa diagnostic criterion and once
in a reference title, and never as an energy-availability signal. The section
makes specific claims — low energy availability, missed cycles as a medical
sign, recurrent bone stress injuries as a red flag — that need the IOC RED-S
consensus (Br J Sports Med 2014;48:491–497) or an equivalent. **The strand
is sourced but not fully sourced; don't read it as closed.**

## What is still open

## Display-size QA sweep — DONE 2026-08-03, and it found real defects

**The heading above used to say "nothing image-related." That was wrong, and
the sweep is why we know.** All 139 lesson diagrams were re-checked at the
size students actually see them.

**The measured display size** (Playwright, production build, `deviceScaleFactor
1`): `.lesson-image` is capped at `max-width: 26rem`, so a diagram renders at
**416 px on tablet and desktop and 343 px on a 375 px phone — never larger.**
A 900 px source is therefore shown at **38–46%**. A six-panel strip gives each
panel ~57 px of phone width; a five-column table gives each column ~68 px.
**Author to 343 px, not to 900.**

### A. Composition defects — content clipped by the frame (5) — ✅ FIXED 2026-08-03

**All five were redrawn and landed the same day.** Every clipped line is now
complete and inside the frame: `deformity-warning` shows *"Seek medical help
immediately."* in a callout with a full bottom border, `rice-steps` reads
**COMPRESSION** and **15–20**, `inversion-mechanism` reads **stretched**,
`know-your-school-map` shows **AED LOCATION** / **TRAINED ADULT LOCATION**
and a complete tip box, and `yell-for-help-scene` has no trace of the AED
card at its bottom edge. Designs are otherwise unchanged.

Margins measured on the redraws: **14–52 px of clean background on every edge
of every file** (the brief asked for ≥ 12). Two of the cards carry a
deliberate 1 px hairline border at the canvas edge — measure margins from
*inside* that rule or the check reports a false 0.
`inversion-mechanism` kept a genuine alpha channel (60.6% fully transparent,
all four corners clear). Verified live at 375 px: all five render at 343 px,
0 placeholders, 0 console or network errors.

The original findings are kept below, since the redo brief was built from
them and the failure modes are worth not repeating.

Confirmed at full resolution, not inferred. These are defects at *any* size;
the sweep is just what surfaced them.

| File | Unit | What is broken |
|---|---|---|
| `ankle-sprain-deformity-warning.webp` | ankle-sprain-ms (7-8) | Bottom callout runs off the frame — **"Seek medical help immediately." is cut in half**, and the pink box has no bottom border. Ink is present on the final pixel row. |
| `ankle-sprain-rice-steps.webp` | ankle-sprain-ms (7-8) | Right column clipped: the heading reads **"COMPRESSIO"** and the dose reads **"Use ice for 15–2"**. |
| `ankle-sprain-inversion-mechanism.webp` | ankle-sprain (9-10) | Caption clipped: **"outside get stretched"** loses its final letter at the right edge. |
| `eap-yell-for-help-scene.webp` | emergency-action-plan-ms (7-8) | **A ~30 px sliver of the neighbouring "KNOW WHERE THE AED" card is baked into the bottom edge**, headline clipped mid-glyph. This is the recurring export defect described below — it shipped. |
| `eap-know-your-school-map.webp` | emergency-action-plan-ms (7-8) | Right edge clipped: **"AED LOCATIO"**, **"TRAINED ADUL"**, and the blue tip box runs off the frame. |

Three of the five are **7-8 units**, and two of those clip a *get-help*
instruction — the highest-stakes line on the card.

**Why edge-profiling missed these.** The existing check looked for a
neighbour-panel *sliver* — a long contiguous run of ink along an edge. Clipped
text is the opposite signature: many short, disconnected glyph strokes. A
detector tuned for one is blind to the other.

**And no, this was not then solved with a better detector — three were tried
and all three were unusable**, which is worth recording so the next session
doesn't repeat the attempt:

- *long-run test* — every card with a drawn border trips it; the border is a
  100%-length run on all four edges.
- *glyph-run test* — 23 flags, mostly borders, and it still missed
  `ankle-sprain-rice-steps` and `eap-yell-for-help-scene`.
- *depth-persistence test* (ink at the edge that continues 14 px inward,
  meant to separate a 2 px border from real content) — 74 flags, dominated by
  full-bleed photos and hero images, and it **still** never flagged
  `ankle-sprain-deformity-warning`, the most clearly broken file of the five.

The problem is that "ink at the margin" is normal for most of this artwork,
so the signal-to-noise is bad no matter how the threshold is drawn. **What
actually worked was looking:** render every diagram to 343 px, tile them into
contact sheets, read the sheets, then crop any suspicious edge at full
resolution to confirm. That found all five, and it is the method to repeat.
No script is committed, because a gate that misses the worst case while
emitting 74 false positives would buy false confidence.

### B. Legible at 900 px, illegible at 343 px (14)

Not wrong, just unreadable on a phone. Ranked by how much of the teaching is
lost.

**This list rests on visual review at 343 px, not on a measurement.** An
attempt was made on 2026-08-03 to put it on a measured footing, after Codex
overturned one of the three judgement calls in this sweep. **The attempt
failed, and the failure is documented here because the first write-up of it
was itself wrong.**

What was measured: body-region glyph heights for all 14 (title band excluded,
since headings were never the problem), scaled by 343/900. They come out at
**2.3–5.7 px effective**, and none reaches 8 px.

⚠ **That does not confirm anything, and the first version of this section
wrongly said it did.** The same metric was then run across all 125 lesson
diagrams with enough text to measure and flagged **114 of them** — including
cards that are plainly readable at 343 px:

- `knee-acl-warning-signs` (2.7 px) — has essentially no body text; the metric
  was measuring incidental marks
- `muscle-strains-grading-comparison` (5.0 px) — "Grade I / II / III" is clear
- `hydration-nutrition-hyponatremia-vs-dehydration` (5.0 px) — every label
  reads, including the "More water makes this WORSE" banner

**So a score below 8 px does not imply illegible.** Which means "none of the 14
scores ≥ 8 px" proves nothing about whether any of them was over-called — the
threshold cannot be rejected as meaningless when it flags 114 images and then
relied on as proof for 14. That was the inconsistency; the measurement is
merely *consistent with* the visual finding, and independently confirms
nothing.

**Why the metric fails:** a median over every glyph blob is dominated by fine
print, punctuation, and illustration noise, and has no idea *which* text
carries the teaching. A card whose entire message is three large words scores
like a five-column table. Legibility here is semantic — is the text that
matters readable? — and no single scalar answers it. **Treat this metric as
unsuitable for classifying images, in either direction.**

### Status of the corpus, stated precisely

- **The 14 listed above** — flagged by visual review at 343 px. Solid enough to
  act on. Not independently measured.
- **The other 111 of the 114 metric flags** — **unreviewed, not cleared.** Only
  3 were spot-checked, and those 3 only prove the metric produces false
  positives. They say nothing about the remaining 111. Note also that the 14
  are themselves inside the 125-image run, so the 114 flags necessarily mix
  real cases with false ones.
- **Whether a 15th group-B image exists** — unknown. Completeness rests on a
  single eyeball pass over 139 diagrams.

Closing this properly needs a broader or representative 343 px readability
review, judged per image on whether the *teaching-bearing* text survives. Until
that happens, **do not read this list as closed and do not read the corpus as
cleared.**

**Dense tables — every cell unreadable, only the headers survive:**
`knee-acl-differential-comparison-chart` (11-12, 5 cols × 4 rows),
`muscle-strains-differential-chart` (11-12, 4 × 3),
`eap-team-role-assignment` (11-12, densest card in the project),
`overuse-injuries-bone-stress-continuum` (11-12, 4 stages + 6 labelled sites).

**Six-panel strips — panel names survive, descriptor row does not:**
`dental-trauma-luxation-spectrum` (11-12),
`fractures-dislocations-pattern-classification` (11-12),
`concussion-return-to-play-stages` (9-10).

**Anatomical annotation too small to read:**
`shoulder-injuries-bankart-hill-sachs` (11-12),
`shoulder-injuries-glenohumeral-anatomy` (9-10),
`dental-trauma-mandible-ring-anatomy` (11-12),
`eye-injuries-orbital-blowout-entrapment` (11-12),
`knee-acl-anatomy-mechanism` (9-10, high-risk-mechanism labels),
`muscle-strains-two-joint-muscles-map` (9-10),
`overuse-injuries-acwr-graph` (11-12, axis and annotations — the card whose
printed title is "Acute:chronic workload ratio"; the asset name does not
match the title, so search by asset).

The concentration in **11-12** is the pattern: the advanced bands got the
information-dense cards, and density is exactly what display size destroys.

### C. RETRACTED — there is no group C

**An earlier version of this sweep claimed `concussion-second-impact-risk.webp`
(concussion-ms, 7-8) was a comprehension defect: "two near-identical rows of
brain icons," with the lesson's point "not recoverable at any size." That was
wrong, and it is worth recording why.**

The image is a **three-stage progression, not a repeated row**: first impact
(football, blue) → a brain with an orange hot spot inside a dotted ring with a
**clock**, meaning still healing → second impact (football, red) with a bright
core and radiating arrows. The row beneath restates the same three stages in
simplified brains, and the icon strip above runs shield → yellow warning → red
warning. The colour escalation and the two impacts separated by a clock remain
distinguishable at 343 px. **It conveys "a second hit before the first heals is
catastrophic" without text, which is what it was asked to do.**

The error was mine and it was a judgement error, not a measurement one: I read
the second row as a duplicate of the first at thumbnail size and did not go
back to the full-resolution file before writing it up — the exact inversion of
the discipline the jock-itch panel taught, where magnification flattered an
image. **Both directions are real: small can hide detail that exists, and small
can also invent a flaw that isn't there. Confirm at both sizes before calling
something defective.**

No action is needed on this file.

### What held up

The three fixes made this session all survive display size, checked
explicitly: the **jock-itch plaque** reads as a broad demarcated rash, and
both batch-14 redos are still right — **PAP** shows fatigue below baseline
with potentiation above, and **stress-strain** shows cold failing at lower
force. The safety-critical
`hydration-nutrition-hyponatremia-vs-dehydration` banner ("More water makes
this WORSE, not better.") is fully legible at 343 px, as are every *get an
adult* / *call 911* line except the two clipped ones in group A.

### Suggested order

Group A was a correctness fix and is done. Group B is a redesign ask — fewer
columns, larger type, or splitting a table across two cards — and is worth
doing per strand rather than all at once. There is no group C.

✅ **Every strand is now sourced. All 54 unit files carry a `sources` array
as of 2026-08-04.** dental-facial-trauma, cold-exposure and skin-conditions
landed 2026-08-03; eye-injuries closed it on 2026-08-04.

That is coverage, not completeness — **seven claim-level gaps remain** (see the
table below), and one strand's source carries an age caveat worth acting on
(eye-injuries, see the ledger). A 2009 IOC/Wiley injury-prevention textbook was offered
and **declined**: searched full-text, it had 0 hits for frostbite, tinea,
impetigo, MRSA, herpes, nosebleed and RED-S, and its only eye content was a
policy case study on mandating ice-hockey face protectors — nothing on
recognition or management. Attaching it would have made a strand read as
sourced while its substance stayed uncited.

⚠ **Seven claims remain uncited inside strands that are otherwise sourced.**
(RED-S was closed 2026-08-04; eye-injuries' chemical-exposure section was added
the same day when its source proved not to cover it.)
Tracking coverage per *strand* hides these, which is how the tester-facing
count came to be wrong twice — keep this list complete, and update it whenever
a source is attached that doesn't cover everything a unit teaches.

| Strand / band | Uncited claim | Recorded at |
|---|---|---|
| warmup-injury-prevention 11-12 | Raising muscle temperature by ~1–2 °C meaningfully shifts tissue properties | batch 14 notes |
| taping-wrapping 11-12 | Much of rigid tape's motion restriction is gone within ~20–30 min of activity | ledger |
| eye-injuries 11-12 | The chemical-exposure section (source has 0 hits for "chemical"/"alkali"/"acid burn") | ledger |
| dental-facial-trauma 7-8, 9-10 | Nosebleed management (the NATA dental statement has 0 hits for "nosebleed"/"epistaxis") | ledger |
| cold-exposure 11-12 | Frostnip classified as a *non-freezing* injury | ledger |
| cold-exposure 11-12 | "Water conducts heat ~25× faster than air" | ledger |
| cold-exposure 11-12 | The "1-10-1 principle" naming (the physiology is covered; the mnemonic isn't) | ledger |

**A strand being sourced is not the same as every section in it being
sourced.** Any doc that quotes a count — `TESTERS.md` especially — must reflect
this table, not just the unsourced-strand count.

**Recurring quality issue to watch (batches 6 + 7):** ChatGPT keeps
exporting cards with a sliver of the neighboring panel bleeding into a
margin, and batch 7 also shuffled three topics onto the wrong filenames and
used photoreal people once. Worth firmer up-front direction to the image
author: one standalone full-frame illustrated card per named file, nothing
from adjacent cards in view, no photographs. Regenerate a batch's per-image brief anytime from the
unit JSONs' `image` descriptions (or run `npm run images:shotlist`).

## Source ledger

**No earmarked source is outstanding.** Every source the user supplied that
maps to a unit has been attached; the hydration-nutrition earmark that used
to sit here was applied when batch 18 landed and now appears in the cited
list below. What is missing is *sources for strands that have none*, not
unapplied earmarks — see "What is still open."

Cited (merged): concussion → NATA Bridge Statement (2024;59(3):225–242,
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

The five strands sourced during batches 14–20, which were landing faster than
this ledger was updated: muscle-strains → AAOS OrthoInfo "Sprains, Strains and
Other Soft-Tissue Injuries" (2022) on all three bands plus Hamstring Strain
Injuries: Recommendations for Diagnosis, Rehabilitation, and Injury Prevention
(JOSPT 2010, doi:10.2519/jospt.2010.3047) on 9-10/11-12; overuse-injuries →
AAOS OrthoInfo "Stress Fractures" (2022) on 7-8/9-10, Bone stress injuries
(BJSM 2022, doi:10.1136/bjsports-2021-104994) on 9-10/11-12, and The
training-injury prevention paradox (BJSM 2016,
doi:10.1136/bjsports-2015-095788) on 11-12; warmup-injury-prevention →
Comprehensive warm-up programme to prevent injuries in young female
footballers (BMJ 2008, doi:10.1136/bmj.a2469) on all three bands, A review of
the acute effects of static and dynamic stretching on performance (Eur J Appl
Physiol 2011, doi:10.1007/s00421-011-1879-2) on 9-10/11-12, and Factors
modulating post-activation potentiation (Sports Med 2009,
doi:10.2165/00007256-200939020-00004) on 11-12; hydration-nutrition → Fluid
Replacement for the Physically Active (2017;52(9):877–895,
doi:10.4085/1062-6050-52.9.02) on all three bands and Safe Weight Loss and
Maintenance Practices in Sport and Exercise (2011;46(3):322–336, no DOI in the
earmark) on 11-12 only, scoped to the one band with a weight-class section;
sports-psychology → Interassociation Recommendations … Psychological Concerns
at the Secondary School Level (2015;50(3):231–249,
doi:10.4085/1062-6050-50.3.03) on all three bands and the AMSSM position
statement on Mental Health Issues and Psychological Factors in Athletes (BJSM
2020;54:216–220, doi:10.1136/bjsports-2019-101583) on 9-10/11-12 only, since
it is physician-oriented and the 7-8 unit only teaches notice/care/tell.

**eye-injuries → Sports Medicine: Just the Facts, Chapter 28 "Ophthalmology"**
(Martinez RA, Ellini KA), McGraw-Hill, 2005. Attached to all three bands
2026-08-04, closing the last unsourced strand.

⚠ **This reverses an earlier decision, deliberately, and the reasoning should
be visible.** This text was offered earlier for cold-exposure, eye-injuries and
skin-conditions together and was **declined** in favour of "modern dedicated
guidance." That was right at the time — and cold-exposure and skin-conditions
each subsequently got a dedicated position statement. For eye-injuries it was
reconsidered on the evidence, not on fatigue: the book contains a **dedicated
ophthalmology chapter by two MDs**, and its specific guidance matches what the
units teach almost line for line:

| What a unit teaches | What the chapter says |
|---|---|
| Rigid shield, don't patch or press | *"a rigid eye shield should be placed and the athlete sent for immediate ophthalmology evaluation"*; *"do not apply pressure to the globe"* |
| Hyphema is bleeding in the anterior chamber after blunt trauma | Matches, with the layering sign |
| Retinal detachment = same-day | *"flashing lights"*, new *"floaters"*, blind spot in the visual field |
| Orbital fracture with entrapment | *"pain with eye movements or diplopia (suggests extraocular muscle entrapment)"*; *"Hold athlete from any contact until released by ophthalmology"* |
| Polycarbonate sports goggles | *"polycarbonate lenses, which are up to 20 times stronger"*, ASTM standards, *"Contact lenses offer no protection whatsoever"*, eye protection reduces risk *"by 90%"* |
| Subconjunctival haemorrhage vs hyphema | Both described separately |

⚠ **Two limitations, both live.** (1) **It is 2005** — twenty-one years old.
The guidance above is the stable part of ophthalmic emergency care, but this is
the oldest source in the project by a decade and should be **upgraded when
possible**. The named upgrade target is unchanged: the **AAP/AAO joint policy
"Protective Eyewear for Young Athletes"**, which would also be a better fit for
the prevention sections specifically. (2) **It does not cover chemical eye
injury at all** — 0 hits for "chemical", "alkali" or "acid burn" — and the
11-12 unit has a dedicated *"Chemical exposure: the one injury where treatment
starts before history"* section. That is now on the uncited-claims table.

**RED-S / REDs → 2023 IOC consensus statement on Relative Energy Deficiency
in Sport (REDs)** — Mountjoy M, Ackerman KE, Bailey DM, et al., **Br J Sports
Med 2023;57:1073–1097**, doi:10.1136/bjsports-2023-106994. Supplied and
attached 2026-08-04, closing the longest-standing citation gap in the project.

⚠ **The supplied PDF's own running header gives a different, wrong citation —
do not "fix" this entry to match it.** The masthead and *To cite* block read
"Br J Sports Med 2024;57:1073–1098", which is internally inconsistent: volume
57 is the **2023** volume, and the end page disagrees with the article itself.

The explanation is on the PDF's **last page**, which carries a **correction
notice**. The article was published as **2023;57:1073–1097**; a correction was
later issued (**Br J Sports Med 2024;58:e4**,
doi:10.1136/bjsports-2023-106994corr1) updating Figure 6 and online
supplementary file 5, **online only, not in print**. The supplied file is that
corrected re-issue, and its running header was regenerated with the correction
year while keeping the original volume. The correction notice restates the
canonical citation in full, and that is what is used here.

**Rule learned:** "use the publisher's own *To cite* block" is normally right,
but when a PDF contains a correction notice, the notice's restatement of the
original citation outranks a regenerated running header. Caught by Codex on
PR #57 after I had trusted the header — and my *first* instinct
(2023;57:1073–1097) had been correct before I talked myself out of it.

**Attached to the four units that actually teach REDs, not to every unit that
says the word:**

| Unit | Why |
|---|---|
| overuse-injuries-adv (11-12) | Dedicated REDs section; defines energy availability and calls it "the modern, expanded version of what used to be called the female athlete triad" |
| sports-psychology-adv (11-12) | Dedicated "RED-S: the medical urgency behind the pattern" section |
| hydration-nutrition-adv (11-12) | REDs inside the weight-class / when-to-refer section |
| overuse-injuries (9-10) | Makes real claims — recurrent stress fractures + menstrual dysfunction → screen for REDs |

**Deliberately NOT attached to sports-psychology (9-10)**, which only
*cross-references* the topic — "the full physical picture (including RED-S) is
covered where nutrition and energy availability are taught in depth." A
pointer is not a claim, and attaching a source to it would inflate coverage.

Coverage check: low energy availability 53 mentions, energy availability 85,
menstrual 28, amenorrhoea 34, bone stress injuries 11, bone mineral density
12, eating disorders 47, disordered eating 13, female athlete triad 32. The
two claims Codex specifically challenged on PR #53 — menstrual dysfunction as
a medical sign and recurrent bone stress injuries as a red flag — are both
directly supported; the statement lists "Bone stress injuries" as a REDs
outcome under impaired bone health.

⚠ **A terminology question this raises, left for the owner rather than changed
unilaterally.** The 2023 consensus renamed the syndrome from **RED-S** to
**REDs** — it uses "REDs" 215 times and "RED-S" zero. Five unit files still
use "RED-S" (sports-psychology ×2 units, overuse-injuries ×2, hydration-
nutrition-adv). Nothing is *wrong*: "RED-S" remains widely understood and the
units spell out "Relative Energy Deficiency in Sport" correctly. But a unit
citing the 2023 statement while using the pre-2023 abbreviation is mildly
stale. **Changing terminology across five units is a content decision, not a
sourcing one.**

**skin-conditions → NATA Position Statement: Skin Diseases** (J Athl Train
2010;45(4):411–428), attached to **all three bands** on 2026-08-03. Coverage
checked per band: tinea 55 (tinea pedis 7, tinea cruris 4), impetigo 18,
MRSA 43 / methicillin 40, herpes 33, folliculitis 15, furuncle 21, molluscum
32, wrestling 47, hygiene 19. The 11-12 unit's herpes-gladiatorum clearance
section is the tightest fit — the statement carries the explicit criterion
(*"5 days of oral antiviral therapy and all lesions have a dried, adherent
crust"*), and the unit deliberately teaches the *structure* of clearance while
saying the exact day count is set by the governing body, so the statement's
specifics sit under it rather than against it. **Cited without a URL** — no
DOI is printed anywhere in the PDF text.

⚠ **A nuance worth protecting, because a careless future reading could
"correct" the lesson the wrong way.** The 7-8 unit teaches that *covering a
lesion and playing through is the mistake* — "Tell an adult, don't just cover
it." This statement contains passages that sound like the opposite: *"solitary
lesions can be appropriately covered or curetted before competition"* and
*"localized or solitary lesions may be covered with a gas-permeable dressing
followed by stretch tape."* **These do not conflict, because they address
different people.** The statement is written for athletic trainers and
physicians applying NCAA wrestling rules; the lesson is written for a student
deciding what to do on their own. It also contains the harder line in the same
breath — several infections *"cannot be covered to allow participation."*
**Do not soften the student-facing rule on the strength of the clinician-facing
one.**

**cold-exposure → ACSM Expert Consensus Statement: Injury Prevention and
Exercise Performance during Cold-Weather Exercise** (Current Sports Medicine
Reports 2021;20(11):594–607), attached to **all three bands** on 2026-08-03.
It explicitly "updates and replaces" the 2006 ACSM cold-injury position stand.
Coverage checked per band: frostbite (54 mentions), hypothermia (46, with a
full staging table at mild 32–35°C / moderate 28–31°C / severe <28°C),
rewarming (23), non-freezing cold injury (13), shivering (12); for the 11-12
unit specifically, cold-water immersion (8) with the four-stage immersion
model and cold shock (7), Swiss staging (9), cardiac arrest (21), and
avalanche burial (31).

✅ **This source independently confirms the frostbite lesson change made
earlier the same day.** That edit rewrote field rewarming to be gated on
**refreezing risk rather than injury depth**, after the palpation-depth test
was removed. The statement says it twice: *"If possible, the frozen part or
area should not be rewarmed unless refreezing can be avoided"* and *"The
region should only be thawed if refreezing can be prevented."* It also backs
the superficial case the unit teaches — superficial injury *"should be
rewarmed by contact with warm skin (their own, or someone else's) and further
cooling avoided."* The owner-approved change now has a 2021 consensus
statement behind it.

⚠ **Three claims in cold-exposure remain uncited, checked rather than
assumed.** (1) The 11-12 unit classifies **frostnip** as a non-freezing injury
(6 mentions); this statement never uses the word, and describes superficial
*frostbite* as "partial skin freezing" — so the classification is not
supported here, though not contradicted either. Sources genuinely differ on
whether frostnip is the mildest frostbite or a separate non-freezing entity.
(2) The **"water conducts heat ~25 times faster than air"** figure — 0 hits.
(3) The **"1-10-1 principle"** naming — 0 hits, though the statement covers the
same physiology as a four-stage immersion model. The underlying teaching is
sound; the two specific framings need their own citation.

**Cited without a URL.** No DOI is printed in the PDF's extracted text, and
DOI hosts are blocked from the container, so none was guessed — same rule
applied to the Safe Weight Loss statement.

**dental-facial-trauma → NATA Position Statement: Preventing and Managing
Sport-Related Dental and Oral Injuries** (J Athl Train 2016;51(10):821–839,
doi:10.4085/1062-6050-51.8.01), attached to **all three bands** on 2026-08-03.
Scoped by checking the PDF against what each band teaches rather than by
assumption: the statement covers avulsion (30 mentions), mouthguards (181),
milk/Hank's storage (9/3), replantation (14), and the luxation spectrum (28)
and mandible (23) content the 11-12 unit carries. Its own text confirms the
handling rules the units teach — replantation "should occur within 5 minutes,"
and a tooth that can't be replanted goes into "milk, or physiologic saline."

⚠ **Still uncited in dental-facial-trauma: the nosebleed content.** The 7-8
and 9-10 units teach nosebleed management (11 and 10 mentions), and this
statement has **zero** occurrences of "nosebleed" or "epistaxis" — checked, not
assumed. The source was still attached because it covers the dental core of
all three bands, but the nosebleed sections need their own citation.

Still uncited in taping-wrapping: the 11-12 unit's claim that a substantial
share of rigid tape's motion restriction is gone within about 20–30 minutes
of activity. It is well established in the taping literature, but the NATA
ankle statement does not address mechanical decay (its reference list was
checked), so no citation was attached rather than guessing one.

(Closed 2026-08-04, see the REDs entry above.) Was uncited in sports-psychology: the 11-12 unit's RED-S section — neither
attached source covers low energy availability, menstrual dysfunction, or
recurrent bone stress injuries. Both PDFs were searched to confirm it; see the
batch 20 entry above for what the search found and what would close the gap.

Not mapped to any current unit: Type 1 Diabetes (no unit) and Facilitating
Work-Life Balance (professional-practice, not a student lesson).
