// Student-side login: the device imports the teacher's class login code
// (SMIQC1 — roster with hashed PINs + the class's content controls), then a
// student logs in by picking their login name and typing their PIN. The PIN
// is checked against the hash locally, so login works fully offline.
//
// A successful login switches the progress store to a per-student profile
// (progress.js keys progress by class id + student id), so several students
// can share one classroom device without seeing each other's progress. No
// personal information is involved anywhere: the only identity is the
// teacher-chosen login name and the generated student ID.

import { useSyncExternalStore } from 'react'
import { fromBase64UrlBytes, inflate } from './share.js'
import { CLASS_CODE_PREFIX, hashPin } from './classes.js'
import { reloadProgressProfile, setStudentName, useProgress } from './progress.js'

const STORAGE_KEY = 'sportmediq:studentClasses:v1'
// The active session lives in its own key because progress.js reads it
// directly at load time to pick the progress profile (see progress.js —
// it must not import this module).
export const SESSION_KEY = 'sportmediq:studentSession:v1'

const OTHER_PREFIXES = ['SMIQ2.', 'SMIQ1.', 'SMIQA1.', 'SMIQT1.']

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    if (parsed && typeof parsed.cid === 'string' && typeof parsed.sid === 'string') {
      return { cid: parsed.cid, sid: parsed.sid, name: typeof parsed.name === 'string' ? parsed.name : '' }
    }
    return null
  } catch {
    return null
  }
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return {
      classes: Array.isArray(parsed.classes) ? parsed.classes : [],
      session: loadSession(),
    }
  } catch {
    return { classes: [], session: loadSession() }
  }
}

let state = load()
const listeners = new Set()

function save(next) {
  state = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ classes: state.classes }))
    if (state.session) localStorage.setItem(SESSION_KEY, JSON.stringify(state.session))
    else localStorage.removeItem(SESSION_KEY)
  } catch {
    // Storage full or blocked — keep working in memory.
  }
  listeners.forEach((fn) => fn())
}

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

// Decodes a class login code or throws a friendly error. Exported for the
// login page's paste box.
export async function decodeClassLoginCode(code) {
  const trimmed = (code ?? '').trim()
  if (!trimmed.startsWith(CLASS_CODE_PREFIX)) {
    if (OTHER_PREFIXES.some((p) => trimmed.startsWith(p))) {
      throw new Error(
        'That is a different kind of SportMedIQ code — a class login code starts with SMIQC1.',
      )
    }
    throw new Error('That does not look like a class login code (should start with SMIQC1).')
  }
  let data
  try {
    const bytes = await inflate(fromBase64UrlBytes(trimmed.slice(CLASS_CODE_PREFIX.length)))
    data = JSON.parse(new TextDecoder().decode(bytes))
  } catch {
    throw new Error('Class login code is damaged or incomplete — copy the whole code and try again.')
  }
  const students = Array.isArray(data.students)
    ? data.students.filter(
        (s) =>
          s &&
          typeof s.sid === 'string' &&
          typeof s.name === 'string' &&
          typeof s.salt === 'string' &&
          typeof s.hash === 'string',
      )
    : []
  if (typeof data.cid !== 'string' || typeof data.name !== 'string' || students.length === 0) {
    throw new Error('Class login code is damaged or incomplete — copy the whole code and try again.')
  }
  return {
    cid: data.cid.slice(0, 40),
    name: data.name.trim().slice(0, 60),
    settings: normalizeSettings(data.settings),
    students: students.map((s) => ({
      sid: s.sid.slice(0, 40),
      name: s.name.trim().slice(0, 40),
      salt: s.salt.slice(0, 40),
      hash: s.hash.slice(0, 64),
    })),
    at: typeof data.at === 'string' ? data.at : new Date().toISOString(),
  }
}

// Decode + upsert by class id. A newer code for the same class replaces the
// stored one — that is how a teacher's settings changes reach this device.
// If the currently logged-in student was removed from the class, they are
// logged out.
export async function importClassLoginCode(code) {
  const cls = await decodeClassLoginCode(code)
  const classes = [...state.classes.filter((c) => c.cid !== cls.cid), cls].sort((a, b) =>
    a.name.localeCompare(b.name),
  )
  let session = state.session
  const loggedOut =
    session && session.cid === cls.cid && !cls.students.some((s) => s.sid === session.sid)
  if (loggedOut) session = null
  save({ classes, session })
  if (loggedOut) reloadProgressProfile()
  return cls
}

export function removeImportedClass(cid) {
  const loggedOut = state.session?.cid === cid
  save({
    classes: state.classes.filter((c) => c.cid !== cid),
    session: loggedOut ? null : state.session,
  })
  if (loggedOut) reloadProgressProfile()
}

// Verify the PIN against the hash in the class code and start a session.
// Switches the progress store to this student's own profile.
export async function loginStudent(cid, sid, pin) {
  const cls = state.classes.find((c) => c.cid === cid)
  const student = cls?.students.find((s) => s.sid === sid)
  if (!student) throw new Error('Pick your name from the class list first.')
  if (!(pin ?? '').trim()) throw new Error('Type your PIN — it looks like WORD12.')
  const hash = await hashPin(student.salt, pin)
  if (hash !== student.hash) {
    throw new Error("That PIN doesn't match — check the slip your teacher gave you.")
  }
  save({ ...state, session: { cid, sid, name: student.name } })
  reloadProgressProfile()
  // First login on this profile: pre-fill the progress-code name with the
  // teacher-chosen login name so exported codes identify the student.
  setStudentName(student.name)
  return student
}

export function logoutStudent() {
  save({ ...state, session: null })
  reloadProgressProfile()
}

// --- derived: what the active class lets this student see ---

// Returns null when nobody is logged in (self-study devices keep today's
// fully-open behavior). Otherwise the teacher's controls for the class:
// { className, restricted, unitIds: Set|null, quizzes, assignments }.
export function getClassControls() {
  const session = state.session
  if (!session) return null
  const cls = state.classes.find((c) => c.cid === session.cid)
  if (!cls) return null
  const settings = normalizeSettings(cls.settings)
  return {
    className: cls.name,
    restricted: settings.units !== null,
    unitIds: settings.units === null ? null : new Set(settings.units),
    quizzes: settings.quizzes,
    assignments: settings.assignments,
  }
}

export function isUnitVisible(unitId, controls = getClassControls()) {
  if (!controls || !controls.restricted) return true
  return controls.unitIds.has(unitId)
}

// --- React binding ---

function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function useStudentSession() {
  const snapshot = useSyncExternalStore(subscribe, () => state)
  return {
    classes: snapshot.classes,
    session: snapshot.session,
    controls: getClassControls(),
  }
}

// Convenience for pages that need both a re-render on progress changes and
// the session's controls.
export function useClassControls() {
  useProgress()
  const { controls } = useStudentSession()
  return controls
}
