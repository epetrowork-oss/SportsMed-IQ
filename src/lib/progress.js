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
  readSeconds: 0, // accumulated time on the lesson page while visible
  scrollPct: 0, // deepest point of the lesson ever seen, 0-100
  touchedAt: 0, // Date.now() of the last mutation, for "continue where you left off"
})

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return {
      name: parsed.name ?? '',
      units: parsed.units ?? {},
      // Teacher-issued class codes imported on this device. Deliberately NOT
      // part of the student progress-code export (share.js) — assignments
      // don't follow a student between devices, only their unit progress does.
      assignments: Array.isArray(parsed.assignments) ? parsed.assignments : [],
    }
  } catch {
    // Corrupt or unavailable storage: start fresh rather than crash.
    return { name: '', units: {}, assignments: [] }
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
    units: { ...state.units, [unitId]: { ...current, ...patch, touchedAt: Date.now() } },
  })
}

// --- mutations ---

export function markLessonRead(unitId) {
  updateUnit(unitId, { lessonRead: true })
}

export function markFlashcardsReviewed(unitId) {
  updateUnit(unitId, { flashcardsReviewed: true })
}

// Called periodically by the lesson page while it is open and visible.
// Deltas are capped by the caller; stored as whole seconds.
export function addReadingTime(unitId, seconds) {
  if (!(seconds > 0)) return
  const current = getUnitProgress(unitId)
  updateUnit(unitId, { readSeconds: Math.round(current.readSeconds + seconds) })
}

// High-water mark of how far down the lesson the student has scrolled.
export function recordScrollDepth(unitId, pct) {
  const clamped = Math.min(100, Math.max(0, Math.round(pct)))
  const current = getUnitProgress(unitId)
  if (clamped > current.scrollPct) updateUnit(unitId, { scrollPct: clamped })
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
  save({ ...state, units: {} })
}

export function setStudentName(name) {
  save({ ...state, name: name.trim().slice(0, 60) })
}

// Merge imported progress into this device's progress, keeping the best of
// both for every unit (booleans OR, scores/attempts max). Used when a student
// loads their code on a second device that may already have some progress.
export function mergeProgress(name, importedUnits) {
  const merged = { ...state.units }
  for (const [unitId, imp] of Object.entries(importedUnits)) {
    const cur = merged[unitId] ?? emptyUnit()
    merged[unitId] = {
      lessonRead: cur.lessonRead || !!imp.lessonRead,
      flashcardsReviewed: cur.flashcardsReviewed || !!imp.flashcardsReviewed,
      bestQuizScore:
        imp.bestQuizScore == null && cur.bestQuizScore == null
          ? null
          : Math.max(cur.bestQuizScore ?? 0, imp.bestQuizScore ?? 0),
      quizAttempts: Math.max(cur.quizAttempts, imp.quizAttempts ?? 0),
      // Max, not sum: re-importing the same code twice must not double-count.
      readSeconds: Math.max(cur.readSeconds ?? 0, imp.readSeconds ?? 0),
      scrollPct: Math.max(cur.scrollPct ?? 0, imp.scrollPct ?? 0),
    }
  }
  save({ ...state, name: state.name || name, units: merged })
}

// --- assignments (teacher-issued class codes, imported on this device) ---

// Upsert keyed by case-insensitive trimmed name: re-importing the same name
// replaces the existing entry in place (array order preserved) rather than
// adding a duplicate.
export function importAssignment(assignment) {
  const key = assignment.name.trim().toLowerCase()
  const existingIndex = state.assignments.findIndex((a) => a.name.trim().toLowerCase() === key)
  const assignments = [...state.assignments]
  if (existingIndex >= 0) {
    assignments[existingIndex] = assignment
  } else {
    assignments.push(assignment)
  }
  save({ ...state, assignments })
}

export function removeAssignment(name) {
  const key = name.trim().toLowerCase()
  save({ ...state, assignments: state.assignments.filter((a) => a.name.trim().toLowerCase() !== key) })
}

// --- reads ---

export function getUnitProgress(unitId) {
  // Spread over defaults so records saved by older app versions
  // (before readSeconds existed) still have every field.
  return { ...emptyUnit(), ...(state.units[unitId] ?? {}) }
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

export function useAssignments() {
  return useSyncExternalStore(subscribe, () => state.assignments)
}
