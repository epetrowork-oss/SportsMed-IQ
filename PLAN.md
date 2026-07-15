# Plan — pick up here (current focus: image pipeline, see `docs/HANDOFF.md`)

This file is the handoff between sessions. Read it first, keep it updated:
check items off as they land, and add anything newly discovered. The working
rhythm is unchanged: **build a piece → verify in the browser → commit.**

**Credit-saving protocol** (see `CLAUDE.md` → "Cost-efficient model
routing"): **Fable is the advisor, Sonnet is the executor.** The
orchestrating Fable/Opus session writes specs, decides, and reviews;
execution goes to the Sonnet subagents in `.claude/agents/` (`unit-author`
for content, `implementer` for spec'd code changes) or a Sonnet-direct
session for routine batches. Each task below is tagged with its routing.

**Status as of 2026-07-15:** the Jul 8-10 alpha sprint's big feature —
assignments end-to-end via class codes — is DONE and merged (PR #15 built
it, PR #16 polished the student queue/focus behavior), GitHub Pages deploy
is live (`.github/workflows/deploy-pages.yml`), and an offline gamification
foundation (streak dates, badges, practical activities with reflections +
Achievements page) landed after the sprint plan was written. The active
workstream is landing ChatGPT-generated lesson diagrams strand-by-strand —
**`docs/HANDOFF.md` is the current handoff for that**; it needs the user to
upload each image batch, so sessions are blocked on that input. Still
genuinely open from the sprint: the aesthetic pass, a full QA sweep, and
the `TESTERS.md` alpha kit (not yet written).

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
- Real images — **first batch LANDED 2026-07-11 (PR #29)**: home hero,
  all 7 category icons, and 4 safety-strand unit thumbnails (concussion,
  heat illness, emergency action plan, wound care). Wiring changed from
  the original per-slot `src` prop to a `REAL_IMAGE_PATHS` map in
  `ImagePlaceholder.jsx` — landing a new image = add the WebP under
  `public/images/…` + one map entry; unmapped slots still render
  placeholders. Precache strategy decided: eager (Workbox `globPatterns`
  now includes `webp`), so every shipped image works offline. Current
  payload ~377 KB raw / 1.6 MB total precache; keep remaining thumbnails
  in the ~10-40 KB range to stay near the ~1 MB image budget. Still
  pending: ~14 other strand thumbnails and per-section lesson images —
  regenerate the brief with `npm run images:shotlist`.
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

## ALPHA SPRINT — Wed Jul 8 → Fri Jul 10, 2026 (CURRENT FOCUS — read this first)

**Goal:** by end of Friday Jul 10, the app is an **alpha** the user can hand
to trusted teachers (he and his wife teach; they have a review network) for
weekend feedback. That means: hosted at a URL, walkable end-to-end by a
teacher with zero instructions from us beyond a one-page guide, and covering
the four things the user asked for on Jul 8 — a real home page, teacher
lesson assignment, California standards tagging, and a visual glow-up.

**Why this replaces the previous section's plan:** PR #11/#12 landed the
hero-banner approach (hero atop the existing grid + density guideline +
~90 image slots backfilled across all 54 units). **User verdict: not what
was wanted** — "we didn't really get a new page… a new tab to go to."
The banner-on-grid compromise is dead; `/` becomes a true landing page and
the unit grid moves to its own route. Image-slot backfill from #12 stands
and feeds this sprint.

### Research inputs (done 2026-07-08, orchestrator)

- **Standards**: California HS sports medicine courses run under the
  **CTE Model Curriculum Standards, Health Science & Medical Technology
  sector, Patient Care pathway** — "B" pathway standards (official ID
  format `CTE.HSMT.B.x.y`, e.g. B4.5 "connect patient data to the
  appropriate system of care") plus 11 cross-sector anchor standards.
  For the 7-8 band, the **CA Health Education Content Standards (2008),
  Injury Prevention & Safety content area** is the right frame. NOTE:
  cde.ca.gov is unreachable from this container (network policy), so the
  catalog is drafted from knowledge + verified snippets and **must be
  human-verified by the user against the official PDFs** before we tell
  teachers the alignments are real.
- **Assignment-without-accounts is a proven pattern**: Nearpod (5-letter
  join code, student-paced mode), Quizlet student passes, Blooket homework
  links — students never create accounts. Teachers already know and trust
  the "join code" mental model; ours is the same move on top of the
  existing sync-code machinery.
- **Engagement (Khan Academy classroom redesign, ed-UX writing)**: the
  single highest-leverage pattern is a student dashboard that answers
  "what should I do next" with a short queue instead of the whole
  library; plus immediate feedback and light progress celebration. This
  matches the user's own reasoning for hiding the full lesson list
  (fast kids run out; overwhelmed kids shut down).

### Decisions (recommended defaults — user can override async)

1. **Library visibility**: with no assignment imported, students see the
   full library (needed for self-study + demo). Once an assignment code is
   imported, the default student view becomes "My Lessons" (the assigned
   queue) and the Library tab hides unassigned units behind the
   assignment's `mode`: `"focus"` (default — hidden, with a "your teacher
   assigns lessons here" note) or `"open"` (browse everything). Teacher
   picks the mode when generating the code.
2. **Standards frameworks**: tag units against BOTH CTE HSMT Patient Care
   (9-10/11-12 bands) and CA Health Ed Injury Prevention & Safety (7-8
   band); catalog entries carry `verified: false` until the user checks
   them against the official documents.
3. **Hosting**: GitHub Pages via an Actions workflow on `main` (static
   PWA, no backend — Pages is free and fits). Needs Pages enabled on the
   repo (user or orchestrator via API).

### Day 1 — Wed Jul 8: structure (home split + standards foundation)

*Routing: orchestrator writes specs + the standards catalog; everything
else is `implementer` (Sonnet).*

- [x] **True landing page + Library split** (`implementer`): `/` becomes a
      welcoming home — app identity, hero image slot (reuse the existing
      `home-hero` placeholder), prominent Continue card, "jump back in /
      start here" CTA, small how-it-works strip (student: read → quiz →
      flashcards → share code; teacher: pointer to Teacher tab), NO unit
      grid. Grid + grade filter + search move intact to `/lessons`
      ("Library" nav tab). Nav order: Home · Library · Sync · Teacher.
      All existing deep links (`/unit/:id` etc.) unchanged. 404 for
      stale routes still works. Verify at 375/768/desktop.
- [x] **Standards schema + display** (`implementer`): `standards: [id]`
      optional per unit; `src/content/standards.json` catalog
      (id → framework, code, text, verified flag); validator errors on
      unknown ids, warns on units with none; Unit page shows an
      expandable "Standards alignment" line; teacher CSV gains a
      standards column. No per-card badges yet (visual pass is Friday).
- [x] **Standards catalog drafted** (orchestrator — accuracy judgment):
      CTE HSMT anchor + Patient Care B standards relevant to our 18
      strands, CA Health Ed 7-8 Injury Prevention codes. Marked
      unverified; hand the user a verification checklist.
- [x] **Standards backfill DONE** (3 parallel Sonnet agents, one per
      band): all 54 units tagged 2-4 ids each, validator green with zero
      warnings, zero band mismatches. Mapping rationales reviewed per
      batch. NOTE for the user: `docs/STANDARDS-VERIFICATION.md` is the
      10-20 min human pass to confirm codes against the official CDE
      docs and flip `verified` flags.

### Day 2 — Thu Jul 9: assignments end-to-end (the big feature)

*Routing: orchestrator specs the code format + merge semantics first
(share.js is subtle); UI builds are `implementer` tasks.*

- [x] **Assignment code format** (`src/lib/assignments.js`): `SMIQA1.` +
      deflate-raw base64url (same plumbing as SMIQ2), payload
      `{name, unitIds[], mode, due?, createdAt}`. Multiple assignments
      can coexist; re-importing the same name updates it. Stored in the
      progress store but NOT in the student progress-code schema (codes
      stay compatible; completion is derivable from unit progress).
      Known alpha limitation to document: assignments don't follow a
      student who moves devices via progress code.
- [x] **Teacher: assignment builder** on Teacher page: pick units
      (grouped by strand × band, with grade-band filter), name it, pick
      focus/open mode, optional due date, generate + copy code. Roster
      gains per-assignment completion (% of assigned units complete per
      student) alongside existing columns.
- [x] **Student: import + My Lessons**: paste code on Sync (and a
      low-friction "have a class code?" entry on Home); "My Lessons"
      becomes the primary home-page module when assignments exist —
      Khan-style short queue ("next up" = first incomplete assigned
      unit), due date shown, per-assignment progress bar; Library obeys
      focus/open mode per decision 1.
- [x] **Browser-verify the full loop as both roles**: teacher builds code
      → student imports → queue + focus mode correct → student completes
      a unit → exports progress code → teacher roster shows assignment
      completion. Garbage/truncated assignment codes → friendly errors.
      (All four items above landed via PR #15, queue/focus polish in
      PR #16.)

### Day 3 — Fri Jul 10: look, ship, and hand off

- [x] **Aesthetic pass — DONE 2026-07-15** (`f987281` + `ebc5005`, two
      `implementer` runs from orchestrator specs, browser-verified incl.
      an end-to-end completion flow). Landed: design tokens + type scale,
      7 category accent colors, two-column landing hero, card
      elevation/hover, lesson section rhythm + callout markers, quiz
      letter-chips/progress-bar/feedback accents, flashcard + achievements
      polish, app-wide `:focus-visible` rings (three pre-existing
      `outline: none` rules removed), reduced-motion support, and
      placeholder slots upgraded from dashed dev boxes to soft
      "Illustration coming soon" tiles (metadata kept in title/data
      attrs; real-image swap path unchanged). Original scope line kept
      below for reference:
      (orchestrator sets direction — palette,
      type scale, category accent colors; `implementer` executes):
      landing hero treatment, card elevation/hover, lesson reading
      layout (measure, section rhythm, callout styling), quiz/flashcard
      polish, and upgrade student-facing `ImagePlaceholder` boxes from
      "dashed dev box" to a presentable illustrated-tile look (soft
      gradient + icon + label) so the alpha doesn't look unfinished
      before real images land.
- [x] **Deploy** (landed: `e03e3ab`, `.github/workflows/deploy-pages.yml`,
      hash routing under `/SportsMed-IQ/`): GitHub Pages workflow (build on push to `main`),
      Vite `base` set correctly, SW/manifest verified on the deployed
      URL (installability + offline reload on the real host, not just
      preview).
- [ ] **QA sweep** (orchestrator drives): fresh-profile walkthroughs as
      student and teacher at 375/768/desktop; zero console errors;
      validator + build green; sync codes (SMIQ1/SMIQ2/SMIQA1) all
      round-trip.
- [ ] **Alpha kit for testers**: seeded demo assignment code + demo
      roster the user can share; `TESTERS.md` one-pager (what to try,
      known gaps incl. unverified standards + placeholder images, where
      to send feedback). Regenerate `npm run images:shotlist` after the
      hero/landing rework so the ChatGPT image brief is current.

### Alpha bar (definition of done for Friday)

A teacher with the URL and the one-pager can: land on a real home page
that explains the app → browse the library → read a lesson, take a quiz,
flip flashcards → build an assignment code for a picked set of units →
watch a (demo or real) student's progress land in the roster with
standards + assignment columns in the CSV. All offline-capable, phone
through desktop, nothing that looks like scaffolding.

### Explicitly deferred past alpha (so the sprint stays a sprint)

Real images (first 12 landed 2026-07-11 via PR #29 — hero, category
icons, safety-strand thumbnails; the rest still pending), strand
cross-links between grade-band siblings, `UnitCard` pill-logic cleanup,
gamification beyond the queue (streaks/badges), fuller standards
coverage reporting for teachers, accounts/live sync (permanently out).

## Previous plan (hero-banner approach) — SUPERSEDED 2026-07-08, kept for context

Real teacher feedback after using the app: **"Needs a home page, opening up
to a lesson is a lot. It's not aesthetically pleasing."** Plus a content
request: **lessons should have picture space, with lower grades more
picture-heavy and upper grades less.** No login/accounts system yet —
still explicitly out of scope. Two decisions were confirmed with the user
before writing this plan:

- **Home page approach**: keep `/` as the existing unit grid (do not split
  into a separate welcome route) — add a hero/intro banner on top of it
  instead. Lighter lift, no nav/routing change, but note this only
  partially addresses "opening up to a lesson is a lot" per se — the grid
  is still the very next thing on the page. Revisit a fuller landing-page
  split later if the hero banner alone doesn't move the feedback enough.
- **Image backfill**: seed image slots across all 54 existing units now
  (not just document the rule for future content), so the shot-list brief
  handed to the external image author (ChatGPT) is complete immediately
  rather than growing unit-by-unit over time.

### 1. Home page hero banner

Add a welcoming header section to `src/pages/HomePage.jsx`, above the
existing grade-band picker/search row, without moving or restructuring the
grid below it:

- App identity + a one-line warm welcome (not just "Units" as the page
  `<h1>`), friendlier tone than the current bare heading.
- Give the existing `ContinueCard` more visual prominence when present —
  it's currently a plain card in the flow; consider making it read as
  clearly the "primary" thing on the page for a returning student.
- A hero image slot using the existing `ImagePlaceholder` pipeline
  (new purpose `"home hero image"`, e.g. `home-hero.webp`, wide ratio
  like `21:9` or `16:9`) so it's automatically picked up by
  `scripts/list-image-slots.mjs` and the ChatGPT brief — no new plumbing
  needed, it's the same component/pattern already used for category icons
  and unit thumbnails.
- This is layout + a bit of new copy in `HomePage.jsx`; no schema changes,
  no new routes.

### 2. Grade-band picture-density guideline (documentation)

Add an explicit picture-density rule to `src/content/README.md`'s
grade-band table (extends the existing tone/depth contract, doesn't
replace it) — something like:

| Band | Picture density |
|---|---|
| `7-8` | Image-heavy: aim for a diagram/illustration in most sections — roughly 3-5 per unit. Supports readers who benefit from visual anchors; matches this band's "short, concrete, recognize-it" tone. |
| `9-10` | Moderate: images in key/complex sections only — anatomy, mechanism-of-injury, technique. Roughly 1-3 per unit (close to today's ad hoc usage on the two seeded units). |
| `11-12` | Minimal: only genuinely necessary diagrams — grading systems, differential/comparison charts. Roughly 0-2 per unit; text/vocabulary-forward per this band's existing depth contract. |

Once documented, this becomes part of the authoring contract the
`unit-author` agent already reads, so it applies automatically to any
future new unit — the backfill below is only needed for the 54 units that
predate this rule.

### 3. Backfill image slots across all 54 existing units

Content-only work (add `image` objects to existing `sections` entries in
unit JSON), gated by `npm run validate:content` — no component code
changes, since the `image` field and its rendering already exist and are
already grade-band-filterable via the unit's existing `gradeBand` field.

- Rough scope: 18 `7-8` units need bringing up to ~3-5 images each
  (currently ~0 — none have been seeded yet). 18 `9-10` units need light
  seeding to ~1-3 each (2 already seeded: ankle-sprain, knee-acl). 18
  `11-12` units need minimal, targeted seeding (~0-2 each, only where a
  real diagram earns its place — e.g. a grading-system chart).
  Roughly 60-90 new placeholder slots in total.
- Each `image` needs a genuinely useful `description`/`alt` derived from
  that section's actual content (same bar as the two seeded examples) —
  not filler. This is the same judgment `unit-author` already exercises
  when writing lesson text.
- Routing: batch as `unit-author`-style Sonnet agent tasks grouped by
  strand or band (keeps each batch small enough to review), each running
  `validate:content` before reporting back. Orchestrator reviews the
  diffs + validator output, doesn't re-derive each description by hand.
- After backfill, re-run `npm run images:shotlist` to regenerate the full,
  now-complete brief for the external image author.

### 4. Aesthetic pass (visual design, not the status-icon consistency work already done)

The earlier "app-wide status styling pass" (`611f291`) made progress
*state* (✓/●/○/⚠) read consistently — this is different: the app still
looks flat/boxy/text-only overall, which is the other half of "not
aesthetically pleasing." Two sub-phases, sequenced differently:

- **4a — structural, doable now, no dependency on real art**: card
  elevation (subtle shadow vs. today's flat border-only cards), spacing
  rhythm, typography scale (more weight/size contrast on headings vs.
  body), general polish pass on `src/styles.css`. Can run any time,
  including alongside item 3's content backfill.
- **4b — revisit once real images exist**: once ChatGPT-produced WebP
  files start landing in `public/images/…` and get swapped into the
  placeholder slots (hero, category icons, unit thumbnails, lesson
  diagrams via the `src` prop), the visual weight of the page changes
  substantially — worth a second look at spacing/card sizing once real
  imagery is actually present rather than guessing at layout now. Also
  when this happens: revisit the precache-size decision already flagged
  in the section above (lazy-load vs. eager, per-image budget).

### Suggested sequencing

1. Home hero banner (item 1) — smallest, most directly answers the
   teacher's "opening up is a lot" complaint.
2. Picture-density guideline doc update (item 2) — quick, unlocks item 3.
3. Backfill content pass (item 3) — biggest lift, delegate in batches.
4. 4a structural CSS pass — can overlap with 3.
5. 4b revisit — later, blocked on real images actually landing.

## Out of scope (intentional)

Accounts/auth and live server-based sync remain permanently out. Assigning
content moved IN scope 2026-07-08 (via offline assignment codes — see the
alpha sprint above); it is no longer on this list.
