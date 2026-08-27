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
  hasRecoverableProfile,
  recoverProfileWithPreviousPin,
  reloadProgressProfile,
  setStudentName,
  useProgress,
} from './progress.js'

// ONE record holds both the imported classes and the active session.
// They used to be two keys, which meant a write was two storage operations:
// another tab's commit could interleave between them (persisting student B's
// login, then having this tab restore student A's session), and if the second
// operation threw, module state and storage disagreed — with
// reloadProgressProfile then following the persisted session, the UI could
// name one student while loading another's progress. A single record makes the
// write atomic. progress.js reads `.session` out of this same key (it must not
// import this module, which imports it).
const STORAGE_KEY = 'sportmediq:studentClasses:v1'
// Retained only so the pre-combination key gets cleaned up once.
const LEGACY_SESSION_KEY = 'sportmediq:studentSession:v1'

const OTHER_PREFIXES = ['SMIQ2.', 'SMIQ1.', 'SMIQA1.', 'SMIQT1.']

function normalizeSession(parsed) {
  try {
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
      session: normalizeSession(parsed.session),
    }
  } catch {
    return { classes: [], session: null }
  }
}

let state = load()
const listeners = new Set()

function save(next) {
  state = next
  try {
    // Single write: classes and session land together or not at all.
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ classes: state.classes, session: state.session }),
    )
    localStorage.removeItem(LEGACY_SESSION_KEY)
  } catch {
    // Storage full or blocked — keep working in memory.
  }
  listeners.forEach((fn) => fn())
}

// Every write goes through this, and `updater` receives state re-read from
// localStorage — never a snapshot captured before an await. Decoding a class
// code and deriving a PIN hash are both slow, and this store persists TWO keys
// (classes + session), so a stale write here can erase a class another tab
// imported or log out a student who just signed in there. The updater may
// throw to abort.
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
  // Ids go into localStorage key paths, so they must look like the ids this
  // app generates (P3-01, c-ab12cd) — never anything carrying the ":"
  // delimiter, which a hand-edited code could use to aim one student's key at
  // another's profile.
  const SAFE_ID = /^[A-Za-z0-9_-]{1,40}$/
  const students = Array.isArray(data.students)
    ? data.students.filter(
        (s) =>
          s &&
          typeof s.sid === 'string' &&
          SAFE_ID.test(s.sid) &&
          typeof s.name === 'string' &&
          typeof s.salt === 'string' &&
          typeof s.hash === 'string',
      )
    : []
  if (
    typeof data.cid !== 'string' ||
    !SAFE_ID.test(data.cid) ||
    typeof data.name !== 'string' ||
    students.length === 0
  ) {
    throw new Error('Class login code is damaged or incomplete — copy the whole code and try again.')
  }
  return {
    cid: data.cid,
    name: data.name.trim().slice(0, 60),
    settings: normalizeSettings(data.settings),
    students: students.map((s) => ({
      sid: s.sid,
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
  let loggedOut = false
  commit((cur) => {
    const classes = [...cur.classes.filter((c) => c.cid !== cls.cid), cls].sort((a, b) =>
      a.name.localeCompare(b.name),
    )
    let session = cur.session
    loggedOut = !!(
      session &&
      session.cid === cls.cid &&
      !cls.students.some((s) => s.sid === session.sid)
    )
    if (loggedOut) session = null
    return { classes, session }
  })
  if (loggedOut) reloadProgressProfile()
  return cls
}

export function removeImportedClass(cid) {
  let loggedOut = false
  commit((cur) => {
    loggedOut = cur.session?.cid === cid
    return {
      classes: cur.classes.filter((c) => c.cid !== cid),
      session: loggedOut ? null : cur.session,
    }
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

  // Deriving that hash took real time, and another tab may have imported a
  // newer class code meanwhile. Re-resolve against *persisted* state inside the
  // commit — not this tab's snapshot, which the async storage event may not
  // have refreshed yet — so a login started just before the import cannot
  // succeed on a PIN the teacher has since reset, or for a removed student.
  //
  // The verifier also doubles as profile-key material: reproducible only by
  // someone who knows this student's actual PIN, so a doctored class code
  // carrying a substituted verifier opens a different, empty profile rather
  // than the real student's.
  let signedIn = null
  commit((cur) => {
    const currentStudent = cur.classes
      .find((c) => c.cid === cid)
      ?.students.find((s) => s.sid === sid)
    if (!currentStudent) {
      throw new Error('Your class was just updated on this device and you are no longer on its roster.')
    }
    if (currentStudent.salt !== student.salt || currentStudent.hash !== student.hash) {
      throw new Error('Your class was just updated on this device — try signing in again with your current PIN.')
    }
    signedIn = currentStudent
    return { ...cur, session: { cid, sid, name: currentStudent.name, pk: hash.slice(0, 16) } }
  })
  reloadProgressProfile()
  // First login on this profile: pre-fill the progress-code name with the
  // teacher-chosen login name so exported codes identify the student.
  setStudentName(signedIn.name)
  return signedIn
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

  // If another student signed in from a second tab during that await, the
  // storage listeners have already switched the progress store to them —
  // moving work now would merge this student's old profile into the new
  // student's and delete the original.
  const active = load().session
  if (!active || active.cid !== session.cid || active.sid !== session.sid) {
    throw new Error('Someone else signed in on this device — sign in again before moving your work.')
  }

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
  commit((cur) => ({ ...cur, session: null }))
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
    if (event.key === null || event.key === STORAGE_KEY) {
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
