// Teacher roster: real students added by pasting their progress codes.
// Stored on the teacher's device in localStorage, same simple store pattern
// as progress.js. Re-importing a code for the same student name updates
// that student's row.

import { useSyncExternalStore } from 'react'
import { decodeProgressCode } from './share.js'

const STORAGE_KEY = 'sportmediq:roster:v1'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return { students: Array.isArray(parsed.students) ? parsed.students : [] }
  } catch {
    return { students: [] }
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

function hasGamificationData(value) {
  if (!value || typeof value !== 'object') return false
  return (Array.isArray(value.activeDates) && value.activeDates.length > 0)
    || (Array.isArray(value.seenBadgeIds) && value.seenBadgeIds.length > 0)
    || (value.practicals && typeof value.practicals === 'object' && Object.keys(value.practicals).length > 0)
}

// Decodes the code and upserts the student. Codes exported under a class
// login carry the student ID + class ID, so those match by sid (a student
// whose login name the teacher renames still lands on the same row);
// everything else falls back to the old case-insensitive name match.
// Throws a user-readable error for bad codes or missing names.
export async function addStudentFromCode(code) {
  const { name, units, gamification, at, sid, cid } = await decodeProgressCode(code)
  if (!name) {
    throw new Error(
      'This code has no student name — ask the student to enter their name on the Sync page first.',
    )
  }
  // Resolved against fresh state inside the commit: decoding above is async,
  // and another tab may have added or removed a student meanwhile — writing
  // this tab's whole array back would erase them.
  let student = null
  commit((cur) => {
    // Match by student ID when the code carries one, and DO NOT fall back to
    // the name in that case: two students called "Alex" in different classes
    // are different people, and matching them by name would make the second
    // import overwrite the first one's row and progress. The name fallback
    // exists only for legacy codes, which have no ids to match on.
    const existing = sid
      ? cur.students.find((s) => s.sid === sid && (!cid || !s.cid || s.cid === cid))
      : cur.students.find((s) => s.name.toLowerCase() === name.toLowerCase() && !s.sid)
    student = {
      id: existing?.id ?? `stu-${Date.now().toString(36)}`,
      name,
      sid: sid ?? existing?.sid ?? null,
      cid: cid ?? existing?.cid ?? null,
      progress: units,
      // Legacy codes decode to an empty gamification shape. Do not let that
      // erase richer data already stored for the same student on this device.
      gamification: hasGamificationData(gamification)
        ? gamification
        : existing?.gamification ?? gamification,
      updatedAt: at ?? Date.now(),
    }
    return {
      students: [...cur.students.filter((s) => s.id !== student.id), student].sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    }
  })
  return student
}

export function removeStudent(id) {
  commit((cur) => ({ students: cur.students.filter((s) => s.id !== id) }))
}

// Two Teacher tabs on one device must not fight over this store. Without
// this, the second tab keeps a stale module-local snapshot and its next write
// persists that whole stale array — silently erasing the imported student roster
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
export function clearRoster() {
  save({ students: [] })
}

function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function useRoster() {
  return useSyncExternalStore(subscribe, () => state)
}
