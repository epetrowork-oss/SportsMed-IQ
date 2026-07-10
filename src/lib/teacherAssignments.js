// Teacher-built assignments ("class codes"): built and generated on the
// teacher's own device. Stored locally so the generated code can be
// re-copied later without re-encoding it. Same simple store pattern as
// roster.js (plain module state + localStorage + useSyncExternalStore).

import { useSyncExternalStore } from 'react'
import { encodeAssignment } from './assignments.js'

const STORAGE_KEY = 'sportmediq:teacherAssignments:v1'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return { assignments: Array.isArray(parsed.assignments) ? parsed.assignments : [] }
  } catch {
    return { assignments: [] }
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

// Encodes {name, unitIds, mode, due?} into a class code (letting
// encodeAssignment's validation errors propagate — they already have
// friendly messages) and upserts the saved entry keyed by case-insensitive
// trimmed name: re-saving the same name replaces the existing entry in
// place (array order preserved) rather than adding a duplicate — same
// semantics as importAssignment in progress.js. Returns the saved entry,
// which also carries the generated `code` so it can be re-copied later
// without re-encoding.
export async function saveTeacherAssignment({ name, unitIds, mode, due }) {
  const createdAt = new Date().toISOString()
  const toEncode = { name, unitIds, mode, createdAt }
  if (due) toEncode.due = due

  const code = await encodeAssignment(toEncode)

  const entry = {
    name: typeof name === 'string' ? name.trim().slice(0, 60) : '',
    unitIds,
    mode,
    createdAt,
    code,
  }
  if (due) entry.due = due

  const key = entry.name.toLowerCase()
  const existingIndex = state.assignments.findIndex((a) => a.name.trim().toLowerCase() === key)
  const assignments = [...state.assignments]
  if (existingIndex >= 0) {
    assignments[existingIndex] = entry
  } else {
    assignments.push(entry)
  }
  save({ assignments })
  return entry
}

export function removeTeacherAssignment(name) {
  const key = name.trim().toLowerCase()
  save({ assignments: state.assignments.filter((a) => a.name.trim().toLowerCase() !== key) })
}

function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function useTeacherAssignments() {
  return useSyncExternalStore(subscribe, () => state.assignments)
}
