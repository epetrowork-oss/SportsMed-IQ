# Correction batch B3 — three annotation cards: fewer, larger labels

**Three images. This is a redraw, not a pixel edit.**

These are the last three *redesigns* in the group-B legibility backlog. They are a
**different ask from correction batches B1 and B2** — do not apply the fix that
worked there. B1 and B2 were dense tables and six-panel strips, and the fix was a
2 × N regrid to give each cell more width. **These three cards do not need more
room for text. They need fewer labels, printed larger.**

The reason is that almost every label on these cards repeats something the lesson
already says in full-size body text. A student reading the page gets the term from
the prose; the card is spending its smallest type re-printing it. Deleting those
labels costs no teaching and buys the space to print the remaining ones at a size
that actually survives a phone.

---

## The size target — author to 343 px, not 900

Every diagram in this app is capped at `max-width: 26rem`. A 900 px source file is
displayed at **343 px on a 375 px phone** and **416 px on tablet and desktop —
never larger**. So the source is shown at **38–46%**, and everything below is
specified at the size the student actually sees.

- 16:9 → source 900 × 506, displayed **343 × 193**
- 4:3 → source 900 × 675, displayed **343 × 257**

**Grounding number, so the increase is decisive rather than marginal.** On
`glenohumeral-anatomy`, the labels that currently survive have roughly **16–18 px of
ink height** in the 900 px file; the label that fails has about **13 px**. That
margin is far too thin to aim at. **Target ~28–32 px of ink height at 900 px for
every retained label** — roughly double the failing labels, not a nudge past them.

**The acceptance test, which beats any pixel count:** render the finished card at
343 px wide, then blow that render up with nearest-neighbour scaling. Blowing it up
adds no information — it just shows whether the letterforms survived the
downsample. **Every retained label must still read as letters, not as merged
blobs.** A label that dissolved at 343 px stays dissolved no matter how far you
magnify it.

**Please ship a 343 px render next to each source file** so this is visible rather
than described.

---

## Card 1 — `shoulder-injuries-glenohumeral-anatomy.webp`

- Unit: `shoulder-injuries.json` (grade band **9-10**) · ratio **4:3** (900 × 675)
- Folder: `public/images/units/shoulder-injuries/`
- Title stays: *Right shoulder — anterior view*

**What the section actually teaches.** The whole point of this section is that the
socket is shallow, so the shoulder trades stability for mobility. The section's
`body` paragraphs name only the glenohumeral joint, the humeral head, the glenoid
and the scapula.

⚠ **Correction (2026-08-15):** an earlier version of this line said the lesson
"never names a single rotator cuff muscle." **That was false.** All four names are
in this same section's `list` array — *"Rotator cuff (SITS muscles) — four muscles
(supraspinatus, infraspinatus, teres minor, subscapularis)…"* — which is rendered
lesson content, at full reading size. They also appear in flashcard `f2`. Those
are the only two locations; see `docs/HANDOFF.md` for the full enumeration and for
how this count managed to be wrong three times.

**It does not change the instruction below, it strengthens it.** The names are
already taught twice at readable size, so printing them again on a diagram shown
at 343 px adds nothing and costs the legibility of every other label.

**Remove:**
- **The entire posterior-cuff inset**, bottom right — the small scapula view labelled
  *Posterior cuff — view from back*, *infraspinatus*, *teres minor*. Those two muscle
  names are the smallest text on the card and the two that fail outright. The
  flashcard already teaches all four names.
- The individual anterior muscle labels *supraspinatus* and *subscapularis*.

**Replace them with one group label:** **"rotator cuff (4 muscles)"**, with a single
leader line to the muscle mass. Keep the muscles drawn and coloured as they are —
it is only the naming that goes.

**Add one label the card is currently missing:** **"glenoid — shallow socket"**,
pointing at the socket. This is the section's actual teaching point and right now
nothing on the card names it.

**Final label set — five, all at the target size:**

| Label | Points at |
|---|---|
| AC joint | the small joint where clavicle meets acromion |
| glenohumeral joint | the ball-in-socket articulation |
| glenoid — shallow socket | the socket face |
| labrum | the cartilage rim around the socket edge |
| rotator cuff (4 muscles) | the cuff muscle mass |

The space freed by deleting the inset is what pays for the larger type. Use it.

---

## Card 2 — `shoulder-injuries-bankart-hill-sachs.webp`

- Unit: `shoulder-injuries-adv.json` (grade band **11-12**) · ratio **16:9** (900 × 506)
- Folder: `public/images/units/shoulder-injuries/`
- Panel titles stay exactly as they are: **Bankart lesion** / **Hill-Sachs lesion**.
  They are large, they read fine, and they carry the card's structure.

**What the prose already carries.** The 11-12 section spells all of it out: the
Bankart lesion is "a tear of the anterior-inferior labrum … off the glenoid rim",
it "removes both the labral 'bumper' and the attachment point for the inferior
glenohumeral ligament", and the Hill-Sachs is "a compression fracture/divot in the
back of the humeral head". Every leader label on this card is a shorter restatement
of a sentence a few inches above it.

**Cut from four leader labels to two — one per panel:**

| Panel | Keep (enlarged) | Delete |
|---|---|---|
| Left — Bankart | **torn labrum**, pointing at the red tear at the socket rim | *inferior glenohumeral ligament* |
| Right — Hill-Sachs | **compression divot**, pointing into the divot | *posterior humeral head* |

Both deleted labels are named in the prose, and the panel titles already tell the
reader which bone they are looking at.

Keep the small orientation inset at top right and the dashed arrow — they carry no
text, so they cost nothing. The art is otherwise correct and should not change:
the anatomy on this card was vetted when it landed.

---

## Card 3 — `dental-trauma-mandible-ring-anatomy.webp`

- Unit: `dental-facial-trauma-adv.json` (grade band **11-12**) · ratio **4:3** (900 × 675)
- Folder: `public/images/units/dental-facial-trauma/`

**This card has nine labels and is the most over-labelled of the three.** More
importantly, it currently does **not label the one thing it is about.** The lesson's
claim is that *the mandible is structurally a ring*, so a break in one place
transmits force around it and often cracks it in a second place, usually on the
opposite side. The ring is drawn — it is the teal outline — and it is unlabelled,
while *ramus*, *angle* and *mental foramen* each get a label. Those three are plain
part-names that appear nowhere in the section's teaching.

**Delete outright:** *Ramus*, *Angle*, *Mental foramen*, and the small italic
sub-line *(forms part of the TMJ)*.

**Final label set — five, all at the target size:**

| Label | Points at | Why it stays |
|---|---|---|
| **The mandible is a ring** | the teal outline, ideally following its curve | The card's entire claim, currently unlabelled |
| **1st fracture (chin / body)** | the red zigzag at the chin | The direct blow |
| **2nd fracture — opposite condyle** | the red zigzag at the far condyle | The consequence the whole card exists to show |
| **Condyle (at the TMJ)** | the rounded top near the ear | Named in the prose as "the rounded top of the jaw near the ear" |
| **Inferior alveolar → mental nerve** (*lip / chin numbness*) | the yellow nerve path | Merges two labels into one; numbness is the recognition sign |

Keep the curved force-transmission arrow between the two fracture sites — it is the
mechanism, and it needs no text.

The current title *EXAMPLE MULTISITE PATTERN* may stay, but **"A ring breaks in two
places"** would carry the teaching better. Your call.

---

## Standing rules (unchanged, apply to all three)

WebP · exact filenames and folders above · render at the stated ratio · **30–60 KB**
· no logo or watermark · no empty callout boxes · **full-frame** (no lone small
figure floating in white) · every label spelled correctly · medical accuracy (this
batch is reviewed before merge) · **no photographs and no identifiable or
photorealistic people** — realistic anonymous body parts and clean medical
illustration are both fine and are what these three already use.

**Keep the existing art.** All three cards were vetted for anatomical accuracy when
they landed and none of them is wrong. This batch changes *labelling*, not anatomy,
not composition, not colour.

**Margins:** leave **≥ 12 px of clean background on every edge**. Cards have shipped
before with a caption clipped in half or a sliver of the neighbouring card baked
into the margin — nothing from an adjacent card may appear in frame.

**Transfer:** please send the finished files **inside a zip** (bare `.webp` files
have failed to arrive twice), and include a PNG copy as a fallback.
