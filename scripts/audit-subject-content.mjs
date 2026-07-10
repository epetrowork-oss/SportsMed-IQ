// Subject-content audit generator.
// Scans every unit JSON file and prints a Markdown completeness audit.
// Run with: npm run audit:content

import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const unitsDir = path.join(rootDir, 'src/content/units')
const standardsPath = path.join(rootDir, 'src/content/standards.json')
const activitiesPath = path.join(rootDir, 'src/content/activities.json')

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

let activityCatalog = { activities: [] }
try {
  activityCatalog = JSON.parse(await readFile(activitiesPath, 'utf8'))
} catch {
  // activities.json is optional until the practical-activity feature lands.
}
const activities = Array.isArray(activityCatalog.activities) ? activityCatalog.activities : []

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

function matchingActivities(unit) {
  return activities.filter((activity) => {
    const targets = Array.isArray(activity.targetStrands) ? activity.targetStrands : []
    const bands = Array.isArray(activity.gradeBands) ? activity.gradeBands : []
    const targetMatch = targets.includes(unit.strand) || targets.includes(unit.id)
    const bandMatch = bands.length === 0 || bands.includes(unit.gradeBand)
    return targetMatch && bandMatch
  })
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
  const practicals = matchingActivities(unit)
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
console.log(`- Practical activity matches: ${validRows.reduce((sum, row) => sum + row.practicals, 0)}\n`)

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

const priorities = [
  'JSON parse error', 'No lesson sections', 'Thin lesson content', 'Short quiz',
  'Short flashcard set', 'No standards tagged', 'Unresolved standards',
  'No lesson diagrams', 'Standards include draft/unverified entries',
  'No embedded knowledge checks', 'No practical activity', 'No teacher resource',
]
const rank = (problem) => {
  const index = priorities.findIndex((prefix) => problem.startsWith(prefix))
  return index === -1 ? priorities.length : index
}
const backlog = audited.flatMap((row) => row.problems.map((problem) => ({ row, problem })))
backlog.sort((a, b) => rank(a.problem) - rank(b.problem) || a.row.title.localeCompare(b.row.title))

const roadmapPrefixes = [
  'Standards include draft/unverified entries',
  'No embedded knowledge checks',
  'No practical activity',
  'No teacher resource',
]
const isRoadmap = (problem) => roadmapPrefixes.some((prefix) => problem.startsWith(prefix))
const realGaps = backlog.filter(({ problem }) => !isRoadmap(problem))
const roadmap = backlog.filter(({ problem }) => isRoadmap(problem))

console.log('\n## Real gaps\n')
if (realGaps.length === 0) console.log('No immediate content gaps found.')
for (const { row, problem } of realGaps) console.log(`- **${md(row.title)}** (${md(row.gradeBand)}): ${md(problem)}`)

console.log('\n## Roadmap\n')
console.log('These are planned platform/content capabilities, not release-blocking unit defects.\n')
if (roadmap.length === 0) console.log('No roadmap gaps found.')
for (const { row, problem } of roadmap) console.log(`- **${md(row.title)}** (${md(row.gradeBand)}): ${md(problem)}`)

console.log('\n## Image brief\n')
console.log('Run `npm run images:shotlist` for the authoritative image-production manifest. The audit intentionally does not duplicate that brief.')

console.log('\n## Completion definition used by this audit\n')
console.log('- Lesson: at least one section and at least 250 instructional words.')
console.log('- Quiz: at least 8 questions.')
console.log('- Flashcards: at least 8 cards.')
console.log('- Standards: every referenced ID resolves and is marked verified.')
console.log('- Visuals: at least one lesson diagram; use `npm run images:shotlist` for the full image brief.')
console.log('- Embedded checks: at least one section-level check/question/activity marker.')
console.log('- Practical activity: at least one matching entry in `src/content/activities.json`.')
console.log('- Teacher resource: at least one item in teacherResources, resources, or teacher.')
