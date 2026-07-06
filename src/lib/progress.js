// Student progress store: one plain object persisted to localStorage,
// exposed to React through useSyncExternalStore. No reducers, no context
// pyramid — read state with useProgress(), change it with the exported
// mutation functions.

import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'sportmediq:progress:v1'
export const PASS_THRESHOLD = 0.7 // quiz score needed to count as passed

const emptyUnit = () => ({
  lessonRead: false,
  flashcardsReviewed: false,
  bestQuizScore: null, // 0..1, best across attempts
  quizAttempts: 0,
})

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { units: {} }
  } catch {
    // Corrupt or unavailable storage: start fresh rather than crash.
    return { units: {} }
  }
}

let state = load()
const listeners = new Set()

function save(next) {
  state = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage full or blocked — keep working in memory.
  }
  listeners.forEach((fn) => fn())
}

function updateUnit(unitId, patch) {
  const current = state.units[unitId] ?? emptyUnit()
  save({
    ...state,
    units: { ...state.units, [unitId]: { ...current, ...patch } },
  })
}

// --- mutations ---

export function markLessonRead(unitId) {
  updateUnit(unitId, { lessonRead: true })
}

export function markFlashcardsReviewed(unitId) {
  updateUnit(unitId, { flashcardsReviewed: true })
}

export function recordQuizResult(unitId, correct, total) {
  const score = total > 0 ? correct / total : 0
  const current = state.units[unitId] ?? emptyUnit()
  updateUnit(unitId, {
    quizAttempts: current.quizAttempts + 1,
    bestQuizScore: Math.max(current.bestQuizScore ?? 0, score),
  })
}

export function resetAllProgress() {
  save({ units: {} })
}

// --- reads ---

export function getUnitProgress(unitId) {
  return state.units[unitId] ?? emptyUnit()
}

export function isUnitComplete(unitId) {
  const p = getUnitProgress(unitId)
  return p.lessonRead && p.flashcardsReviewed && (p.bestQuizScore ?? 0) >= PASS_THRESHOLD
}

// --- React binding ---

function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function useProgress() {
  return useSyncExternalStore(subscribe, () => state)
}
