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
  score ≥ 70%.
- `src/pages/` — unit list, lesson, quiz (choice order shuffled per attempt),
  flashcards, teacher dashboard.
- `src/content/mock/students.json` — mock roster for the teacher dashboard
  until real accounts exist; the dashboard also shows a live row for the
  current device.

## Current status

- ✅ Stage 1 — foundation: scaffold, routing, content schema, offline PWA
- ✅ Stage 2 — one complete unit end-to-end (ankle sprains: 7-section lesson,
  8-question quiz, 12 flashcards)
- ✅ Stage 3 — minimal teacher dashboard (mock roster + live local progress)

Not built yet (intentionally): accounts/auth, real student→teacher data sync,
assigning content, additional units.
