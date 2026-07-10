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
const gamificationPath = path.join(rootDir, 'src/lib/gamification.js')

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
let activityCatalogError = null
try {
  activityCatalog = JSON.parse(await readFile(activitiesPath, 'utf8'))
} catch (error) {
  activityCatalogError = error.message
}
const activities = Array.isArray(activityCatalog.activities) ? activityCatalog.activities : []

let gamificationSource = ''
try {
  gamificationSource = await readFile(gamificationPath, 'utf8')
} catch {
  // Gamification remains optional; the roadmap report will show no badge coverage.
}

const md = (value) => String(value ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ')
const status = (complete, partial = false) => (complete ? 'Complete' : partial ? 'Needs review' : 'Missing')
const nonEmptyStrings = (value) =>
  Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === 'string' && item.trim())

function wordCount(unit) {
  return (unit.sections ?? []).reduce((total, section) => {
    const text = [...(section.body ?? []), ...(section.list ?? []), section.callout?.text ?? ''].join(' ')
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

const validUnits = records.map((record) => record.unit).filter(Boolean)
const knownStrands = new Set(validUnits.map((unit) => unit.strand).filter(Boolean))
const knownActivityTargets = new Set(
  validUnits.flatMap((unit) => [unit.strand, unit.id]).filter((target) => typeof target === 'string' && target),
)
const badgeStrands = new Set()
for (const arrayMatch of gamificationSource.matchAll(/targetStrands:\s*\[([^\]]*)\]/g)) {
  for (const stringMatch of arrayMatch[1].matchAll(/['"]([^'"]+)['"]/g)) badgeStrands.add(stringMatch[1])
}

function matchingActivities(unit) {
  return activities.filter((activity) => {
    const targets = Array.isArray(activity.targetStrands) ? activity.targetStrands : []
    const bands = Array.isArray(activity.gradeBands) ? activity.gradeBands : []
    return (
      (targets.includes(unit.strand) || targets.includes(unit.id)) &&
      (bands.length === 0 || bands.includes(unit.gradeBand))
    )
  })
}

function firstArray(unit, keys) {
  for (const key of keys) if (Array.isArray(unit[key])) return unit[key]
  return []
}

const activityErrors = []
const activityIds = new Set()
for (const [index, activity] of activities.entries()) {
  const label = activity?.id || `index ${index}`
  if (!activity?.id || typeof activity.id !== 'string') activityErrors.push(`${label}: missing or invalid id`)
  else if (activityIds.has(activity.id)) activityErrors.push(`${label}: duplicate activity id`)
  else activityIds.add(activity.id)

  if (!nonEmptyStrings(activity?.targetStrands)) {
    activityErrors.push(`${label}: missing or invalid targetStrands`)
  } else {
    const unknown = activity.targetStrands.filter((target) => !knownActivityTargets.has(target))
    if (unknown.length) activityErrors.push(`${label}: unknown activity targets ${unknown.join(', ')}`)
    if (new Set(activity.targetStrands).size !== activity.targetStrands.length)
      activityErrors.push(`${label}: duplicate target strands`)
  }
  if (!Array.isArray(activity?.gradeBands)) activityErrors.push(`${label}: invalid gradeBands`)
  else if (new Set(activity.gradeBands).size !== activity.gradeBands.length)
    activityErrors.push(`${label}: duplicate grade bands`)
  if (!nonEmptyStrings(activity?.instructions)) activityErrors.push(`${label}: missing instructions`)
  if (!nonEmptyStrings(activity?.checklist)) activityErrors.push(`${label}: missing checklist`)
  if (!Array.isArray(activity?.rubric) || activity.rubric.some((row) => !row?.criterion || !row?.proficient))
    activityErrors.push(`${label}: invalid rubric`)
}
if (activityCatalogError) activityErrors.unshift(`activities.json: ${activityCatalogError}`)

function audit(record) {
  if (!record.unit) {
    return {
      file: record.file,
      title: `Malformed JSON (${record.file})`,
      malformed: true,
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
      safePracticals: 0,
      reflections: 0,
      teacherVerifiedPracticals: 0,
      badgeReady: false,
      xpReady: false,
      teacherResources: 0,
      problems: [`JSON parse error in ${record.file}: ${record.parseError}`],
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

  if (!unit.title) problems.push('Missing title')
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
  if (resources.length === 0) problems.push('No teacher resource')

  return {
    file: record.file,
    title: unit.title || record.file,
    malformed: false,
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
    safePracticals: practicals.filter((activity) => nonEmptyStrings(activity.safetyNotes)).length,
    reflections: practicals.filter(
      (activity) => typeof activity.writtenResponse === 'string' && activity.writtenResponse.trim(),
    ).length,
    teacherVerifiedPracticals: practicals.filter((activity) => activity.teacherVerification === true).length,
    badgeReady: badgeStrands.has(unit.strand),
    xpReady: (unit.sections?.length ?? 0) > 0 && (unit.quiz?.length ?? 0) > 0 && (unit.flashcards?.length ?? 0) > 0,
    teacherResources: resources.length,
    problems,
  }
}

const audited = records.map(audit)
const validRows = audited.filter((row) => !row.malformed)
const categories = [...new Set(validRows.map((row) => row.category).filter(Boolean))].sort()
const strands = [...new Set(validRows.map((row) => row.strand).filter(Boolean))].sort()

console.log('# Subject Content Completeness Audit\n')
console.log(`Generated from ${files.length} unit JSON files and ${activities.length} practical activities.\n`)
console.log('## Coverage summary\n')
console.log(`- Units: ${validRows.length}`)
console.log(`- Grade bands: ${[...new Set(validRows.map((row) => row.gradeBand).filter(Boolean))].sort().join(', ') || 'None'}`)
console.log(`- Categories: ${categories.length}`)
console.log(`- Strands: ${strands.length}`)
console.log(`- Quiz questions: ${validRows.reduce((sum, row) => sum + row.quiz, 0)}`)
console.log(`- Flashcards: ${validRows.reduce((sum, row) => sum + row.flashcards, 0)}`)
console.log(`- Lesson diagrams declared: ${validRows.reduce((sum, row) => sum + row.diagrams, 0)}`)
console.log(`- Practical activity matches: ${validRows.reduce((sum, row) => sum + row.practicals, 0)}`)
console.log(`- Strand-specific badge coverage: ${strands.filter((strand) => badgeStrands.has(strand)).length}/${strands.length}\n`)

console.log('## Unit-by-unit audit\n')
console.log('| Unit | Grade | Lesson | Quiz | Flashcards | Standards | Practical | Safety | Reflection | Teacher verify | Badge | XP ready |')
console.log('|---|---|---|---|---|---|---|---|---|---|---|---|')
for (const row of audited) {
  const lesson = status(row.sections > 0 && row.words >= 250, row.sections > 0)
  const standards = row.standards === 0
    ? 'Missing'
    : row.unresolvedStandards > 0 || row.verifiedStandards < row.standards
      ? `${row.verifiedStandards}/${row.standards} verified`
      : 'Verified'
  console.log(`| ${md(row.title)} | ${md(row.gradeBand)} | ${lesson} (${row.words}) | ${status(row.quiz >= 8, row.quiz > 0)} (${row.quiz}) | ${status(row.flashcards >= 8, row.flashcards > 0)} (${row.flashcards}) | ${standards} | ${row.practicals} | ${row.safePracticals}/${row.practicals} | ${row.reflections}/${row.practicals} | ${row.teacherVerifiedPracticals} | ${row.badgeReady ? 'Yes' : 'No'} | ${row.xpReady ? 'Yes' : 'No'} |`)
}

const priorities = [
  'JSON parse error',
  'Missing title',
  'No lesson sections',
  'Thin lesson content',
  'Short quiz',
  'Short flashcard set',
  'No standards tagged',
  'Unresolved standards',
  'No lesson diagrams',
]
const rank = (problem) => {
  const index = priorities.findIndex((prefix) => problem.startsWith(prefix))
  return index === -1 ? priorities.length : index
}
const backlog = audited.flatMap((row) => row.problems.map((problem) => ({ row, problem })))
backlog.sort(
  (a, b) => rank(a.problem) - rank(b.problem) || (a.row.title || a.row.file).localeCompare(b.row.title || b.row.file),
)
const roadmapPrefixes = ['Standards include draft/unverified entries', 'No embedded knowledge checks', 'No teacher resource']
const isRoadmap = (problem) => roadmapPrefixes.some((prefix) => problem.startsWith(prefix))
const realGaps = backlog.filter(({ problem }) => !isRoadmap(problem))
const roadmap = backlog.filter(({ problem }) => isRoadmap(problem))

console.log('\n## Real gaps\n')
if (!realGaps.length && !activityErrors.length) console.log('No immediate content or practical-catalog errors found.')
for (const error of activityErrors) console.log(`- **Practical catalog:** ${md(error)}`)
for (const { row, problem } of realGaps)
  console.log(`- **${md(row.title || row.file)}** (${md(row.gradeBand)}): ${md(problem)}`)

const strandsWithPractical = new Set(
  activities.flatMap((activity) => (Array.isArray(activity.targetStrands) ? activity.targetStrands : [])),
)
const strandsWithoutPractical = strands.filter((strand) => !strandsWithPractical.has(strand))
const strandsWithoutBadge = strands.filter((strand) => !badgeStrands.has(strand))
const activitiesWithoutSafety = activities.filter((activity) => !nonEmptyStrings(activity.safetyNotes))
const activitiesWithoutReflection = activities.filter(
  (activity) => !(typeof activity.writtenResponse === 'string' && activity.writtenResponse.trim()),
)
const teacherVerificationActivities = activities.filter((activity) => activity.teacherVerification === true)

console.log('\n## Roadmap\n')
console.log('These are planned platform/content capabilities, not release-blocking unit defects.\n')
for (const { row, problem } of roadmap)
  console.log(`- **${md(row.title || row.file)}** (${md(row.gradeBand)}): ${md(problem)}`)
console.log(`- ${strandsWithoutPractical.length} of ${strands.length} strands do not yet have a practical activity.`)
console.log(`- ${strandsWithoutBadge.length} of ${strands.length} strands do not yet have a strand-specific badge.`)
console.log(`- ${activitiesWithoutSafety.length} of ${activities.length} practical activities do not include safety notes.`)
console.log(`- ${activitiesWithoutReflection.length} of ${activities.length} practical activities do not include a written reflection.`)
console.log(`- ${teacherVerificationActivities.length} of ${activities.length} practical activities require teacher verification.`)

console.log('\n## Image brief\n')
console.log('Run `npm run images:shotlist` for the authoritative image-production manifest. The audit intentionally does not duplicate that brief.')

console.log('\n## Completion definition used by this audit\n')
console.log('- Lesson: at least one section and at least 250 instructional words.')
console.log('- Quiz: at least 8 questions; flashcards: at least 8 cards.')
console.log('- Standards: every referenced ID resolves and is marked verified.')
console.log('- Practical safety: every matching activity includes at least one safety note.')
console.log('- Practical reflection: a matching activity includes a non-empty writtenResponse.')
console.log('- Badge coverage: gamification.js declares the unit strand in badge targetStrands metadata.')
console.log('- XP readiness: lesson, quiz, and flashcards are all present so full-unit XP can be derived.')
