# Plan — pick up here (next session starts ~12:00)

This file is the handoff between sessions. Read it first, keep it updated:
check items off as they land, and add anything newly discovered. The working
rhythm is unchanged: **build a piece → verify in the browser → commit.**

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

- [ ] Verify layout at tablet width (~768px), not just 375px phone width.
- [ ] Touch-target audit: interactive elements (quiz choices, flashcard flip,
      nav links, sort buttons) should be ≥ 44px tall on touch devices.
      `styles.css` currently has no min-height rules on buttons.
- [ ] PWA installability audit — likely a real gap: the manifest's only icon
      is `icon.svg`. Chrome's install prompt wants 192px and 512px PNGs
      (plus a maskable icon), and iOS Add-to-Home-Screen wants an
      `apple-touch-icon` PNG link tag. Generate PNGs from the SVG, add them
      to the manifest and `index.html`.
- [ ] Walk the actual install flow (Chromium: check `beforeinstallprompt`
      fires / DevTools installability report), then confirm the installed
      app works offline — don't just check that the service worker registers.

### 2. Harden sync codes (small, high-value)

- [ ] Measure real code length with all 7 units of progress. The plan called
      for *compressed* JSON; the implementation is plain base64url JSON. If
      codes are too long to comfortably copy/paste or read aloud in class,
      add compression (e.g. `CompressionStream('deflate-raw')`, with the
      `SMIQ1.` prefix bumped to `SMIQ2.` and v1 still accepted on import).
- [ ] Test malformed/truncated codes and merge edge cases (import own code,
      import older code over newer progress) — confirm graceful errors, no
      crashes, merge keeps best-of-both.

### 3. Optional — more content (only if time remains / a class needs it)

Same pattern as before: one JSON file per unit, full lesson + 8-question quiz
+ 12 flashcards, verified end-to-end in the browser. Good candidates to round
out a semester:

- [ ] Fractures & dislocations
- [ ] Taping & wrapping basics
- [ ] Emergency action plans / CPR & AED awareness
- [ ] Hydration & nutrition for athletes

### 4. Stretch — teacher per-student detail

- [ ] Click a roster row to see one student's full breakdown (per-unit
      quiz attempts, reading time, flags). Only if 1–3 are done.

## Out of scope (intentional, unchanged)

Accounts/auth, live server-based sync, assigning content.
