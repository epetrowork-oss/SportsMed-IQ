import { PASS_THRESHOLD } from './progress.js'

export const LEVELS = [
  { level: 1, name: 'Observer', minXp: 0, nextXp: 100 },
  { level: 2, name: 'Responder', minXp: 100, nextXp: 250 },
  { level: 3, name: 'Prepared Teammate', minXp: 250, nextXp: 450 },
  { level: 4, name: 'Safety Leader', minXp: 450, nextXp: 700 },
  { level: 5, name: 'Sports Medicine Scholar', minXp: 700, nextXp: 1000 },
  { level: 6, name: 'Program Mentor', minXp: 1000, nextXp: null },
]

export const BADGES = [
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Complete one full unit.',
    earned: ({ completedUnits }) => completedUnits.length >= 1,
  },
  {
    id: 'quiz-comeback',
    name: 'Quiz Comeback',
    description: 'Improve a quiz score by at least 20 percentage points.',
    earned: ({ unitProgress }) => Object.values(unitProgress).some((p) => (p.quizImprovementMax ?? 0) >= 0.2),
  },
  {
    id: 'concussion-aware',
    name: 'Concussion Aware',
    description: 'Complete a concussion unit, pass its quiz, and review its flashcards.',
    earned: ({ unitsById, unitProgress }) => Object.entries(unitProgress).some(([unitId, p]) => {
      const unit = unitsById.get(unitId)
      return unit?.strand === 'concussion' && p.lessonRead && p.flashcardsReviewed && (p.bestQuizScore ?? 0) >= PASS_THRESHOLD
    }),
  },
  {
    id: 'consistent-learner',
    name: 'Consistent Learner',
    description: 'Build a three-day learning streak.',
    earned: ({ longestStreak }) => longestStreak >= 3,
  },
  {
    id: 'week-of-practice',
    name: 'Week of Practice',
    description: 'Learn on seven distinct days.',
    earned: ({ activeDates }) => activeDates.length >= 7,
  },
  {
    id: 'perfect-review',
    name: 'Perfect Review',
    description: 'Earn 100% on a quiz.',
    earned: ({ unitProgress }) => Object.values(unitProgress).some((p) => (p.bestQuizScore ?? 0) >= 1),
  },
]

function parseLocalDateKey(key) {
  if (typeof key !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(key)) return null
  const [year, month, day] = key.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null
  return date
}

function dayDifference(laterKey, earlierKey) {
  const later = parseLocalDateKey(laterKey)
  const earlier = parseLocalDateKey(earlierKey)
  if (!later || !earlier) return null
  const laterUtc = Date.UTC(later.getFullYear(), later.getMonth(), later.getDate())
  const earlierUtc = Date.UTC(earlier.getFullYear(), earlier.getMonth(), earlier.getDate())
  return Math.round((laterUtc - earlierUtc) / 86400000)
}

export function normalizeActiveDates(value) {
  return [...new Set((Array.isArray(value) ? value : []).filter((key) => parseLocalDateKey(key)))].sort()
}

export function calculateStreaks(activeDates, todayKey) {
  const dates = normalizeActiveDates(activeDates)
  let longestStreak = 0
  let run = 0
  let previous = null

  for (const key of dates) {
    const gap = previous ? dayDifference(key, previous) : null
    run = previous && gap === 1 ? run + 1 : 1
    longestStreak = Math.max(longestStreak, run)
    previous = key
  }

  const lastActiveDate = dates.at(-1) ?? null
  const gapFromToday = lastActiveDate && todayKey ? dayDifference(todayKey, lastActiveDate) : null
  let currentStreak = 0
  if (lastActiveDate && (gapFromToday === 0 || gapFromToday === 1)) {
    currentStreak = 1
    for (let index = dates.length - 1; index > 0; index -= 1) {
      if (dayDifference(dates[index], dates[index - 1]) !== 1) break
      currentStreak += 1
    }
  }

  return { currentStreak, longestStreak, lastActiveDate }
}

export function calculateXp(unitProgress, activeDates = [], practicals = {}) {
  let xp = normalizeActiveDates(activeDates).length * 5

  for (const p of Object.values(unitProgress ?? {})) {
    if (p.lessonRead) xp += 10
    if ((p.quizAttempts ?? 0) > 0) xp += 5
    if ((p.bestQuizScore ?? 0) >= PASS_THRESHOLD) xp += 20
    if ((p.bestQuizScore ?? 0) >= 0.9) xp += 10
    if (p.flashcardsReviewed) xp += 10
    if (p.lessonRead && p.flashcardsReviewed && (p.bestQuizScore ?? 0) >= PASS_THRESHOLD) xp += 25
  }

  for (const practical of Object.values(practicals ?? {})) {
    if (practical.reflectionCompleted) xp += 10
    if (practical.teacherVerified) xp += 25
  }

  return xp
}

export function getLevelForXp(xp) {
  const safeXp = Number.isFinite(xp) && xp > 0 ? Math.floor(xp) : 0
  return [...LEVELS].reverse().find((level) => safeXp >= level.minXp) ?? LEVELS[0]
}

export function getGamificationSummary(progressState, units, todayKey) {
  const unitProgress = progressState?.units ?? {}
  const activeDates = normalizeActiveDates(progressState?.gamification?.activeDates)
  const practicals = progressState?.gamification?.practicals ?? {}
  const unitsById = new Map((units ?? []).map((unit) => [unit.id, unit]))
  const completedUnits = Object.entries(unitProgress)
    .filter(([, p]) => p.lessonRead && p.flashcardsReviewed && (p.bestQuizScore ?? 0) >= PASS_THRESHOLD)
    .map(([unitId]) => unitId)
  const streaks = calculateStreaks(activeDates, todayKey)
  const xp = calculateXp(unitProgress, activeDates, practicals)
  const level = getLevelForXp(xp)
  const context = {
    unitProgress,
    unitsById,
    completedUnits,
    activeDates,
    practicals,
    ...streaks,
  }
  const badges = BADGES.map((badge) => ({ ...badge, isEarned: badge.earned(context) }))

  return {
    xp,
    level,
    nextLevelXp: level.nextXp,
    xpIntoLevel: xp - level.minXp,
    xpNeededForLevel: level.nextXp == null ? null : level.nextXp - level.minXp,
    earnedBadges: badges.filter((badge) => badge.isEarned),
    badges,
    activeDates,
    completedUnits,
    ...streaks,
  }
}
