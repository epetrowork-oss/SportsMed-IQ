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
import {
  adoptLegacyProfile,
  hasRecoverableProfile,
  recoverProfileWithPreviousPin,
  reloadProgressProfile,
  setStudentName,
  useProgress,
} from './progress.js'

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
      return {
        cid: parsed.cid,
        sid: parsed.sid,
        name: typeof parsed.name === 'string' ? parsed.name : '',
        // Profile-key material derived from the PIN at login (see loginStudent).
        pk: typeof parsed.pk === 'string' ? parsed.pk : '',
      }
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
  // The verifier doubles as profile-key material: it is reproducible only by
  // someone who knows this student's actual PIN, so a doctored class code
  // carrying a substituted verifier opens a different, empty profile rather
  // than the real student's.
  save({ ...state, session: { cid, sid, name: student.name, pk: hash.slice(0, 16) } })
  adoptLegacyProfile(cid, sid)
  // First login on this profile: pre-fill the progress-code name with the
  // teacher-chosen login name so exported codes identify the student.
  setStudentName(student.name)
  return student
}

// After a teacher resets a PIN the student's old work sits under the key their
// previous PIN produced. Typing that PIN reproduces the key — nobody else can,
// which is why recovery asks for it instead of adopting the profile silently.
// Returns true when work was moved over.
export async function recoverPreviousWork(previousPin) {
  const session = state.session
  if (!session) throw new Error('Sign in first.')
  const cls = state.classes.find((c) => c.cid === session.cid)
  const student = cls?.students.find((s) => s.sid === session.sid)
  if (!student) throw new Error('That class is no longer on this device.')
  if (!(previousPin ?? '').trim()) throw new Error('Type the PIN you used before.')
  const previousPk = (await hashPin(student.salt, previousPin)).slice(0, 16)
  const moved = recoverProfileWithPreviousPin(session.cid, session.sid, previousPk)
  if (!moved) {
    throw new Error("That PIN doesn't match any earlier work saved on this device.")
  }
  return moved
}

// True when this device holds work for the signed-in student under a different
// PIN key — i.e. their PIN was reset and their old progress is recoverable.
export function canRecoverPreviousWork() {
  const session = state.session
  if (!session) return false
  return hasRecoverableProfile(session.cid, session.sid)
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

// Mirror of the listener in progress.js: when another tab signs a different
// student in or out, this tab's header and gating must follow, or it would
// show one student's name over another's progress.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === null || event.key === STORAGE_KEY || event.key === SESSION_KEY) {
      state = load()
      listeners.forEach((fn) => fn())
    }
  })
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
