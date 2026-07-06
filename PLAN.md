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

## Out of scope (intentional, unchanged)

Accounts/auth, live server-based sync, assigning content.
