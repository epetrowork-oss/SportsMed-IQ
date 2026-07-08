# Plan — pick up here (next session starts ~12:00)

This file is the handoff between sessions. Read it first, keep it updated:
check items off as they land, and add anything newly discovered. The working
rhythm is unchanged: **build a piece → verify in the browser → commit.**

**Credit-saving protocol** (see `CLAUDE.md` → "Cost-efficient model
routing"): delegate execution to the Sonnet subagents in `.claude/agents/`
(`unit-author` for content, `implementer` for spec'd code changes) and keep
the expensive model for specs, review, and judgment. Each task below is
tagged with its routing.

## Where things stand

The original 24-hour plan had four blocks. Three are already built, verified,
and merged to `main` (PR #1):

- ✅ **Block 1 — Progress export/import.** `src/lib/share.js` (codes are
  `SMIQ1.` + base64url JSON), student Sync page with export/import and
  best-of-both merge, teacher add-student-by-code replacing mock roster
  entries (`src/lib/roster.js`).
- ✅ **Block 2 — Broaden content.** All three candidate units landed (wound
  care, muscle strains, overuse injuries) — 7 units total, all data-only.
- ⚠️ **Block 3 — Real-device pass.** Only partially done: header overflow at
  phone widths was fixed and the README claims phone-width layout is
  verified. The rest of the block has NOT been done — see task 1 below.
- ✅ **Block 4 — Teacher UX polish.** Sortable roster (name / completed /
  flags first) + wide-format CSV export (`src/pages/TeacherPage.jsx`).

Bonus work beyond the plan, also merged: honest-reading signals (per-lesson
reading time + scroll-depth high-water mark, click-through ⚠ flags on the
teacher dashboard).

## Task queue for the next session

### 1. Finish Block 3 — real-device / install pass (the only unfinished block)

*Routing: orchestrator writes the spec per item; PNG icons + touch-target CSS
are `implementer` tasks; the install-flow audit needs orchestrator judgment.*

- [x] Verify layout at tablet width (~768px) — spot-checked all pages at
      768px during the touch-target pass; no breakage.
- [x] Touch-target audit — measured every control at 375px in the built
      app (nav links 31px, buttons 37px, remove-student 22px), added
      min-heights in `styles.css`; re-measured, all ≥ 44px, no overflow.
- [x] PWA installability — real PNG icons added (192/512 + maskable 512
      with safe-zone fill) and `apple-touch-icon` link; manifest verified
      complete in the built app.
- [x] Install flow audited: manifest (standalone, icons, start_url) +
      active service worker verified in built app, then offline reload with
      network cut — app fully serves all units offline, zero console
      errors. (`beforeinstallprompt` itself can't fire in headless CI —
      worth one manual Add-to-Home-Screen on a real phone when convenient.)

### 2. Harden sync codes (small, high-value)

*Routing: orchestrator decides whether compression is warranted (measure
first); the implementation + edge-case tests are an `implementer` task.*

- [x] Measured: full 7-unit progress was 1,345 chars. Added SMIQ2 format
      (`deflate-raw` via CompressionStream) → ~288 chars, ~4.5x shorter.
      Legacy SMIQ1 codes import forever. encode/decode now async.
- [x] Verified in browser: round trip, best-of-both merge per field,
      legacy SMIQ1 import, garbage + truncated codes → friendly errors,
      teacher add-by-code with SMIQ2, zero unhandled rejections.

### 3. Optional — more content (only if time remains / a class needs it)

Same pattern as before: one JSON file per unit, full lesson + 8-question quiz
+ 12 flashcards, verified end-to-end in the browser. *Routing: one
`unit-author` (Sonnet) task per unit — these should not consume orchestrator
credits beyond review.* Good candidates to round out a semester:

- [x] Fractures & dislocations
- [x] Taping & wrapping basics
- [x] Emergency action plans / CPR & AED awareness
- [x] Hydration & nutrition for athletes (new "Prevention & Performance"
      category) — all four validator-clean with zero warnings; 11 units
      total across 6 categories

### 4. Stretch — teacher per-student detail

- [x] Click a roster row to see one student's full breakdown — per-unit
      reading time (min:sec), scroll %, spelled-out flag reasons, quiz
      score/attempts, status. Browser-verified incl. sort/CSV/remove
      interplay and 375px layout.

### 5. Follow-on batch (same day, delegated)

- [x] Two more units: shoulder injuries (new Upper Extremity category) and
      cold exposure & hypothermia — 13 units across 7 categories
- [x] Original 7 units brought to zero validator warnings (answer-position
      spread verified byte-identical against git history; flashcards topped
      up to 12 from existing lesson material)
- [x] Hydration quiz fluid-replacement range fixed (64-96 → 80-96 oz,
      caught by automated PR review)

### 6. The 6-year program: spiral curriculum expansion (in progress)

**Direction** (user decision, 2026-07-07): SportMedIQ becomes a 7th-12th
grade program. Most topics ("strands") get up to three units — one per
grade band (`7-8`, `9-10`, `11-12`) — each going deeper than the last,
rather than one flat difficulty level. See `src/content/README.md` →
"Grade bands" for the depth/tone contract each band must follow, and
`.claude/agents/unit-author.md`, which now reads sibling-band units before
writing so depth genuinely increases.

- [x] Foundation: `strand` + `gradeBand` fields added to the schema,
      validator enforces both (valid band enum, no duplicate strand+band
      pairs). All 13 existing units retrofitted as the `9-10` middle rung.
      Home page grade filter (All / 7-8 / 9-10 / 11-12) shipped, persisted,
      browser-verified.

**Strand × band matrix** — 13 strands, all three bands complete (39 units).
`x` = exists. Spiral fully filled as of 2026-07-07.

| Strand | 7-8 | 9-10 | 11-12 |
|---|---|---|---|
| ankle-sprain | x | x | x |
| concussion | x | x | x |
| heat-illness | x | x | x |
| wound-care | x | x | x |
| emergency-action-plan | x | x | x |
| knee-acl | x | x | x |
| cold-exposure | x | x | x |
| muscle-strains | x | x | x |
| overuse-injuries | x | x | x |
| shoulder-injuries | x | x | x |
| fractures-dislocations | x | x | x |
| taping-wrapping | x | x | x |
| hydration-nutrition | x | x | x |

- [x] Wave 1 — `7-8` versions of the 5 highest-priority safety-critical
      strands: concussion, heat illness, wound care, EAP/CPR-AED, ankle
      sprain. Each independently verified to genuinely simplify (no
      ligament names/grading system, no WBGT/clinical thresholds, no
      tourniquets/wound taxonomy, no CPR technique/rescuer framing, etc.)
      rather than just restate the 9-10 unit in shorter words. 18 units
      total now; grade filter browser-verified (5 / 13 / 0 split correct).

**Remaining waves** (not yet started, rough order of value):
- [x] Wave 2 — `7-8` versions of the remaining 8 strands: knee-acl,
      muscle-strains, overuse-injuries, cold-exposure,
      fractures-dislocations, taping-wrapping, hydration-nutrition,
      shoulder-injuries. Each independently verified against its 9-10
      sibling for real depth reduction (no anatomy/grading/technique/
      clinical thresholds). One agent hit a transient API error mid-run
      (fractures-dislocations) and was retried cleanly with no partial
      file left behind. All 13 strands now have both `7-8` and `9-10`
      coverage — 26 units total. Browser-verified: grade filter (13/13/0
      split), quiz and flashcards render correctly for new units, zero
      console errors, no overflow at 375px.
- [x] Wave 3 — `11-12` versions of ALL 13 strands (done in two rounds of
      parallel agents, not just the 5 wave-1 strands). Each verified to
      build ON TOP of its 9-10 sibling (mechanism/physiology, grading,
      differential/decision quizzes) rather than repeat it. Two round-2
      agents hit a session limit at their final report step but had
      already written valid files; verified complete + committed by the
      orchestrator. **Spiral complete: 39 units = 13 strands x 3 bands,
      browser-verified 13/13/13 split, zero console errors.**
- [x] Wave 4 — folded into wave 3 above (all 13 strands done together)
- [x] Wave 5 — 5 new strands, each authored as a `9-10` baseline (mirroring
      how `shoulder-injuries`/`cold-exposure` started): `eye-injuries`,
      `dental-facial-trauma`, `skin-conditions`, `sports-psychology`
      (mental health/return-to-play, includes a carefully-reviewed crisis
      callout on suicide/self-harm disclosure — recognize/support/refer
      only, never diagnosis or counseling technique), and
      `warmup-injury-prevention` (dynamic-vs-static stretching science,
      cross-references `knee-acl-adv` rather than re-teaching it). Dropped
      "nutrition for growing athletes" as too redundant with the existing
      `hydration-nutrition` strand. One agent (eye-injuries) hit a
      connection error at its final report step; file verified complete
      (no truncation, quiz integrity intact) before committing. Library now
      **44 units**, 18 strands total (13 fully spiraled + 5 new baseline-only),
      7 categories. Browser-verified: 13/18/13 grade-band split, sensitive
      new units (sports-psychology, eye-injuries) render end-to-end, zero
      console errors, no overflow at 375px.
- [x] Wave 6 — `7-8` and `11-12` siblings for all 5 wave-5 strands (10
      units, authored in one parallel batch so the whole spiral for this
      content lands in a single PR). `sports-psychology`'s crisis sections
      (both bands) were personally read word-for-word rather than
      pattern-matched, given the subject matter — both hold the
      recognize/support/refer line correctly, including a genuinely
      nuanced 11-12 quiz scenario (partial-privacy disclosure escalating
      to self-harm mid-conversation) and the 7-8 unit's "even if said as
      a joke" addition. One agent (eye-injuries-ms) reported before I'd
      re-confirmed its commit; caught and fixed in the same session. All
      18 strands are now fully spiraled across all 3 bands.
      **Library: 54 units, 18 strands x 3 bands, 7 categories.**
      Browser-verified: 18/18/18 grade-band split, sensitive units render
      end-to-end, zero console errors, no overflow at 375px.
- [ ] Further new-strand candidates for a full 6-year program: strength &
      conditioning basics is the main one not yet covered.
- [ ] Once 7-8 and 11-12 both have real coverage, revisit the Home page:
      consider a "these grades already have this strand" cross-link on unit
      cards (today the filter just shows/hides; no linking between a
      strand's grade-band versions yet)

## Teacher dashboard UI + image pipeline — EXECUTED 2026-07-08 (PR #8 follow-through)

All four phases below landed on `claude/pr-8-execution-noj9vu`, each
implemented by an `implementer` (Sonnet) agent from an orchestrator spec,
browser-verified against the built app, and committed separately:

- [x] **Teacher dashboard three-way drill-down** (`6f316ef`). **User
      decision (differs from the strand reading speculated in the original
      plan): "Unit" = category (the 7 content categories), "Lesson" = one
      unit file (the 54 grade-band files).** By Unit / By Lesson /
      By Student pivot toggle (persisted), card/accordion rows with
      disclosure carets replacing the `<table>`, all pivots ending at a
      shared lesson detail panel (min:sec reading time, scroll %,
      spelled-out flag reasons, quiz score/attempts, flashcards, status).
      By Lesson adds a grade-band filter matching Home's picker. Status is
      color + icon (green ✓ / amber ● / muted ○ / amber ⚠). CSV export,
      sort, add/remove student, mock roster all preserved.
- [x] **Image placeholder system** (`ed7d2b2`). `src/components/
      ImagePlaceholder.jsx` renders a labeled dashed box (pure CSS/DOM,
      zero network, zero precache weight) carrying full metadata as
      props/data-attributes; passing `src` later swaps in the real
      `<img>` — one-prop change per slot. Seeded: 7 category icons +
      per-strand 3:2 card thumbnails on Home, plus optional per-section
      `image` objects in unit JSON (validator-enforced; seeded in
      ankle-sprain + knee-acl 9-10). `npm run images:shotlist` prints the
      complete 27-asset markdown brief for the ChatGPT image author.
      Schema documented in `src/content/README.md`.
- [x] **App-wide status styling pass** (`611f291`). Status vocabulary
      extracted to `src/lib/status.js` + `src/components/StatusIcon.jsx`
      (teacher page behavior unchanged); Home pills, Unit-page completion
      marks, and quiz pass/fail results all use the same green/amber
      icon + color language.
- [x] **Home ease-of-access** (`2c96324`). "Continue where you left off"
      card (driven by a new device-local `touchedAt` stamped in
      `progress.js`'s `updateUnit`; deliberately NOT in the sync-code
      schema, and `mergeProgress` doesn't fake recency) + a search box
      matching title/summary/category/strand, AND-combined with the
      grade-band filter, with a live "N of 54 units" count.

**Follow-ups for later sessions:**
- Real images: as WebP files land in `public/images/…`, swap each slot by
  passing `src` to its `ImagePlaceholder`. Regenerate the brief anytime
  with `npm run images:shotlist`. Before many images land, decide the
  precache strategy (lazy-load vs eager, per-image size budget) — bundle
  is ~1MB today with zero images.
- `HomePage.jsx`'s `UnitCard` still has its own inline pill logic that
  duplicates `status.js` rules — candidate for a small cleanup.
- Original plan's ideas not yet built: strand cross-links between a
  unit's grade-band siblings on Home; teacher-dashboard status
  iconography images.

The original planning notes for this phase (superseded by the above) are
kept in PR #8's description/history.

**Image division of labor (unchanged):** the actual image files are
produced by the user via ChatGPT (which has its own repo access) — no
image generation happens in Claude sessions, and anatomical accuracy
needs human vetting regardless of source. This repo's side of the
contract is the placeholder slots + the `npm run images:shotlist` brief.

## Out of scope (intentional, unchanged)

Accounts/auth, live server-based sync, assigning content.
