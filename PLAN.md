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

**Strand × band matrix** — 15 strands total (13 original + `shoulder-injuries`
+ `cold-exposure`, both authored straight at `9-10`, no MS/advanced yet).
`x` = exists, blank = queued, `9-10` is the only band with full coverage today.

| Strand | 7-8 | 9-10 | 11-12 |
|---|---|---|---|
| ankle-sprain | x | x | |
| concussion | x | x | |
| heat-illness | x | x | |
| wound-care | x | x | |
| emergency-action-plan | x | x | |
| knee-acl | x | x | |
| cold-exposure | x | x | |
| muscle-strains | x | x | |
| overuse-injuries | x | x | |
| shoulder-injuries | x | x | |
| fractures-dislocations | x | x | |
| taping-wrapping | x | x | |
| hydration-nutrition | x | x | |

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
- [ ] Wave 3 — `11-12` versions of the 5 wave-1 strands (deeper:
      mechanism/anatomy, grading systems, differential/decision quizzes)
- [ ] Wave 4 — `11-12` versions of the remaining 8 strands
- [ ] New strands not yet covered at any band, worth considering for a full
      6-year program: eye injuries, dental/facial trauma, blisters & skin
      issues, mental health/return-to-play psychology, nutrition for growing
      athletes (distinct from the existing general hydration-nutrition unit),
      strength & conditioning basics, injury prevention/warm-up science
- [ ] Once 7-8 and 11-12 both have real coverage, revisit the Home page:
      consider a "these grades already have this strand" cross-link on unit
      cards (today the filter just shows/hides; no linking between a
      strand's grade-band versions yet)

## Out of scope (intentional, unchanged)

Accounts/auth, live server-based sync, assigning content.
