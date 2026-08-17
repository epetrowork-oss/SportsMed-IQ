# Correction batch B6 — three photorealistic-people images

**Three images, all in heat-illness.** Found by a full audit of all 165 images in
the app on 2026-08-17.

These break the one image rule that has never changed: **no photographs, and no
identifiable or photorealistic people.** Every other image in the project is
illustrated; these three are photoreal renders of specific-looking individuals.

**Why only this strand:** heat-illness was **batch 4**, one of the earliest
delivered. The style rule was written down on **2026-07-27**, after batch 13.
These three predate it and were never re-checked against it. Nothing else in the
corpus has this problem.

---

## What is *not* being changed, so this is not over-corrected

The audit looked at all 165 images. **Roughly 30 contain a face, and all of them
are staying.** Two categories were explicitly confirmed as correct:

- **Faces that are the anatomy.** The dental, eye and ear/nose cards *need* a
  face — you cannot teach a knocked-out tooth, an orbital injury or a nosebleed
  without one. `dental-trauma-injury-types-overview`,
  `eye-injuries-warning-signs`, `eye-injuries-rigid-shield-technique`, both
  nosebleed cards and the impetigo card are **correct as they stand**.
- **Illustrated faces in scenes.** The sports-psychology set, the EAP scenes, the
  RICE and support-the-arm cards. Several are load-bearing — `listening-scene`
  needs the approaching adult to read as an adult; `recognize-withdrawal` needs a
  visibly withdrawn teammate.

**The rule is about photorealism in a person, not about faces.** Please do not
"fix" anything on that list.

---

## Card 1 — `heat-illness-warning-signs.webp` (worst of the three)

- Unit: `heat-illness.json` (**9-10**) · folder `public/images/units/heat-illness/`

**The problem:** the right half is a photorealistic adult woman, seated, hand to
forehead, **face fully visible and individually identifiable**. She reads as a
specific real person, which is exactly what the rule prohibits.

**The fix:** redraw the figure in the project's normal illustrated style. Options,
in order of preference:

1. **An illustrated athlete** in the same seated, hand-to-forehead pose — this
   keeps the composition and the emotional read, and matches how every other
   scene card in the app is drawn.
2. **No person at all** — the seven warning-sign lines carry the teaching on their
   own, and the card would still work with a simple heat/sun motif in that space.

**Keep everything else exactly as it is:** the navy "4. WARNING SIGNS" header, all
seven yellow-triangle bullet lines, and the blue footer strip *"Remove from heat
and evaluate. Symptoms can escalate quickly."*

---

## Card 2 — `heat-illness-heat-stroke-emergency.webp`

- Unit: `heat-illness.json` (**9-10**) · folder `public/images/units/heat-illness/`

**The problem:** **two** photorealistic people — an adult in a polo and
sunglasses leaning over a young man in an immersion tub, **both faces fully
visible**. Same violation, doubled.

⚠ **This card is also being changed by batch B5 (card 1) for a separate reason** —
its 102 °F stop-cooling instruction contradicts the 9-10 lesson. **Please do both
changes in one redraw rather than two passes.** B5 has the wording spec; this
brief covers the art.

**The fix:** redraw both figures illustrated. The scene should still show
whole-body cold-water immersion with an adult managing it — that is the teaching,
and it must survive. What changes is only that the people are drawn rather than
rendered photoreal.

**Keep:** the red "5. HEAT STROKE: MEDICAL EMERGENCY" header, the four red
action rows (CALL 911 / COOL IMMEDIATELY / REMOVE CLOTHING / COLD-WATER
IMMERSION), and the bottom banner *"Time is critical. Cool first, transport
second."*

---

## Card 3 — `heat-illness-sweat-cooling.webp`

- Unit: `heat-illness-ms.json` (**7-8**) · folder `public/images/units/heat-illness/`

**The problem:** the running athlete on the left is a photoreal render. The face
is mostly turned away, so this is the mildest of the three — but the body, kit and
skin are photographic in a way nothing else in the app is.

**This one is on a 7-8 unit**, the band that leans hardest on its images.

**The fix:** redraw the runner illustrated, matching e.g.
`warmup-injury-prevention-warmup-steps` or
`overuse-injuries-prevention-habits`, which show running figures in the right
style. Keep the pose, the sweat-arrow overlay and the field background.

⚠ **This card is also in batch B5 (card 4)** for a legibility problem — the four
step paragraphs in the right-hand panel dissolve at phone size. **Same request:
do both in one redraw.**

---

## Standing rules

WebP · exact filenames and folders above · same ratio and dimensions as the
current files · **30–60 KB** · no logo or watermark · full-frame · ≥ 12 px clean
margin on every edge.

**And the rule this batch exists to enforce:** no photographs, and **no
photorealistic or identifiable people**. Illustrated people are the house style
and are welcome. Realistic *anonymous body parts* — a forearm, a foot, hands —
remain fine and are used correctly all over the app (the taping, wound-care and
skin-condition cards are all good examples).

**Transfer:** send finished files **inside a zip**, with a PNG copy as fallback,
and say whether each is a pixel edit or a fresh redraw.
