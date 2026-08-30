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
const COMMIT_ATTEMPTS = 5

function readRaw() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function commit(updater) {
  // Web Storage serializes each operation but not this read-modify-write pair,
  // so two tabs can both read before either writes and the later save would
  // drop the earlier one. There is no compare-and-set for localStorage; the
  // next best thing is to check that nothing landed between our read and our
  // write, and redo the update against the newer state if it did. That turns
  // the common interleaving into a retry instead of silent data loss. A truly
  // simultaneous write still resolves last-writer-wins — closing that needs
  // navigator.locks, which would make every mutation async; documented in
  // docs/ACCOUNTS.md rather than pretended away.
  for (let attempt = 0; ; attempt += 1) {
    const before = readRaw()
    const next = updater(load())
    if (readRaw() === before || attempt >= COMMIT_ATTEMPTS) {
      save(next)
      return next
    }
  }
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

// --- backup ---

// Union of persisted and in-memory entries -- see snapshotClasses in
// classes.js for why neither alone is safe. For an entry in both, the later
// `createdAt` wins (saving an assignment always stamps a fresh one).
export function snapshotTeacherAssignments() {
  const byName = new Map()
  const key = (entry) => entry.name.trim().toLowerCase()
  for (const entry of load().assignments) byName.set(key(entry), entry)
  for (const entry of state.assignments) {
    const stored = byName.get(key(entry))
    if (!stored || String(entry.createdAt ?? '') > String(stored.createdAt ?? '')) {
      byName.set(key(entry), entry)
    }
  }
  return [...byName.values()]
}

// Restores saved assignments, keyed by the same case-insensitive name
// saveTeacherAssignment uses. An entry this device already has is kept unless
// the backup's is newer. Returns { added, updated, persisted }.
export function mergeTeacherAssignments(incoming) {
  const list = Array.isArray(incoming) ? incoming.filter((a) => a && typeof a.name === 'string') : []
  let added = 0
  let updated = 0
  const key = (entry) => entry.name.trim().toLowerCase()
  const next = commit((cur) => {
    added = 0
    updated = 0
    const assignments = [...cur.assignments]
    for (const entry of list) {
      const at = assignments.findIndex((a) => key(a) === key(entry))
      if (at < 0) {
        assignments.push(entry)
        added += 1
      } else if (String(entry.createdAt ?? '') > String(assignments[at].createdAt ?? '')) {
        assignments[at] = entry
        updated += 1
      }
    }
    return { assignments }
  })
  // Contents, not just presence -- see mergeRoster.
  const stored = load().assignments
  const persisted = list.every((entry) => {
    const intended = next.assignments.find((a) => key(a) === key(entry))
    const got = stored.find((a) => key(a) === key(entry))
    return (
      !!intended &&
      !!got &&
      String(got.createdAt ?? '') >= String(intended.createdAt ?? '')
    )
  })
  return { added, updated, persisted }
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
