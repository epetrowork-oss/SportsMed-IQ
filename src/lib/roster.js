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

// Decodes the code and upserts the student (matched case-insensitively by
// name). Throws a user-readable error for bad codes or missing names.
export async function addStudentFromCode(code) {
  const { name, units, gamification, at } = await decodeProgressCode(code)
  if (!name) {
    throw new Error(
      'This code has no student name — ask the student to enter their name on the Sync page first.',
    )
  }
  const existing = state.students.find((s) => s.name.toLowerCase() === name.toLowerCase())
  const student = {
    id: existing?.id ?? `stu-${Date.now().toString(36)}`,
    name,
    progress: units,
    gamification: gamification ?? existing?.gamification ?? null,
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
