// Subject-content audit generator.
// Scans every unit JSON file and prints a Markdown completeness audit and image manifest.
// Run with: npm run audit:content

import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const unitsDir = path.join(rootDir, 'src/content/units')
const standardsPath = path.join(rootDir, 'src/content/standards.json')

const files = (await readdir(unitsDir)).filter((file) => file.endsWith('.json')).sort()
const records = []
for (const file of files) {
  try {
    records.push({ file, unit: JSON.parse(await readFile(path.join(unitsDir, file), 'utf8')) })
  } catch (error) {
    records.push({ file, unit: null, parseError: error.message })
  }
}

let standardsCatalog = { standards: [] }
try {
  standardsCatalog = JSON.parse(await readFile(standardsPath, 'utf8'))
} catch {
  // The strict validator owns malformed-catalog errors. Keep this report usable.
}
const standardsById = new Map((standardsCatalog.standards ?? []).map((standard) => [standard.id, standard]))

const md = (value) => String(value ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ')
const status = (complete, partial = false) => (complete ? 'Complete' : partial ? 'Needs review' : 'Missing')

function wordCount(unit) {
  return (unit.sections ?? []).reduce((total, section) => {
    const text = [
      ...(section.body ?? []),
      ...(section.list ?? []),
      section.callout?.text ?? '',
    ].join(' ')
    return total + text.trim().split(/\s+/).filter(Boolean).length
  }, 0)
}

function images(unit) {
  return (unit.sections ?? []).flatMap((section) => (section.image ? [section.image] : []))
}

function checks(unit) {
  return (unit.sections ?? []).filter(
    (section) => section.check || section.knowledgeCheck || section.question || section.activity,
  ).length
}

function firstArray(unit, keys) {
  for (const key of keys) if (Array.isArray(unit[key])) return unit[key]
  return []
}

function audit(record) {
  if (!record.unit) {
    return {
      file: record.file,
      title: 'Malformed JSON',
      gradeBand: '—',
      category: '—',
      strand: '—',
      words: 0,
      sections: 0,
      quiz: 0,
      flashcards: 0,
      standards: 0,
      verifiedStandards: 0,
      unresolvedStandards: 0,
      diagrams: 0,
      checks: 0,
      practicals: 0,
      teacherResources: 0,
      problems: [`JSON parse error: ${record.parseError}`],
    }
  }

  const unit = record.unit
  const lessonWords = wordCount(unit)
  const standardIds = Array.isArray(unit.standards) ? unit.standards : []
  const resolved = standardIds.filter((id) => standardsById.has(id))
  const verified = resolved.filter((id) => standardsById.get(id)?.verified)
  const unresolved = standardIds.filter((id) => !standardsById.has(id))
  const diagrams = images(unit)
  const embeddedChecks = checks(unit)
  const practicals = firstArray(unit, ['practicalActivities', 'activities', 'practicals'])
  const resources = firstArray(unit, ['teacherResources', 'resources', 'teacher'])
  const problems = []

  if (!unit.summary) problems.push('Missing summary')
  if (!unit.gradeBand) problems.push('Missing grade band')
  if (!unit.category) problems.push('Missing category')
  if (!unit.strand) problems.push('Missing strand')
  if ((unit.sections ?? []).length === 0) problems.push('No lesson sections')
  if (lessonWords < 250) problems.push(`Thin lesson content (${lessonWords} words)`)
  if ((unit.quiz ?? []).length < 8) problems.push(`Short quiz (${unit.quiz?.length ?? 0})`)
  if ((unit.flashcards ?? []).length < 8) problems.push(`Short flashcard set (${unit.flashcards?.length ?? 0})`)
  if (standardIds.length === 0) problems.push('No standards tagged')
  if (unresolved.length > 0) problems.push(`Unresolved standards: ${unresolved.join(', ')}`)
  if (resolved.length > verified.length) problems.push('Standards include draft/unverified entries')
  if (diagrams.length === 0) problems.push('No lesson diagrams')
  if (embeddedChecks === 0) problems.push('No embedded knowledge checks')
  if (practicals.length === 0) problems.push('No practical activity')
  if (resources.length === 0) problems.push('No teacher resource')

  return {
    file: record.file,
    title: unit.title,
    gradeBand: unit.gradeBand,
    category: unit.category,
    strand: unit.strand,
    words: lessonWords,
    sections: unit.sections?.length ?? 0,
    quiz: unit.quiz?.length ?? 0,
    flashcards: unit.flashcards?.length ?? 0,
    standards: standardIds.length,
    verifiedStandards: verified.length,
    unresolvedStandards: unresolved.length,
    diagrams: diagrams.length,
    checks: embeddedChecks,
    practicals: practicals.length,
    teacherResources: resources.length,
    problems,
  }
}

const audited = records.map(audit)
const validUnits = records.map((record) => record.unit).filter(Boolean)
const validRows = audited.filter((row) => row.title !== 'Malformed JSON')
const categories = [...new Set(validRows.map((row) => row.category).filter(Boolean))].sort()
const strands = [...new Set(validRows.map((row) => row.strand).filter(Boolean))].sort()

console.log('# Subject Content Completeness Audit\n')
console.log(`Generated from ${files.length} unit JSON files.\n`)
console.log('## Coverage summary\n')
console.log(`- Units: ${validRows.length}`)
console.log(`- Grade bands: ${[...new Set(validRows.map((row) => row.gradeBand))].sort().join(', ') || 'None'}`)
console.log(`- Categories: ${categories.length}`)
console.log(`- Strands: ${strands.length}`)
console.log(`- Quiz questions: ${validRows.reduce((sum, row) => sum + row.quiz, 0)}`)
console.log(`- Flashcards: ${validRows.reduce((sum, row) => sum + row.flashcards, 0)}`)
console.log(`- Lesson diagrams declared: ${validRows.reduce((sum, row) => sum + row.diagrams, 0)}`)
console.log(`- Practical activities declared: ${validRows.reduce((sum, row) => sum + row.practicals, 0)}\n`)

console.log('## Unit-by-unit audit\n')
console.log('| Unit | Grade | Category | Lesson | Quiz | Flashcards | Standards | Diagrams | Checks | Practical | Teacher resource |')
console.log('|---|---|---|---|---|---|---|---|---|---|---|')
for (const row of audited) {
  const lesson = status(row.sections > 0 && row.words >= 250, row.sections > 0)
  const standards = row.standards === 0
    ? 'Missing'
    : row.unresolvedStandards > 0 || row.verifiedStandards < row.standards
      ? `${row.verifiedStandards}/${row.standards} verified`
      : 'Verified'
  console.log(`| ${md(row.title)} | ${md(row.gradeBand)} | ${md(row.category)} | ${lesson} (${row.words} words) | ${status(row.quiz >= 8, row.quiz > 0)} (${row.quiz}) | ${status(row.flashcards >= 8, row.flashcards > 0)} (${row.flashcards}) | ${standards} | ${row.diagrams} | ${row.checks} | ${row.practicals > 0 ? 'Yes' : 'No'} | ${row.teacherResources > 0 ? 'Yes' : 'No'} |`)
}

console.log('\n## Prioritized backlog\n')
const priorities = [
  'JSON parse error', 'No lesson sections', 'Thin lesson content', 'Short quiz',
  'Short flashcard set', 'No standards tagged', 'Unresolved standards',
  'Standards include draft/unverified entries', 'No lesson diagrams',
  'No embedded knowledge checks', 'No practical activity', 'No teacher resource',
]
const rank = (problem) => {
  const index = priorities.findIndex((prefix) => problem.startsWith(prefix))
  return index === -1 ? priorities.length : index
}
const backlog = audited.flatMap((row) => row.problems.map((problem) => ({ row, problem })))
backlog.sort((a, b) => rank(a.problem) - rank(b.problem) || a.row.title.localeCompare(b.row.title))
if (backlog.length === 0) console.log('No audit gaps found.')
for (const { row, problem } of backlog) console.log(`- **${md(row.title)}** (${md(row.gradeBand)}): ${md(problem)}`)

console.log('\n## Image production manifest\n')
console.log('| Asset | Purpose | Ratio | Background | Folder | Unit/grade | Description | Alt text | Accuracy requirement |')
console.log('|---|---|---|---|---|---|---|---|---|')
console.log('| home-hero.webp | Home hero | 21:9 | white | public/images/home/ | Platform | Student athletic trainer taping an ankle on the sideline with an open first-aid kit | Student athletic trainer taping an athlete’s ankle on the sideline | Realistic taping position, age-appropriate school setting, no visible brand logos |')
for (const category of categories) {
  const slug = category.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  console.log(`| category-${slug}.webp | Category icon | 1:1 | transparent | public/images/categories/ | ${md(category)} | Simple flat icon representing ${md(category)} | ${md(category)} icon | Recognizable at small size; no text |`)
}
for (const strand of strands) {
  const versions = validUnits.filter((unit) => unit.strand === strand)
  const canonical = versions.find((unit) => unit.gradeBand === '9-10') ?? versions[0]
  console.log(`| unit-${md(strand)}-hero.webp | Unit thumbnail | 3:2 | white | public/images/units/${md(strand)}/ | ${md(canonical?.title)} / shared | Illustrative thumbnail for ${md(canonical?.title)}: ${md(canonical?.summary)} | Thumbnail illustration for ${md(canonical?.title)} | Medically accurate body position/equipment; no embedded text |`)
}
for (const unit of validUnits) {
  for (const section of unit.sections ?? []) {
    const image = section.image
    if (!image) continue
    console.log(`| ${md(image.asset)} | Lesson diagram | ${md(image.ratio)} | ${md(image.background)} | ${md(image.location)} | ${md(unit.title)} / ${md(unit.gradeBand)} | ${md(image.description)} | ${md(image.alt)} | Anatomical and procedural details must match the lesson; labels only when explicitly required |`)
  }
}

console.log('\n## Completion definition used by this audit\n')
console.log('- Lesson: at least one section and at least 250 instructional words.')
console.log('- Quiz: at least 8 questions.')
console.log('- Flashcards: at least 8 cards.')
console.log('- Standards: every referenced ID resolves and is marked verified.')
console.log('- Visuals: at least one lesson diagram, plus the shared unit thumbnail generated by strand.')
console.log('- Embedded checks: at least one section-level check/question/activity marker.')
console.log('- Practical activity: at least one item in practicalActivities, activities, or practicals.')
console.log('- Teacher resource: at least one item in teacherResources, resources, or teacher.')
