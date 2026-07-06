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
- Every quiz question needs at least 2 choices and a valid `answerIndex`.
- The loader (`src/content/index.js`) validates units at startup and logs a
  clear error for malformed files instead of crashing the app.
