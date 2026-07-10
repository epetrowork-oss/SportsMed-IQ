import catalog from './activities.json'

export function getActivitiesForUnit(unit) {
  if (!unit) return []
  return (catalog.activities ?? []).filter((activity) => {
    const targets = activity.targetStrands ?? []
    const grades = activity.gradeBands ?? []
    const targetMatch = targets.includes(unit.strand) || targets.includes(unit.id)
    const gradeMatch = grades.length === 0 || grades.includes(unit.gradeBand)
    return targetMatch && gradeMatch
  })
}
