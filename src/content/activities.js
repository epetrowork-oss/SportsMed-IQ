import catalog from './activities.json'

const VALID_BANDS = new Set(['7-8', '9-10', '11-12'])

function validateActivity(activity, index) {
  const problems = []
  if (!activity?.id || !/^[a-z0-9-]+$/.test(activity.id)) problems.push('invalid id')
  if (!activity?.title) problems.push('missing title')
  if (!Array.isArray(activity?.targetStrands) || activity.targetStrands.length === 0)
    problems.push('missing targetStrands')
  if (!Array.isArray(activity?.gradeBands) || activity.gradeBands.some((band) => !VALID_BANDS.has(band)))
    problems.push('invalid gradeBands')
  if (!Number.isFinite(activity?.estimatedMinutes) || activity.estimatedMinutes <= 0)
    problems.push('invalid estimatedMinutes')
  if (typeof activity?.completionMethod !== 'string' || !activity.completionMethod.trim())
    problems.push('missing completionMethod')
  if (!Array.isArray(activity?.instructions) || activity.instructions.length === 0)
    problems.push('missing instructions')
  if (!Array.isArray(activity?.checklist) || activity.checklist.length === 0)
    problems.push('missing checklist')
  if (!Array.isArray(activity?.rubric) || activity.rubric.length === 0)
    problems.push('missing rubric')

  if (problems.length > 0) {
    console.error(`SportMedIQ: skipping malformed practical activity at index ${index}: ${problems.join('; ')}`)
    return false
  }
  return true
}

const activities = (catalog.activities ?? []).filter(validateActivity)

export function getActivitiesForUnit(unit) {
  if (!unit) return []
  return activities.filter((activity) => {
    const targetMatch = activity.targetStrands.includes(unit.strand) || activity.targetStrands.includes(unit.id)
    const gradeMatch = activity.gradeBands.length === 0 || activity.gradeBands.includes(unit.gradeBand)
    return targetMatch && gradeMatch
  })
}
