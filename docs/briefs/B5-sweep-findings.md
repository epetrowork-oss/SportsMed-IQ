# Correction batch B5 — findings from the full-corpus 343 px sweep

**Six images.** Found on 2026-08-15 when all 139 lesson diagrams were re-checked
at the size students actually see them. These are **separate from B3 and B4** and
should be briefed separately again — B3 is a relabelling redraw, B4 is two
one-line edits, and this batch is mostly *composition and body-text* work.

✅ **All six cards are ready to send.** Card 1's owner decision was made on
2026-08-15 — **Option A** — and its section below now carries the final build
spec rather than a question. Read Card 1's section first anyway: it is the
highest-priority card in the batch and the only one where the wording change is
the point rather than the legibility fix.

---

## The size target (same as B3/B4)

Diagrams are capped at `max-width: 26rem`: a 900 px source displays at **343 px on
a phone**, **416 px on tablet/desktop, never larger**.

- 16:9 → source 900 × 506, displayed 343 × 193
- 4:3 → source 900 × 675, displayed 343 × 257

**Acceptance test:** render at 343 px, blow it up nearest-neighbour, and confirm
the text reads as letters rather than merged blobs. **Ship the 343 px render
alongside each source file.**

**What actually predicts failure**, learned from this sweep: not size alone.
Fifteen cards with small text passed. The ones that fail are small **and** italic,
or small **and** low-contrast grey, or small **and** reversed out of busy art.
Keep body text plain, dark, and non-italic and it survives surprisingly small.

---

## Card 1 — `heat-illness-cold-water-immersion-technique.webp` ✅ SPEC BELOW

- Unit: `heat-illness.json` (**9-10**) · 4:3 (900 × 675)
- Folder: `public/images/units/heat-illness/`

**There are two separate problems here, and the first was not an art problem.** It
required an owner decision, which has been made — Option A, spec in 1a below.
Nothing here is blocked.

### 1a. The card contradicts the lesson

The card's most legible instruction reads:

> **CONTINUE COOLING UNTIL THE ATHLETE REACHES ABOUT 102°F (38.9°C)**

The 9-10 lesson teaches the opposite for this band: *"keep cooling without
stopping until EMS takes over the athlete's care."* The string "102" appears
**zero times** anywhere in `heat-illness.json`.

That was a deliberate change — commit `4fab815`, *"Refine grade 9-10 heat-stroke
handoff wording"*, replaced *"Stop active cooling when core temperature reaches
about 100-102°F"* with the keep-cooling wording, in both the callout and the
flashcard. It is a scope-of-practice call: a student is not the person who decides
when to stop cooling someone with heat stroke. The 11-12 unit still carries
100-102°F, which is right for that band.

The card does carry a softening sub-line — *"Cooling beyond 102°F is safe and may
be necessary depending on the situation"* — **but that sub-line is one of the
lines that dissolves at 343 px.** So on a phone the stop-at-102 instruction is
readable and its qualifier is not.

**Nothing here is medically wrong.** 102°F is a real clinical target. The question
is which band should see it.

### ✅ DECIDED 2026-08-15 — Option A. This is the spec; build to it.

**Replace the entire blue "CONTINUE COOLING UNTIL…" box with a box reading:**

> **KEEP COOLING UNTIL EMS TAKES OVER**

**Remove the numeric target from this card completely** — both the large
*"REACHES ABOUT 102°F (38.9°C)"* line and the small sub-line *"Cooling beyond
102°F is safe and may be necessary depending on the situation."* Neither
should appear anywhere on the card. Keep the circled check-mark icon and the
box's blue styling; only the words change.

**Do not carry the number to another part of the card.** 102°F stays with the
11-12 unit, which teaches it in prose and is the band where a stop-threshold
belongs.

**Also fix the box heading directly above it.** It currently reads *"MONITOR
TEMPERATURE & CONTINUE COOLING"* with the sub-line *"Monitor core body
temperature continuously."* Since the student is no longer monitoring toward a
number, make it **"KEEP COOLING"** with no monitoring sub-line — core-temperature
monitoring is a clinician's job and the 9-10 lesson does not ask the student to do
it.

*(Rejected alternatives, recorded so this is not relitigated: keeping the number
with inverted emphasis still hands a stop-threshold to a 9-10 student; changing
the lesson back would reverse a deliberate scope-of-practice decision made in
commit `4fab815`.)*

### 1b. Almost none of the card is readable anyway

Independent of the above, this is the **worst legibility case in the project**.
Seven numbered boxes, and the body text under every heading merges into blobs at
343 px: *"Stir or agitate the water the entire time to maximize cooling"*,
*"Monitor core body temperature continuously"*, *"Stabilize with cooling first.
Transport only after the athlete's temperature is lower and condition is
stable"*, and the sub-line in 1a.

**And the lesson does not carry this content** — "stir", "agitate" and "submerge"
are each **x0** in `heat-illness.json`. This card is the only place that procedure
exists, on a life-threatening emergency, and it is unreadable on a phone.

**The ask, once 1a is decided: cut this card down.** Seven boxes is at least three
too many for 343 px. Keep the steps a student can actually act on — get them in
cold water, submerge as much of the body as possible, keep the water moving, keep
cooling until EMS takes over — and drop the clinician-facing monitoring detail,
which the lesson does not teach either. Fewer boxes, body text at the size the
headings use now.

---

## Card 2 — `eap-aed-wall-case.webp` (composition)

- Unit: `emergency-action-plan-ms.json` (**7-8**) · 4:3 (900 × 675)
- Folder: `public/images/units/emergency-action-plan/`

**The right-hand text block runs off the right edge of the frame.** The final
glyphs of *"Know where the AEDs are"* and *"so you can point an adult"* are sliced
by the boundary — there is **zero right margin**.

No word is lost, so the meaning survives, but this is the same production defect
that produced "COMPRESSIO" on `ankle-sprain-rice-steps`, and it is on a 7-8 card
carrying a get-help instruction.

**Fix:** re-lay the panel so the full text sits inside the frame with **≥ 12 px of
clean background on every edge**. Design, colours and the three icon rows are
otherwise correct and should not change.

---

## Card 3 — `concussion-brain-movement-mechanism.webp` (composition)

- Unit: `concussion.json` (**9-10**) · 4:3 (900 × 675)
- Folder: `public/images/units/concussion/`

The bottom-right caption **"Body hit can jolt the brain"** collides with the inset
panel's border rule — the horizontal line runs straight through the second line of
the text — and the circular inset boundary clips its descenders.

**Fix:** move the caption clear of both the rule and the circle edge, or move the
rule. The anatomy illustration is correct and should not change.

---

## Card 4 — `heat-illness-sweat-cooling.webp`

- Unit: `heat-illness-ms.json` (**7-8**) · 4:3 (900 × 675)
- Folder: `public/images/units/heat-illness/`

The right-hand *"THE SWEAT COOLING PROCESS"* panel has four numbered steps. The
**headings survive** at 343 px (*BODY TEMPERATURE RISES*, *SWEAT FORMS ON THE
SKIN*, *EVAPORATION REMOVES HEAT*, *HIGH HUMIDITY REDUCES COOLING*). **Every body
paragraph under them dissolves**, as does the *"BETTER COOLING: LOW HUMIDITY / AIR
MOVEMENT / MORE EVAPORATION"* strip along the bottom and the *"EVAPORATION CARRIES
HEAT AWAY"* callout over the photo.

This is the **7-8** band, which is the most image-dependent of the three.

**Fix:** keep the four headings and the four icons; **delete the body paragraphs**
and let the headings carry it, or keep at most one short line per step at the
current heading size. Then use the reclaimed space to enlarge the bottom
"BETTER COOLING" strip, which is a real teaching point and currently the smallest
text on the card.

---

## Card 5 — `shoulder-injuries-dislocation-vs-ac-sprain.webp`

- Unit: `shoulder-injuries.json` (**9-10**) · 16:9 (900 × 506)
- Folder: `public/images/units/shoulder-injuries/`

The two leader labels — **"squared-off contour"** (left panel) and **"step-off
bump"** (right panel) — merge into blobs at 343 px. These are the *recognition
signs*, which is the entire teaching of a compare-the-two-injuries card.

⚠ **Correction:** an earlier draft of this brief said "squared-off" appears **×0
in the 9-10 lesson prose**, and used that to argue the label was not redundant.
**That was a false count** — the search used the image's hyphenated spelling, and
the lesson body writes it unhyphenated: *"the shoulder may look 'squared off' —
the normal rounded contour is lost because the ball is no longer sitting in the
socket."* Both recognition signs are in the prose after all. Caught by Codex on
PR #61.

**The fix still stands, but on legibility grounds alone, not redundancy.** These
two labels are the only text on a compare-the-two-injuries card, and they are
currently unreadable at the size students see them — a card whose entire job is
"here is what each one looks like" should not have its two answers dissolve.

**Fix:** print both labels at the size of the panel titles *Dislocation* / *AC
sprain (separation)*. There is plenty of white space on both sides of the figures;
this needs no re-composition, just larger type.

---

## Card 6 — `eap-cpr-hand-placement.webp`

- Unit: `emergency-action-plan.json` (**9-10**) · 4:3 (900 × 675)
- Folder: `public/images/units/emergency-action-plan/`

In the green *"PUSH HARD AND FAST"* box, the two dose lines merge: *"at least 2
inches (5 cm) deep"* and *"100–120 compressions per minute"*. The bold labels
*Push hard* / *Push fast* survive; the numbers under them do not.

Lower severity than the cards above — the lesson does carry these numbers — but
they are the CPR dose, so they are worth being legible.

**Fix:** enlarge the two dose lines to match the *Push hard* / *Push fast* labels.
Everything else on this card reads and should not change.

---

## Standing rules (unchanged)

WebP · exact filenames and folders above · same ratio and dimensions as the current
files · **30–60 KB** · no logo or watermark · no empty callout boxes · full-frame ·
correct spelling · **no photographs and no identifiable or photorealistic people**.

**Margins:** ≥ 12 px of clean background on every edge, nothing from a neighbouring
card in frame. Two of these six are margin failures, so this one matters.

**Transfer:** send finished files **inside a zip** (bare `.webp` uploads have failed
twice), with a PNG copy as a fallback. Say explicitly whether each file is a pixel
edit or a fresh redraw.
