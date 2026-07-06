# SportMedIQ

An offline-first learning platform for high school sports medicine programs.
Students read lessons, take quizzes, and review flashcards for injury units;
teachers see who has completed what.

## Run it

```bash
npm install
npm run dev        # development server
npm run build      # production build (dist/)
npm run preview    # serve the production build
```

Works on phones, Chromebooks, iPads, and laptops. After the first load, the
production build works **fully offline** (gyms, fields, buses) — the app is a
PWA that precaches everything, and student progress is stored on-device in
localStorage.

## How it's organized

- `src/content/units/*.json` — all learning content. **Adding a unit is adding
  a JSON file**; no component code changes needed. Schema documented in
  [`src/content/README.md`](src/content/README.md). Malformed units are skipped
  with a console error instead of crashing the app.
- `src/content/index.js` — loads and validates every unit at build time.
- `src/lib/progress.js` — the one piece of app state: a plain object persisted
  to localStorage, exposed to React via `useSyncExternalStore`. A unit counts
  as complete when the lesson is read, flashcards reviewed, and best quiz
  score ≥ 70%. Lesson pages also accumulate reading time (only while the tab
  is visible) and a scroll-depth high-water mark; the teacher dashboard shows
  both per cell and flags ⚠ any lesson marked read with under 2 minutes on
  the page or less than 80% of it seen — so "read" can't be faked by clicking
  through.
- `src/pages/` — unit list, lesson, quiz (choice order shuffled per attempt),
  flashcards, teacher dashboard.
- `src/lib/share.js` + `src/pages/SyncPage.jsx` — cross-device sync without a
  server: progress serializes to a copy/pasteable code (`SMIQ1.` + base64url
  JSON). Loading a code on another device merges, keeping the best of both.
- `src/lib/roster.js` — teacher roster: paste a student's code to add their
  real progress to the dashboard (stored on the teacher's device). The sample
  roster in `src/content/mock/students.json` shows only until the first real
  student is added.

## Current status

- ✅ Stage 1 — foundation: scaffold, routing, content schema, offline PWA
- ✅ Stage 2 — one complete unit end-to-end (ankle sprains: 7-section lesson,
  8-question quiz, 12 flashcards)
- ✅ Stage 3 — minimal teacher dashboard (mock roster + live local progress)
- ✅ Content expansion — 13 units across 7 categories (ankle sprains,
  concussions, heat illness, cold exposure, knee/ACL, shoulder, wound care,
  muscle strains, overuse injuries, fractures & dislocations, taping &
  wrapping, EAP/CPR-AED, hydration & nutrition), each added as JSON only;
  whole library passes `npm run validate:content` with zero warnings
- ✅ Cross-device sync — offline progress codes: student Sync page
  (export/import with best-of-both merge) and teacher add-student-by-code
- ✅ Honest-reading signals — per-lesson reading time + scroll depth with
  click-through flags on the teacher dashboard
- ✅ Teacher tools — sortable roster (name / completed / flags first) and
  CSV export; mobile layout verified at phone widths
- ✅ Compressed sync codes — SMIQ2 (deflate) format ~4.5x shorter than v1;
  legacy SMIQ1 codes still import
- ✅ Real-device pass — PWA install icons (192/512/maskable + apple-touch),
  offline reload verified with network cut, all touch targets ≥ 44px at
  phone widths, layout checked at 375px and 768px
- ✅ Teacher per-student detail — click a roster row for the full per-unit
  breakdown (reading time, scroll depth, flag reasons, quiz history)

Not built yet (intentionally): accounts/auth, live server-based sync,
assigning content.
