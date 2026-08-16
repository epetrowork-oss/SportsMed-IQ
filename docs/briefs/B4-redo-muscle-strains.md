# Redo — `muscle-strains-two-joint-muscles-map.webp` (one small change)

**Almost all of this is right. One thing needs backing out.**

The B3/B4 delivery of 2026-08-15 landed four of five files. This one was **held**,
and it is held for a scope reason, not a quality one — the art is good and the
line I asked you to fix is fixed correctly.

- Unit: `muscle-strains.json` (grade band **9-10**) · 4:3 (900 × 675)
- Folder: `public/images/units/muscle-strains/`

## What you got right — keep all of it

**The briefed fix is done.** *"gracilis crosses hip + knee"* is now a full-size,
single-tier label instead of a small grey sub-line, and it passes the 343 px
stroke-merge test cleanly. That was the whole ask, and it works.

## What needs backing out

The **BACK** figure's hamstring label was changed from `hamstrings` to:

> **Hamstring muscles**
> Semitendinosus
> Semimembranosus
> Biceps femoris (long head)

**Please revert that to the single label `hamstrings`** and delete the three
muscle names.

**Why** — and it is not that they are wrong, because they are correct anatomy:

1. **Those three names appear zero times in the entire strand.** Not in the 7-8
   unit, not in this 9-10 unit, and **not even in the 11-12 unit.** Checked
   directly: `semitendinosus` ×0, `semimembranosus` ×0, `biceps femoris` ×0
   across all three files. There is no band where this card would be the right
   place for them. A student meets three Latin words the lesson never explains.
2. **This band is deliberately not that deep.** The three grade bands are a hard
   contract in this project — 9-10 is "moderate depth", and individual muscle-head
   names sit above even the 11-12 unit's level.
3. **It runs against the point of the batch.** B3, B4 and B5 all exist to *reduce*
   the amount of small text on cards displayed at 343 px. This one added a
   four-line block.

The B4 brief did say to change the one named line and leave everything else — but
the reason is worth having rather than just the rule, which is why it is spelled
out above.

## Also worth a quick check

The base figure changed from the previous plain grey body outline to a fully
detailed musculature render. That is **fine and can stay** — it reads well at
343 px and the highlighted muscles are clearer than before. Just confirming it was
intentional rather than a different source file picked up by accident.

One small thing if it is easy: `gracilis crosses hip + knee` is now set *larger*
than `groin/adductors` directly above it, which inverts the hierarchy a little.
Matching them, or making the gracilis line slightly smaller than the main label
while staying well clear of the old sub-line size, would tidy it. **Not a blocker
— do not let this hold the file.**

## Everything else on the card stays exactly as delivered

Both figures, the red muscle highlighting, the teal target dots, the FRONT / BACK
headings, and the `rectus femoris`, `groin/adductors` and `gastrocnemius` labels.

## Standing rules

WebP · same filename and folder · 4:3 at 900 × 675 · **30–60 KB** (your delivery
was 37.8 KB, comfortably fine) · no logo or watermark · full-frame · ≥ 12 px clean
margin on every edge · no photographs or identifiable people.

**Ship a 343 px render alongside the source file** — that was asked for in B3/B4
and did not come through, and it is the fastest way for both of us to confirm a
legibility fix actually worked.

**Send it inside a zip**, with a PNG copy as a fallback.
