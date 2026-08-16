# Correction batch B4 — two cards, one line each

**Two images. Each needs exactly one line of text changed. Nothing else.**

Read this before starting: **these are not redesigns.** Both cards are correct,
well composed, and legible on a phone in every respect but one line apiece. The art
is right, the layout is right, the colours are right, every other label reads.
Changing anything beyond the one line named below makes this batch harder to review
and risks losing something that currently works.

This is deliberately briefed **separately from batch B3**, which is a genuine
redraw of three over-labelled anatomy cards. Do not merge the two batches or apply
B3's instructions here.

**If you still have the source files, these are pixel edits, not regenerations.**
That distinction has caused a stall before — an earlier round grouped edits and
redraws under the single word "corrections", and the author waited on an approved
file for an image that actually needed regenerating from spec. Here: edit if you
can, regenerate only if you must, and say which you did.

---

## Why these two lines cannot simply be deleted

The other cards in this backlog are being *trimmed*, because their labels repeat
the lesson text. **These two are the opposite case.** On both cards, the single
illegible line is the only line on the card that the lesson prose does **not**
carry anywhere. Deleting it would delete the information. It has to be made
readable instead.

---

## The size target

Diagrams are capped at `max-width: 26rem`, so a 900 px source displays at **343 px
on a phone** and **416 px on tablet and desktop — never larger**.

**Acceptance test:** render at 343 px wide, blow that up nearest-neighbour, and
check that the corrected line reads as letters rather than merged blobs. **Please
ship the 343 px render alongside the source file.**

---

## Card 1 — `muscle-strains-two-joint-muscles-map.webp`

- Unit: `muscle-strains.json` (grade band **9-10**) · ratio **4:3** (900 × 675)
- Folder: `public/images/units/muscle-strains/`

**The one line:** the small grey sub-line **"gracilis crosses hip + knee"**, sitting
under the bold teal label *groin/adductors* on the FRONT figure. It is set smaller
and lighter than the four main labels, and it is the only text on the card that
fails at 343 px.

**The fix:** fold it into a single-tier label, set at **the same size, weight and
colour as the other four labels** (*rectus femoris*, *hamstrings*, *gastrocnemius*,
*groin/adductors*):

> **groin/adductors** (gracilis crosses hip + knee)

Two lines is fine if it wraps — what must go is the *smaller, lighter second tier*.
Nothing else on this card changes: keep both figures, the red muscle highlighting,
the teal target dots, the FRONT / BACK headings, and all four existing labels
exactly as they are.

**Why it can't be dropped.** The lesson lists four commonly strained muscle groups
and gives the joint-crossing parenthetical for three of them — hamstrings "(cross
hip and knee)", rectus femoris "(crosses hip and knee)", gastrocnemius "(crosses
knee and ankle)". **The groin/adductors entry is the one that doesn't get it.** The
word *gracilis* appears nowhere in the unit — not in the lesson, not the quiz, not
a flashcard. So this sub-line is the only thing, anywhere, that explains why the
groin group belongs on a list of two-joint muscles. It is doing real work.

---

## Card 2 — `overuse-injuries-acwr-graph.webp`

- Unit: `overuse-injuries-adv.json` (grade band **11-12**) · ratio **16:9** (900 × 506)
- Folder: `public/images/units/overuse-injuries/`

**The one line:** the small grey italic footer beneath the x-axis —
**"One monitoring clue — not a safety guarantee"**. It is both the smallest and the
lowest-contrast text on the card.

Everything else here reads at 343 px and must be left alone: the title
*Acute:chronic workload ratio*, both axis labels, the 0.8 / 1.3 / 1.5 gridline
values, the green *historically proposed sweet spot* band, the orange spike zone,
the plotted line and its orange marker, and both annotations (*workload spike —
monitor closely*, *returning from break or rapid mileage increase*).

**The fix:** promote the footer into a properly legible caption.

- Set it at **the same size as the axis labels** ("weeks", "acute:chronic workload
  ratio") — those survive 343 px comfortably.
- **Not italic.** Italic small text is the worst case for downsampling.
- **Dark navy**, matching the title, rather than light grey. Contrast matters here
  as much as size.
- Keep it at the bottom, but give it room; a light tinted strip behind it is
  acceptable if that helps it hold.

**Why it can't be dropped.** This sentence is a safety qualifier on a number that a
student could otherwise over-trust, and — checked — the phrase and its idea appear
**nowhere in the lesson text**. The card introduces the ratio as a monitoring tool;
this line is the only thing on the page stopping a reader from treating a ratio
under 1.3 as permission. On a card whose whole subject is training load and injury
risk, that is the line that most needs to be readable, and right now it is the
least readable thing on it.

Note for searching: the asset filename says `acwr-graph`, but the card's printed
title is *"Acute:chronic workload ratio"* — search by filename.

---

## Standing rules (unchanged)

WebP · exact filenames and folders above · same ratio and dimensions as the current
files · **30–60 KB** · no logo or watermark · no empty callout boxes · full-frame ·
correct spelling · **no photographs and no identifiable or photorealistic people**.

**Margins:** ≥ 12 px of clean background on every edge, with nothing from a
neighbouring card in frame.

**Transfer:** send finished files **inside a zip** (bare `.webp` uploads have failed
twice), with a PNG copy as a fallback. If you are doing these as pixel edits on the
existing sources, the originals are in the repo at the folders listed above and can
be zipped over to you on request.
