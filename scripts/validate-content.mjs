// Standalone content validator — the quality gate for unit JSON files.
//
// Stricter than the runtime loader (src/content/index.js): the loader only
// guards against crashes, while this enforces the house content standard so
// a unit that passes here is publishable without human review of structure.
// Run with: npm run validate:content
//
// Exit code 1 on any ERROR; WARNINGS are printed but do not fail the run.

import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const contentDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/content')
const unitsDir = path.join(contentDir, 'units')

const VALID_CALLOUT_TYPES = ['warning', 'tip']
const VALID_GRADE_BANDS = ['7-8', '9-10', '11-12']

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0
}

function checkUnit(unit, file, standardsCatalog) {
  const errors = []
  const warnings = []
  const err = (msg) => errors.push(msg)
  const warn = (msg) => warnings.push(msg)

  // Identity and card metadata — everything the home screen needs.
  const expectedId = path.basename(file, '.json')
  if (!isNonEmptyString(unit.id) || !/^[a-z0-9-]+$/.test(unit.id)) err('missing or invalid "id"')
  else if (unit.id !== expectedId) err(`"id" (${unit.id}) must match filename (${expectedId})`)
  if (!isNonEmptyString(unit.title)) err('missing "title"')
  if (!isNonEmptyString(unit.category)) err('missing "category"')
  if (!isNonEmptyString(unit.summary)) err('missing "summary"')
  if (!Number.isFinite(unit.minutes) || unit.minutes <= 0) err('"minutes" must be a positive number')
  if (!VALID_GRADE_BANDS.includes(unit.gradeBand))
    err(`"gradeBand" must be one of: ${VALID_GRADE_BANDS.join(', ')}`)
  if (!isNonEmptyString(unit.strand) || !/^[a-z0-9-]+$/.test(unit.strand))
    err('missing or invalid "strand" (lowercase-hyphenated topic id shared across grade-band versions)')

  // Lesson sections.
  if (!Array.isArray(unit.sections) || unit.sections.length === 0) {
    err('missing "sections"')
  } else {
    if (unit.sections.length < 4) warn(`only ${unit.sections.length} sections (house style is 5-8)`)
    unit.sections.forEach((s, i) => {
      if (!isNonEmptyString(s.heading)) err(`sections[${i}] missing "heading"`)
      if (s.body === undefined && s.list === undefined && s.callout === undefined)
        err(`sections[${i}] needs at least one of "body", "list", "callout"`)
      if (s.body !== undefined && (!Array.isArray(s.body) || s.body.length === 0 || !s.body.every(isNonEmptyString)))
        err(`sections[${i}] "body" must be a non-empty array of paragraphs`)
      if (s.list !== undefined && (!Array.isArray(s.list) || !s.list.every(isNonEmptyString)))
        err(`sections[${i}] "list" must be an array of strings`)
      if (s.callout !== undefined) {
        if (!VALID_CALLOUT_TYPES.includes(s.callout.type))
          err(`sections[${i}] callout type must be one of: ${VALID_CALLOUT_TYPES.join(', ')}`)
        if (!isNonEmptyString(s.callout.title) || !isNonEmptyString(s.callout.text))
          err(`sections[${i}] callout needs "title" and "text"`)
      }
      if (s.image !== undefined) {
        const img = s.image
        const fields = ['asset', 'ratio', 'background', 'description', 'alt', 'location']
        for (const field of fields) {
          if (!isNonEmptyString(img[field])) err(`sections[${i}] image missing "${field}"`)
        }
        if (isNonEmptyString(img.ratio) && !/^\d+:\d+$/.test(img.ratio))
          err(`sections[${i}] image "ratio" must look like "16:9"`)
        if (isNonEmptyString(img.asset) && !img.asset.endsWith('.webp'))
          err(`sections[${i}] image "asset" must end in ".webp"`)
        if (isNonEmptyString(img.location) && !img.location.startsWith('public/images/'))
          err(`sections[${i}] image "location" must start with "public/images/"`)
      }
    })
  }

  // Quiz.
  if (!Array.isArray(unit.quiz) || unit.quiz.length === 0) {
    err('missing "quiz"')
  } else {
    if (unit.quiz.length < 6) err(`quiz has ${unit.quiz.length} questions (minimum 6, house style 8)`)
    else if (unit.quiz.length < 8) warn(`quiz has ${unit.quiz.length} questions (house style is 8)`)
    const qIds = new Set()
    const answerPositions = []
    unit.quiz.forEach((q, i) => {
      if (!isNonEmptyString(q.id)) err(`quiz[${i}] missing "id"`)
      else if (qIds.has(q.id)) err(`quiz[${i}] duplicate id "${q.id}"`)
      else qIds.add(q.id)
      if (!isNonEmptyString(q.question)) err(`quiz[${i}] missing "question"`)
      if (!Array.isArray(q.choices) || q.choices.length < 3)
        err(`quiz[${i}] needs at least 3 choices`)
      else if (new Set(q.choices.map((c) => String(c).trim().toLowerCase())).size !== q.choices.length)
        err(`quiz[${i}] has duplicate choices`)
      if (
        !Number.isInteger(q.answerIndex) ||
        q.answerIndex < 0 ||
        q.answerIndex >= (q.choices?.length ?? 0)
      )
        err(`quiz[${i}] has an invalid answerIndex`)
      else answerPositions.push(q.answerIndex)
      if (!isNonEmptyString(q.explanation)) err(`quiz[${i}] missing "explanation"`)
    })
    // Choices are shuffled per attempt at runtime, but flag authoring bias anyway.
    if (answerPositions.length >= 6) {
      const counts = {}
      for (const p of answerPositions) counts[p] = (counts[p] ?? 0) + 1
      const [pos, max] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
      if (max / answerPositions.length > 0.5)
        warn(`${max}/${answerPositions.length} correct answers sit at choice index ${pos} — vary answer positions`)
    }
  }

  // Flashcards.
  if (!Array.isArray(unit.flashcards) || unit.flashcards.length === 0) {
    err('missing "flashcards"')
  } else {
    if (unit.flashcards.length < 8)
      err(`only ${unit.flashcards.length} flashcards (minimum 8, house style 12)`)
    else if (unit.flashcards.length < 12)
      warn(`${unit.flashcards.length} flashcards (house style is 12)`)
    const fIds = new Set()
    unit.flashcards.forEach((f, i) => {
      if (!isNonEmptyString(f.id)) err(`flashcards[${i}] missing "id"`)
      else if (fIds.has(f.id)) err(`flashcards[${i}] duplicate id "${f.id}"`)
      else fIds.add(f.id)
      if (!isNonEmptyString(f.front)) err(`flashcards[${i}] missing "front"`)
      if (!isNonEmptyString(f.back)) err(`flashcards[${i}] missing "back"`)
    })
  }

  // California standards alignment (optional, transitioning in — see
  // "standards" in src/content/README.md). No `standards` field or an
  // empty one just warns for now, since the backfill hasn't landed yet.
  if (unit.standards === undefined || (Array.isArray(unit.standards) && unit.standards.length === 0)) {
    warn('missing "standards" (California standards alignment not yet tagged — backfill pending)')
  } else if (!Array.isArray(unit.standards) || !unit.standards.every(isNonEmptyString)) {
    err('"standards" must be an array of catalog id strings')
  } else {
    const seen = new Set()
    for (const id of unit.standards) {
      if (seen.has(id)) {
        err(`"standards" has duplicate id "${id}"`)
        continue
      }
      seen.add(id)
      const standard = standardsCatalog.standardsById.get(id)
      if (!standard) {
        err(`"standards" references unknown id "${id}" (not in src/content/standards.json)`)
        continue
      }
      const framework = standardsCatalog.frameworks[standard.framework]
      if (framework && isNonEmptyString(unit.gradeBand) && !framework.appliesTo.includes(unit.gradeBand)) {
        warn(
          `"standards" id "${id}" belongs to framework "${standard.framework}" whose appliesTo (${framework.appliesTo.join(', ')}) does not include this unit's gradeBand (${unit.gradeBand})`
        )
      }
    }
  }

  // Peer-reviewed sources (optional; cited per unit as content is verified —
  // see "sources" in src/content/README.md). Absent is fine and silent.
  if (unit.sources !== undefined) {
    if (!Array.isArray(unit.sources) || unit.sources.length === 0) {
      err('"sources" must be a non-empty array when present')
    } else {
      unit.sources.forEach((s, i) => {
        if (!s || typeof s !== 'object') return err(`sources[${i}] must be an object`)
        if (!isNonEmptyString(s.title)) err(`sources[${i}] missing "title"`)
        if (!Number.isInteger(s.year) || s.year < 1900 || s.year > 2100)
          err(`sources[${i}] "year" must be a 4-digit year`)
        if (s.publisher !== undefined && !isNonEmptyString(s.publisher))
          err(`sources[${i}] "publisher" must be a non-empty string when present`)
        if (s.url !== undefined && !/^https?:\/\//.test(String(s.url)))
          err(`sources[${i}] "url" must start with http(s):// when present`)
      })
    }
  }

  return { errors, warnings }
}

function checkStandardsCatalog(catalog) {
  const errors = []
  for (const standard of catalog.standards ?? []) {
    if (!catalog.frameworks?.[standard.framework]) {
      errors.push(`standard "${standard.id}" references unknown framework "${standard.framework}"`)
    }
  }
  return errors
}

const standardsCatalogRaw = JSON.parse(await readFile(path.join(contentDir, 'standards.json'), 'utf8'))
const standardsCatalog = {
  frameworks: standardsCatalogRaw.frameworks ?? {},
  standardsById: new Map((standardsCatalogRaw.standards ?? []).map((s) => [s.id, s])),
}

let errorCount = 0
for (const e of checkStandardsCatalog(standardsCatalogRaw)) {
  console.error(`✗ standards.json: ${e}`)
  errorCount++
}

const files = (await readdir(unitsDir)).filter((f) => f.endsWith('.json')).sort()
const seenIds = new Set()
const seenStrandBands = new Set()

for (const file of files) {
  let unit
  try {
    unit = JSON.parse(await readFile(path.join(unitsDir, file), 'utf8'))
  } catch (e) {
    console.error(`✗ ${file}: invalid JSON — ${e.message}`)
    errorCount++
    continue
  }
  const { errors, warnings } = checkUnit(unit, file, standardsCatalog)
  if (isNonEmptyString(unit.id)) {
    if (seenIds.has(unit.id)) errors.push(`duplicate unit id "${unit.id}"`)
    seenIds.add(unit.id)
  }
  if (isNonEmptyString(unit.strand) && isNonEmptyString(unit.gradeBand)) {
    const key = `${unit.strand}::${unit.gradeBand}`
    if (seenStrandBands.has(key))
      errors.push(`duplicate strand+gradeBand: "${unit.strand}" already has a "${unit.gradeBand}" unit`)
    seenStrandBands.add(key)
  }
  for (const w of warnings) console.warn(`⚠ ${file}: ${w}`)
  for (const e of errors) console.error(`✗ ${file}: ${e}`)
  errorCount += errors.length
  if (errors.length === 0)
    console.log(
      `✓ ${file} — ${unit.sections?.length ?? 0} sections, ${unit.quiz?.length ?? 0} questions, ${unit.flashcards?.length ?? 0} flashcards${warnings.length ? ` (${warnings.length} warning${warnings.length > 1 ? 's' : ''})` : ''}`
    )
}

console.log(`\n${files.length} unit files checked, ${errorCount} error${errorCount === 1 ? '' : 's'}.`)
if (errorCount > 0) process.exit(1)
