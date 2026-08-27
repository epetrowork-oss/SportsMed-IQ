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

// Every write goes through this, and `updater` receives state re-read from
// localStorage — never a snapshot captured before an await. Between a read and
// a write another tab can complete a change this tab has not seen yet
// (`storage` events are asynchronous), and spreading the old snapshot would
// silently revert it. The updater may throw to abort.
function commit(updater) {
  const next = updater(load())
  save(next)
  return next
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

  // Merged into fresh state: encodeAssignment above is async, so another tab
  // may have saved or removed an assignment that this tab has not seen.
  const key = entry.name.toLowerCase()
  commit((cur) => {
    const existingIndex = cur.assignments.findIndex((a) => a.name.trim().toLowerCase() === key)
    const assignments = [...cur.assignments]
    if (existingIndex >= 0) assignments[existingIndex] = entry
    else assignments.push(entry)
    return { assignments }
  })
  return entry
}

export function removeTeacherAssignment(name) {
  const key = name.trim().toLowerCase()
  commit((cur) => ({
    assignments: cur.assignments.filter((a) => a.name.trim().toLowerCase() !== key),
  }))
}

// Two Teacher tabs on one device must not fight over this store. Without
// this, the second tab keeps a stale module-local snapshot and its next write
// persists that whole stale array — silently erasing saved assignments
// saved from the first tab. `storage` fires only in other tabs.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === null || event.key === STORAGE_KEY) {
      state = load()
      listeners.forEach((fn) => fn())
    }
  })
}

// Wipes this store. Used when a teacher releases the device: their data must
// not outlive the credential that protected it.
export function clearTeacherAssignments() {
  save({ assignments: [] })
}

function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function useTeacherAssignments() {
  return useSyncExternalStore(subscribe, () => state.assignments)
}
