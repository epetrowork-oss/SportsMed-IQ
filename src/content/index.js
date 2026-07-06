// Content loader: every JSON file in ./units becomes a unit in the app.
// Content is bundled at build time, so it is always available offline.

const modules = import.meta.glob('./units/*.json', { eager: true })

function validateUnit(unit, path) {
  const problems = []
  if (!unit.id || !/^[a-z0-9-]+$/.test(unit.id)) problems.push('missing or invalid "id"')
  if (!unit.title) problems.push('missing "title"')
  if (!Array.isArray(unit.sections) || unit.sections.length === 0)
    problems.push('missing "sections"')
  if (!Array.isArray(unit.quiz)) problems.push('missing "quiz"')
  else
    unit.quiz.forEach((q, i) => {
      if (!Array.isArray(q.choices) || q.choices.length < 2)
        problems.push(`quiz[${i}] needs at least 2 choices`)
      if (
        !Number.isInteger(q.answerIndex) ||
        q.answerIndex < 0 ||
        q.answerIndex >= (q.choices?.length ?? 0)
      )
        problems.push(`quiz[${i}] has an invalid answerIndex`)
    })
  if (!Array.isArray(unit.flashcards)) problems.push('missing "flashcards"')

  if (problems.length > 0) {
    console.error(`SportMedIQ: skipping malformed unit ${path}: ${problems.join('; ')}`)
    return false
  }
  return true
}

const units = Object.entries(modules)
  .map(([path, mod]) => ({ path, unit: mod.default ?? mod }))
  .filter(({ path, unit }) => validateUnit(unit, path))
  .map(({ unit }) => unit)
  .sort((a, b) => a.title.localeCompare(b.title))

export function getAllUnits() {
  return units
}

export function getUnit(id) {
  return units.find((u) => u.id === id) ?? null
}

// Units grouped by category, preserving alphabetical order within each group.
export function getUnitsByCategory() {
  const groups = new Map()
  for (const unit of units) {
    const key = unit.category ?? 'General'
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(unit)
  }
  return [...groups.entries()].map(([category, list]) => ({ category, units: list }))
}
