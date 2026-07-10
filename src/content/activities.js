import catalog from './activities.json'

const unitModules = import.meta.glob('./units/*.json', { eager: true })
const knownStrands = new Set(
  Object.values(unitModules)
    .map((mod) => (mod.default ?? mod)?.strand)
    .filter((strand) => typeof strand === 'string' && strand.trim()),
)
const VALID_BANDS = new Set(['7-8', '9-10', '11-12'])

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function hasOnlyNonEmptyStrings(value) {
  return Array.isArray(value) && value.every(isNonEmptyString)
}

function duplicateValues(values) {
  if (!Array.isArray(values)) return []
  const seen = new Set()
  return [...new Set(values.filter((value) => seen.size === seen.add(value).size))]
}

function validateActivity(activity, index, seenIds) {
  const problems = []
  const label = activity?.id || `index ${index}`

  if (!activity?.id || !/^[a-z0-9-]+$/.test(activity.id)) problems.push('invalid id')
  else if (seenIds.has(activity.id)) problems.push(`duplicate id "${activity.id}"`)
  else seenIds.add(activity.id)

  if (!isNonEmptyString(activity?.title)) problems.push('missing title')

  if (!hasOnlyNonEmptyStrings(activity?.targetStrands) || activity.targetStrands.length === 0) {
    problems.push('missing or invalid targetStrands')
  } else {
    const unknown = activity.targetStrands.filter((strand) => !knownStrands.has(strand))
    if (unknown.length > 0) problems.push(`unknown targetStrands: ${unknown.join(', ')}`)
    const duplicates = duplicateValues(activity.targetStrands)
    if (duplicates.length > 0) problems.push(`duplicate targetStrands: ${duplicates.join(', ')}`)
  }

  if (!hasOnlyNonEmptyStrings(activity?.gradeBands) || activity.gradeBands.some((band) => !VALID_BANDS.has(band))) {
    problems.push('invalid gradeBands')
  } else {
    const duplicates = duplicateValues(activity.gradeBands)
    if (duplicates.length > 0) problems.push(`duplicate gradeBands: ${duplicates.join(', ')}`)
  }

  if (!Number.isFinite(activity?.estimatedMinutes) || activity.estimatedMinutes <= 0)
    problems.push('invalid estimatedMinutes')
  if (!isNonEmptyString(activity?.completionMethod)) problems.push('missing completionMethod')
  if ('teacherVerification' in (activity ?? {}) && typeof activity.teacherVerification !== 'boolean')
    problems.push('teacherVerification must be Boolean')

  for (const field of ['materials', 'safetyNotes']) {
    if (field in (activity ?? {}) && !hasOnlyNonEmptyStrings(activity[field]))
      problems.push(`${field} must contain only non-empty strings`)
  }

  if (!hasOnlyNonEmptyStrings(activity?.instructions) || activity.instructions.length === 0)
    problems.push('missing or invalid instructions')
  if (!hasOnlyNonEmptyStrings(activity?.checklist) || activity.checklist.length === 0)
    problems.push('missing or invalid checklist')

  if (!Array.isArray(activity?.rubric) || activity.rubric.length === 0) {
    problems.push('missing rubric')
  } else {
    activity.rubric.forEach((row, rubricIndex) => {
      if (!isNonEmptyString(row?.criterion) || !isNonEmptyString(row?.proficient))
        problems.push(`rubric[${rubricIndex}] needs criterion and proficient`)
    })
  }

  if ('writtenResponse' in (activity ?? {}) && !isNonEmptyString(activity.writtenResponse))
    problems.push('writtenResponse must be a non-empty string')

  if (problems.length > 0) {
    console.error(`SportMedIQ: skipping malformed practical activity ${label}: ${problems.join('; ')}`)
    return false
  }
  return true
}

const seenIds = new Set()
const activities = (Array.isArray(catalog.activities) ? catalog.activities : []).filter((activity, index) =>
  validateActivity(activity, index, seenIds),
)

export function getActivitiesForUnit(unit) {
  if (!unit) return []
  return activities.filter((activity) => {
    const targetMatch = activity.targetStrands.includes(unit.strand) || activity.targetStrands.includes(unit.id)
    const gradeMatch = activity.gradeBands.length === 0 || activity.gradeBands.includes(unit.gradeBand)
    return targetMatch && gradeMatch
  })
}
