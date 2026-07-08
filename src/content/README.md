# SportMedIQ content system

All learning content lives in this folder as JSON. **Adding or updating a unit
never requires touching component code** — drop a new `*.json` file into
`src/content/units/` and it appears in the app on the next build.

## Unit file schema (`src/content/units/<unit-id>.json`)

```jsonc
{
  "id": "ankle-sprain",          // must match the filename, used in URLs
  "title": "Ankle Sprains",
  "category": "Lower Extremity", // units are grouped by category on the home screen
  "strand": "ankle-sprain",      // topic id shared across grade-band versions of the
                                  // same subject, so they can be linked/found together.
                                  // A single-band topic's strand is just its own id.
  "gradeBand": "9-10",           // one of "7-8" | "9-10" | "11-12" — which of the app's
                                  // three grade bands this version is written for; the
                                  // home screen's grade filter reads this
  "summary": "One-sentence description shown on the unit card.",
  "minutes": 15,                 // rough study time estimate

  // Lesson content, rendered in order.
  "sections": [
    {
      "heading": "Anatomy review",
      "body": ["First paragraph.", "Second paragraph."],  // paragraphs (optional if "list" or "callout" present)
      "list": ["Optional bullet", "Another bullet"],       // optional bullet list
      "callout": {                                          // optional highlighted box
        "type": "warning",       // "warning" (red flags / refer out) or "tip" (field tips)
        "title": "Red flags — refer to a physician",
        "text": "Callout body text."
      },
      "image": {                 // optional lesson diagram, rendered after the section's
                                  // paragraphs/list/callout via <ImagePlaceholder> until a
                                  // real image lands. Purpose is implicitly "lesson diagram"
                                  // and noText is always true — omit the field entirely if a
                                  // section has no diagram.
        "asset": "ankle-sprain-lateral-ligaments.webp",  // filename, must end in ".webp"
        "ratio": "4:3",                                   // aspect ratio, must match "\d+:\d+"
        "background": "white",                            // "transparent" | "white" | "dark"
        "description": "Visual description for the image author: body position, angle, what's highlighted.",
        "alt": "Accessibility alt text describing the image.",
        "location": "public/images/units/ankle-sprain/"   // target dir, must start with "public/images/"
      }
    }
  ],

  // Multiple-choice quiz. answerIndex is the 0-based index into choices.
  "quiz": [
    {
      "id": "q1",
      "question": "Which ligament is most commonly injured in a lateral ankle sprain?",
      "choices": ["ATFL", "Deltoid", "PCL", "ACL"],
      "answerIndex": 0,
      "explanation": "Shown after answering, right or wrong."
    }
  ],

  // Flashcards for review.
  "flashcards": [
    { "id": "f1", "front": "Term or question", "back": "Definition or answer" }
  ]
}
```

Rules:

- `id` must be URL-safe (lowercase, hyphens) and unique across units.
- `strand` + `gradeBand` together must be unique — a strand can have at most
  one unit per band.
- Every quiz question needs at least 2 choices and a valid `answerIndex`.
- A section's optional `image` object, when present, must have all six fields
  (`asset`, `ratio`, `background`, `description`, `alt`, `location`) as
  non-empty strings, `ratio` matching `\d+:\d+`, `asset` ending in `.webp`,
  and `location` starting with `public/images/` — enforced by
  `scripts/validate-content.mjs`. Real image files land later in
  `public/images/`; until then the slot renders as a labeled placeholder
  (`src/components/ImagePlaceholder.jsx`). `node scripts/list-image-slots.mjs`
  scans every unit (plus the home page's category/unit-card slots) to
  regenerate the full image shot list.
- The loader (`src/content/index.js`) validates units at startup and logs a
  clear error for malformed files instead of crashing the app.
- `scripts/validate-content.mjs` (`npm run validate:content`) is the strict
  gate — schema, house-style minimums, and grade-band rules below.

## Grade bands: a spiral curriculum, 7th-12th grade

The app is a 6-year program. Rather than one difficulty level, most topics
("strands") are meant to be written **three times** — once per grade band —
each revisiting the same subject at a deeper level than the last. A student
who takes the concussion unit in 7th grade should encounter it again in 9th
and 11th, learning more each time, not just rereading the same lesson.

| Band    | Grades | Reading level & depth |
|---------|--------|------------------------|
| `7-8`   | 7th-8th | Short, concrete sentences. Frame everything as "recognize it, tell a trusted adult" — no independent field decisions. Avoid dense medical vocabulary; when a term is unavoidable, define it in one plain-language clause right there. Shorter lesson (4-6 sections), gentler quiz (recall and simple recognition, not multi-step scenarios), same section/quiz/flashcard *counts* as other bands unless noted below. |
| `9-10`  | 9th-10th | The app's original baseline level (all units authored before grade banding existed are here). Real terminology introduced properly, "recognize, protect, refer" framing, sideline-relevant decisions a rules-following student assistant might face. |
| `11-12` | 11th-12th | Builds on the 9-10 version rather than repeating it — deeper mechanism-of-injury/anatomy, differential thinking ("how do you tell X from Y"), grading systems, athletic-training-adjacent vocabulary, harder decision-scenario quiz questions. Assume the student already has the 9-10 concepts; don't re-teach them from scratch. |

When authoring a new grade-band version of an existing strand, read the
other band(s) of that strand first (find them via matching `strand`) so
depth actually increases instead of just restating the same content in
different words.

Not every strand needs all three bands filled immediately — a strand with
only a `9-10` unit today is a normal, valid, incomplete state while the
library fills in. `PLAN.md` tracks which strand/band combinations exist and
which are queued.
