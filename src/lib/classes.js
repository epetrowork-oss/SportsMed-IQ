// Teacher-side classes: the teacher creates a class, adds students by a
// login name of their choosing (first names, nicknames, seat numbers —
// anonymity is the point), and the app generates each student a unique
// student ID and a short PIN (a friendly word + two digits, e.g. MAPLE42).
//
// The whole class is shared with students as ONE class login code
// ("SMIQC1." + base64url(deflate-raw(JSON)), same plumbing as share.js).
// The code carries the roster with *hashed* PINs plus the class's content
// controls, so a student device can verify a login and apply the teacher's
// settings completely offline. Plain PINs live only here, on the teacher's
// own device, so the credential sheet can be re-printed.
//
// Content controls per class (settings):
//   units:       null = whole library visible, or an array of unit ids the
//                teacher has opened up so far.
//   quizzes:     false hides/blocks quizzes until the teacher enables them.
//   assignments: false hides the assignment queue / class-code entry so
//                students aren't shown assignment machinery before it's used.
//
// Changing students or settings clears the stored code: the teacher must
// regenerate and re-share it, which is how changes reach student devices in
// a no-server world.

import { useSyncExternalStore } from 'react'
import { toBase64Url, deflate } from './share.js'
import { sha256Hex, randomToken } from './auth.js'
import { getUnit } from '../content/index.js'

const STORAGE_KEY = 'sportmediq:classes:v1'
export const CLASS_CODE_PREFIX = 'SMIQC1.'

// Classroom-safe 4-5 letter words for PINs. Word + 2 digits is easy to say
// out loud, easy to type on a phone, and hard for a classmate to guess.
const PIN_WORDS = [
  'TIGER', 'MAPLE', 'RIVER', 'STONE', 'CLOUD', 'EAGLE', 'LEMON', 'PIANO',
  'ROBIN', 'SOLAR', 'TRACK', 'FIELD', 'COACH', 'MEDAL', 'RELAY', 'SCORE',
  'CLEAT', 'ARENA', 'COURT', 'SKATE', 'PEDAL', 'WHEEL', 'NORTH', 'OCEAN',
  'PLANT', 'GREEN', 'AMBER', 'CORAL', 'DELTA', 'FLARE', 'GROVE', 'CEDAR',
  'BLAZE', 'COMET', 'DRIFT', 'EMBER', 'FROST', 'GLIDE', 'HURON', 'INLET',
  'JUMBO', 'KAYAK', 'LUNAR', 'MANGO', 'NOBLE', 'OTTER', 'PLUME', 'QUEST',
  'RIDGE', 'SIENA', 'TEMPO', 'ULTRA', 'VIVID', 'WAVES', 'YIELD', 'ZESTY',
]

export function generatePin() {
  const bytes = new Uint8Array(2)
  crypto.getRandomValues(bytes)
  const word = PIN_WORDS[bytes[0] % PIN_WORDS.length]
  const digits = 10 + (bytes[1] % 90) // 10..99, always two digits
  return `${word}${digits}`
}

export function normalizePin(pin) {
  return (pin ?? '').toUpperCase().replace(/\s+/g, '')
}

export async function hashPin(salt, pin) {
  // Truncated hash: the PIN space is small anyway — this is a classroom
  // deterrent, not cryptographic account security (documented in auth.js).
  return (await sha256Hex(`${salt}:${normalizePin(pin)}`)).slice(0, 16)
}

const defaultSettings = () => ({ units: null, quizzes: true, assignments: true })

function normalizeSettings(value) {
  const source = value && typeof value === 'object' ? value : {}
  return {
    units: Array.isArray(source.units)
      ? source.units.filter((id) => typeof id === 'string')
      : null,
    quizzes: source.quizzes !== false,
    assignments: source.assignments !== false,
  }
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return { classes: Array.isArray(parsed.classes) ? parsed.classes : [] }
  } catch {
    return { classes: [] }
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

function updateClass(cid, updater) {
  const cls = state.classes.find((c) => c.cid === cid)
  if (!cls) throw new Error('That class no longer exists on this device.')
  const next = updater(cls)
  save({ ...state, classes: state.classes.map((c) => (c.cid === cid ? next : c)) })
  return next
}

// Roster or settings changed → the last generated code no longer matches
// what students should have. Clearing it makes the UI ask for a regenerate.
function withStaleCode(cls, patch) {
  return { ...cls, ...patch, code: '', codeAt: null }
}

// Student IDs read like "P3-01": a short prefix from the class name + a
// per-class sequence number. Unique within the class; combined with the
// class id they are unique everywhere.
function idPrefix(className) {
  const letters = className
    .split(/\s+/)
    .map((word) => word.replace(/[^a-zA-Z0-9]/g, '').charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 4)
  return letters || 'STU'
}

// --- mutations ---

export function createClass(name) {
  const trimmed = (name ?? '').trim().slice(0, 60)
  if (!trimmed) throw new Error('Give the class a name.')
  if (state.classes.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
    throw new Error('A class with that name already exists.')
  }
  const cls = {
    cid: `c-${randomToken(6)}`,
    name: trimmed,
    createdAt: new Date().toISOString(),
    seq: 0,
    students: [], // [{ sid, name, pin, createdAt }]
    settings: defaultSettings(),
    code: '',
    codeAt: null,
  }
  save({ ...state, classes: [...state.classes, cls] })
  return cls
}

export function removeClass(cid) {
  save({ ...state, classes: state.classes.filter((c) => c.cid !== cid) })
}

export function addStudent(cid, loginName) {
  const name = (loginName ?? '').trim().slice(0, 40)
  if (!name) throw new Error('Enter a login name for the student.')
  return updateClass(cid, (cls) => {
    if (cls.students.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      throw new Error(`"${name}" is already in this class — pick a different login name.`)
    }
    const seq = (cls.seq ?? cls.students.length) + 1
    const sid = `${idPrefix(cls.name)}-${String(seq).padStart(2, '0')}`
    const student = { sid, name, pin: generatePin(), createdAt: new Date().toISOString() }
    return withStaleCode(cls, { seq, students: [...cls.students, student] })
  }).students.at(-1)
}

export function removeStudentFromClass(cid, sid) {
  updateClass(cid, (cls) =>
    withStaleCode(cls, { students: cls.students.filter((s) => s.sid !== sid) }),
  )
}

export function resetStudentPin(cid, sid) {
  return updateClass(cid, (cls) =>
    withStaleCode(cls, {
      students: cls.students.map((s) => (s.sid === sid ? { ...s, pin: generatePin() } : s)),
    }),
  ).students.find((s) => s.sid === sid)
}

export function updateClassSettings(cid, patch) {
  updateClass(cid, (cls) =>
    withStaleCode(cls, { settings: normalizeSettings({ ...normalizeSettings(cls.settings), ...patch }) }),
  )
}

// --- the class login code ---

// Encodes the class for students: roster with hashed PINs + settings. Also
// stores the code on the class so it can be re-copied without re-encoding.
export async function buildClassLoginCode(cid) {
  const cls = state.classes.find((c) => c.cid === cid)
  if (!cls) throw new Error('That class no longer exists on this device.')
  if (cls.students.length === 0) throw new Error('Add at least one student first.')

  const settings = normalizeSettings(cls.settings)
  // Drop unit ids that no longer exist in this app version rather than
  // shipping dead references to student devices.
  if (settings.units) settings.units = settings.units.filter((id) => getUnit(id) !== null)

  const students = await Promise.all(
    cls.students.map(async (s) => {
      const salt = randomToken(6)
      return { sid: s.sid, name: s.name, salt, hash: await hashPin(salt, s.pin) }
    }),
  )

  const payload = {
    v: 1,
    cid: cls.cid,
    name: cls.name,
    settings,
    students,
    at: new Date().toISOString(),
  }
  const compressed = await deflate(new TextEncoder().encode(JSON.stringify(payload)))
  const code = CLASS_CODE_PREFIX + toBase64Url(compressed)
  updateClass(cid, (c) => ({ ...c, code, codeAt: payload.at }))
  return code
}

// Plain-text credential sheet the teacher can copy into a doc, print, and
// cut into slips. One line per student.
export function credentialSheetText(cls) {
  const header = `${cls.name} — SportMedIQ logins\nLogin name · Student ID · PIN\n`
  const lines = cls.students.map((s) => `${s.name} · ${s.sid} · ${s.pin}`)
  return header + lines.join('\n')
}

// --- React binding ---

function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function useClasses() {
  return useSyncExternalStore(subscribe, () => state.classes)
}
