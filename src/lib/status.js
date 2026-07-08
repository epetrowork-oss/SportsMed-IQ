// Shared status vocabulary: completion/flag rules and the icon + label pairs
// ("✓ Complete" / "● In progress" / "○ Not started" / "⚠ flag") used
// wherever progress status is shown across the app (teacher dashboard, home
// unit cards, unit page, quiz results).

import { PASS_THRESHOLD } from './progress.js'

// Same completion rule as the student side.
export function isComplete(p) {
  return (
    !!p &&
    p.lessonRead &&
    p.flashcardsReviewed &&
    (p.bestQuizScore ?? 0) >= PASS_THRESHOLD
  )
}

// A lesson marked read with under 2 minutes on the page — or without seeing
// at least 80% of it — gets flagged as a likely click-through.
export const LOW_READ_SECONDS = 120
export const LOW_SCROLL_PCT = 80

export function isFlagged(p) {
  return !!p?.lessonRead && ((p.readSeconds ?? 0) < LOW_READ_SECONDS || (p.scrollPct ?? 0) < LOW_SCROLL_PCT)
}

// Same flag logic as isFlagged, but spelled out as human-readable reasons
// for the lesson detail panel.
export function flagReasons(p) {
  if (!p?.lessonRead) return []
  const readSeconds = p.readSeconds ?? 0
  const scrollPct = p.scrollPct ?? 0
  const reasons = []
  if (readSeconds < LOW_READ_SECONDS) reasons.push('marked read with under 2 minutes on the page')
  if (scrollPct < LOW_SCROLL_PCT) reasons.push(`marked read having seen only ${scrollPct}% of it`)
  return reasons
}

// min:sec for the detail panel.
export function formatMinSec(seconds) {
  const total = Math.max(0, Math.round(seconds ?? 0))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function statusInfo(p) {
  const started = !!p && (p.lessonRead || p.quizAttempts || p.flashcardsReviewed || p.readSeconds)
  if (isComplete(p)) return { key: 'done', label: 'Complete', icon: '✓' }
  if (started) return { key: 'progress', label: 'In progress', icon: '●' }
  return { key: 'none', label: 'Not started', icon: '○' }
}
