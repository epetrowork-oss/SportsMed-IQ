# SportMedIQ — repo brief for Claude sessions

Offline-first learning PWA (Vite + React) for high school sports medicine.
Students read lessons, take quizzes, review flashcards; teachers track
completion. No backend, no accounts — everything is localStorage +
copy/pasteable sync codes.

**Start every session by reading `PLAN.md`** — it's the cross-session handoff
with current status and the task queue. Update its checkboxes as work lands.

## Commands

```bash
npm install
npm run dev               # dev server
npm run build             # production build (dist/)
npm run preview           # serve the production build
npm run validate:content  # strict content quality gate (run after any content change)
```

Browser verification: Playwright with the preinstalled Chromium at
`/opt/pw-browsers/chromium` (pass as `executablePath`; don't run
`playwright install`). Verify against `npm run preview`, not just dev mode.

## Map

- `src/content/units/*.json` — ALL learning content. Adding a unit = adding
  one JSON file; schema in `src/content/README.md`. Never hardcode content
  in components.
- `src/content/index.js` — loads/validates units at build time (lenient:
  skips bad files). `scripts/validate-content.mjs` is the strict gate.
- `src/lib/progress.js` — the one piece of app state: plain object in
  localStorage via `useSyncExternalStore`. Completion = lesson read +
  flashcards reviewed + best quiz ≥ 70%. Also tracks per-lesson reading
  time and scroll depth (anti-click-through flags).
- `src/lib/share.js` — sync codes: `SMIQ1.` + base64url JSON, best-of-both
  merge on import. `src/lib/roster.js` — teacher-side roster from pasted
  student codes.
- `src/pages/` — Home, Unit (lesson), Quiz, Flashcards, Sync, Teacher, 404.
  `src/styles.css` — all styling, plain CSS.

## Conventions

- Rhythm: **build a piece → verify in the browser → commit.** Small commits,
  descriptive messages.
- Plain React function components; no new dependencies without explicit
  approval; keep the app fully offline (no network calls, no external
  assets).
- Content edits must pass `npm run validate:content` before committing.

## Cost-efficient model routing

**Roles: Fable is the advisor, Sonnet is the executor.** The orchestrating
session (Fable/Opus) advises — it writes specs, makes decisions, reviews
diffs and gate output, and vets anything safety- or accuracy-sensitive. It
does not do bulk execution itself. Sonnet executes, via the subagents in
`.claude/agents/` (both pinned to `model: sonnet`) or as the session model
for routine work:

- **New learning units** → `unit-author` agent (Sonnet). Give it the topic
  and emphasis notes; it authors, validates, and reports.
- **Well-specified code changes** → `implementer` agent (Sonnet). Write the
  spec with explicit acceptance criteria and file scope first; it
  implements and browser-verifies.
- **Keep on the orchestrator**: architecture decisions, writing the specs,
  reviewing agent output (`git diff` + validator/build output + spot-check
  in browser), anything ambiguous or cross-cutting.
- Trust the gates, skim the diff: agent work that passes
  `validate:content` + `build` + browser verification needs review of
  judgment calls, not line-by-line re-derivation.
- Cheapest of all: entire routine sessions (content batches, checklist
  execution) can run on Sonnet directly — pick the model at session start;
  save Fable/Opus sessions for planning and review passes.
