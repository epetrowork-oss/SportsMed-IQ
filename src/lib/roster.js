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
  const existing =
    (sid && state.students.find((s) => s.sid === sid && (!cid || !s.cid || s.cid === cid))) ??
    state.students.find((s) => s.name.toLowerCase() === name.toLowerCase())
  const student = {
    id: existing?.id ?? `stu-${Date.now().toString(36)}`,
    name,
    sid: sid ?? existing?.sid ?? null,
    cid: cid ?? existing?.cid ?? null,
    progress: units,
    // Legacy codes decode to an empty gamification shape. Do not let that
    // erase richer data already stored for the same student on this device.
    gamification: hasGamificationData(gamification) ? gamification : existing?.gamification ?? gamification,
    updatedAt: at ?? Date.now(),
  }
  save({
    students: [...state.students.filter((s) => s.id !== student.id), student].sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
  })
  return student
}

export function removeStudent(id) {
  save({ students: state.students.filter((s) => s.id !== id) })
}

function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function useRoster() {
  return useSyncExternalStore(subscribe, () => state)
}
