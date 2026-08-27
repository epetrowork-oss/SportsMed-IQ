// Student progress store: one plain object persisted to localStorage,
// exposed to React through useSyncExternalStore. No reducers, no context
// pyramid — read state with useProgress(), change it with the exported
// mutation functions.

import { useSyncExternalStore } from 'react'

const BASE_STORAGE_KEY = 'sportmediq:progress:v1'
// Written by studentSession.js. Read directly here (rather than importing
// that module, which imports this one) to pick the progress profile: when a
// student is logged in, their progress lives under a per-student key so
// classmates sharing one device never see each other's progress. With no
// session the legacy key is used, so self-study devices are unaffected.
// studentSession.js keeps the active session inside its own single record
// (one atomic write covering classes + session), so read it from there.
const STUDENT_STORE_KEY = 'sportmediq:studentClasses:v1'
export const PASS_THRESHOLD = 0.7 // quiz score needed to count as passed

// The key also mixes in `pk` — material studentSession.js derives from the
// PIN at login. Without it, anyone who edited a class login code to carry a
// PIN verifier of their own choosing could sign in as a classmate and land in
// that classmate's profile; with it they derive a different key and get an
// empty one instead. (This closes the in-app path only: whoever holds the
// device can still read localStorage directly with devtools.)
// Key components are app-generated ids (`P3-01`, `c-ab12cd`) and hex-derived
// material, but they arrive via a class login code a student can edit, so they
// are checked rather than trusted: a component containing the ":" delimiter
// could otherwise be shaped to make one student's key collide with another's.
const SAFE_KEY_PART = /^[A-Za-z0-9_-]{1,64}$/

function safeKeyPart(value) {
  return typeof value === 'string' && SAFE_KEY_PART.test(value)
}

// A device upgrading from the split layout still has its session under the old
// key, and this module initializes BEFORE studentSession.js can migrate it
// (that module imports this one), so the fallback has to live here too —
// otherwise the first write after an upgrade lands in the shared profile
// instead of the student's own.
const LEGACY_SESSION_KEY = 'sportmediq:studentSession:v1'

function readSession() {
  try {
    const raw = localStorage.getItem(STUDENT_STORE_KEY)
    const session = raw ? JSON.parse(raw)?.session : null
    if (session) return session
  } catch {
    // fall through to the legacy key
  }
  try {
    const legacy = localStorage.getItem(LEGACY_SESSION_KEY)
    return legacy ? JSON.parse(legacy) : null
  } catch {
    return null
  }
}

function profileStorageKey() {
  try {
    const session = readSession()
    if (session && safeKeyPart(session.cid) && safeKeyPart(session.sid)) {
      const base = `${BASE_STORAGE_KEY}:${session.cid}:${session.sid}`
      return safeKeyPart(session.pk) ? `${base}:${session.pk}` : base
    }
  } catch {
    // Corrupt session — fall back to the shared profile.
  }
  return BASE_STORAGE_KEY
}

// Every profile this device holds for one student: the current key, keys from
// earlier PINs, and the pre-`pk` key written by older builds. Only that
// student can have created any of them, since writing one requires signing in
// with a PIN that verified against the class code.
function siblingProfileKeys(cid, sid) {
  if (!safeKeyPart(cid) || !safeKeyPart(sid)) return []
  const base = `${BASE_STORAGE_KEY}:${cid}:${sid}`
  const keys = []
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i)
      if (key === base || (key && key.startsWith(`${base}:`))) keys.push(key)
    }
  } catch {
    // Storage unavailable — nothing to migrate.
  }
  return keys
}

let STORAGE_KEY = profileStorageKey()

const emptyUnit = () => ({
  lessonRead: false,
  flashcardsReviewed: false,
  bestQuizScore: null, // 0..1, best across attempts
  quizAttempts: 0,
  quizImprovementMax: 0, // largest single improvement over a previous best
  readSeconds: 0, // accumulated time on the lesson page while visible
  scrollPct: 0, // deepest point of the lesson ever seen, 0-100
  touchedAt: 0, // Date.now() of the last mutation, for "continue where you left off"
})

const emptyPractical = () => ({
  reflection: '',
  reflectionCompleted: false,
  readyForReview: false,
  teacherVerified: false,
  updatedAt: 0,
})

const emptyGamification = () => ({
  activeDates: [],
  practicals: {},
  seenBadgeIds: [],
})

export function localDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function normalizePractical(value) {
  const source = value && typeof value === 'object' ? value : {}
  return {
    reflection: typeof source.reflection === 'string' ? source.reflection.slice(0, 4000) : '',
    reflectionCompleted: !!source.reflectionCompleted,
    readyForReview: !!source.readyForReview,
    teacherVerified: !!source.teacherVerified,
    updatedAt: typeof source.updatedAt === 'number' && source.updatedAt > 0 ? source.updatedAt : 0,
  }
}

function normalizeGamification(value) {
  const source = value && typeof value === 'object' ? value : {}
  const practicals = {}
  if (source.practicals && typeof source.practicals === 'object') {
    for (const [activityId, practical] of Object.entries(source.practicals)) {
      if (typeof activityId === 'string' && activityId) practicals[activityId] = normalizePractical(practical)
    }
  }
  return {
    activeDates: [...new Set((Array.isArray(source.activeDates) ? source.activeDates : []).filter((item) =>
      typeof item === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item),
    ))].sort(),
    practicals,
    seenBadgeIds: [...new Set((Array.isArray(source.seenBadgeIds) ? source.seenBadgeIds : []).filter((item) =>
      typeof item === 'string' && item,
    ))],
  }
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return {
      name: parsed.name ?? '',
      units: parsed.units ?? {},
      gamification: normalizeGamification(parsed.gamification),
      // Teacher-issued class codes imported on this device. Deliberately NOT
      // part of the student progress-code export (share.js) — assignments
      // don't follow a student between devices, only their unit progress does.
      assignments: Array.isArray(parsed.assignments) ? parsed.assignments : [],
    }
  } catch {
    // Corrupt or unavailable storage: start fresh rather than crash.
    return { name: '', units: {}, gamification: emptyGamification(), assignments: [] }
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

// Progress writes go through this for the same reason every other store does.
// Being synchronous within one tab does NOT serialize tabs: a `storage` event
// only arrives *after* the other tab's write, so until then this tab holds a
// stale snapshot — and saving the whole profile from it drops whatever the
// other tab just recorded (one tab logs a quiz result, the other reading time,
// and the second write erases the first). Re-reading the persisted profile at
// write time keeps both.
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
    // An updater may return null to mean "nothing to change" — e.g. a scroll
    // position that is not deeper than the stored one. Skipping the write
    // avoids pointless saves and storage events.
    if (next === null) return state
    if (readRaw() === before || attempt >= COMMIT_ATTEMPTS) {
      save(next)
      return next
    }
  }
}

function withMeaningfulActivity(nextState) {
  const gamification = normalizeGamification(nextState.gamification)
  const today = localDateKey()
  return gamification.activeDates.includes(today)
    ? { ...nextState, gamification }
    : { ...nextState, gamification: { ...gamification, activeDates: [...gamification.activeDates, today].sort() } }
}

// `patchFn` and `meaningfulFn` receive the unit's CURRENT persisted state and
// run inside the commit. That matters for anything cumulative: computing
// `readSeconds + 10` from a snapshot this tab read before another tab wrote
// produces an absolute value that, merged over the newer record, would drag the
// total backwards. Deriving it here means it is always relative to what is
// actually stored. Return null from patchFn for "no change".
function updateUnit(unitId, patchFn, meaningfulFn = () => false) {
  commit((cur) => {
    const current = { ...emptyUnit(), ...(cur.units[unitId] ?? {}) }
    const patch = patchFn(current)
    if (patch === null) return null
    const next = {
      ...cur,
      units: { ...cur.units, [unitId]: { ...current, ...patch, touchedAt: Date.now() } },
    }
    return meaningfulFn(current) ? withMeaningfulActivity(next) : next
  })
}

// Same contract as updateUnit: derived from the current persisted practical.
function updatePractical(activityId, patchFn, meaningfulFn = () => false) {
  commit((cur) => {
    const gamification = normalizeGamification(cur.gamification)
    const current = { ...emptyPractical(), ...(gamification.practicals[activityId] ?? {}) }
    const patch = patchFn(current)
    if (patch === null) return null
    const next = {
      ...cur,
      gamification: {
        ...gamification,
        practicals: {
          ...gamification.practicals,
          [activityId]: { ...current, ...patch, updatedAt: Date.now() },
        },
      },
    }
    return meaningfulFn(current) ? withMeaningfulActivity(next) : next
  })
}

// Called by studentSession.js after a login/logout changes the session:
// re-derive the storage key, load that profile's state, and re-render
// everything subscribed to this store.
export function reloadProgressProfile() {
  STORAGE_KEY = profileStorageKey()
  state = load()
  listeners.forEach((fn) => fn())
}

// Fold one stored profile into the current one and delete it. Best-of-both
// rules, identical to a progress-code import, so nothing is lost if both keys
// hold work.
// Returns the absorbed profile's own name, if it had one, so the caller can
// decide whether it should win over whatever the current profile holds.
function absorbProfile(key) {
  if (key === STORAGE_KEY) return false
  let parsed = null
  try {
    const raw = localStorage.getItem(key)
    parsed = raw ? JSON.parse(raw) : null
  } catch {
    parsed = null
  }
  if (parsed && typeof parsed === 'object') {
    mergeProgress(parsed.name ?? '', parsed.units ?? {}, parsed.gamification)
    for (const assignment of Array.isArray(parsed.assignments) ? parsed.assignments : []) {
      if (assignment && typeof assignment.name === 'string') importAssignment(assignment)
    }
  }
  try {
    localStorage.removeItem(key)
  } catch {
    // Storage blocked — the stale key is harmless, it just lingers.
  }
  return true
}

// Does a stored profile actually hold work worth moving? An empty shell —
// left behind by a mistyped class code or an abandoned login — must not make
// the app offer a recovery the student cannot complete.
function profileHasWork(key) {
  try {
    const raw = localStorage.getItem(key)
    const parsed = raw ? JSON.parse(raw) : null
    if (!parsed || typeof parsed !== 'object') return false
    const units = parsed.units && typeof parsed.units === 'object' ? Object.values(parsed.units) : []
    if (units.some((u) => u && (u.lessonRead || u.flashcardsReviewed || u.quizAttempts > 0 || u.readSeconds > 0))) {
      return true
    }
    const game = normalizeGamification(parsed.gamification)
    if (game.activeDates.length > 0 || game.seenBadgeIds.length > 0 || Object.keys(game.practicals).length > 0) {
      return true
    }
    // Imported assignments count too: absorbProfile migrates them, so a
    // student whose only state is a class code's assignment list must still be
    // offered recovery after a PIN reset rather than silently losing it.
    return Array.isArray(parsed.assignments) && parsed.assignments.some((a) => a && typeof a.name === 'string')
  } catch {
    return false
  }
}

// NOTE: there is deliberately no automatic profile adoption of any kind.
// An earlier revision absorbed a "legacy" un-keyed profile at login, which
// review showed was exploitable: a forged class code carrying a sid shaped
// like "<victim sid>:<victim pk>" — both readable from the legitimate code —
// made that legacy key resolve to the victim's real profile. Nothing moves
// between profiles now except through recoverProfileWithPreviousPin below,
// which demands the old PIN, and key components are charset-checked above so
// no id can impersonate a longer key.

// Is there work saved on this device for this student under some other key —
// i.e. from before their PIN was reset? Drives the "bring my earlier work
// over" prompt on the sign-in page.
export function hasRecoverableProfile(cid, sid) {
  return siblingProfileKeys(cid, sid).some((key) => key !== STORAGE_KEY && profileHasWork(key))
}

// The migration path for a teacher-issued PIN reset. studentSession.js derives
// `previousPk` from the OLD PIN the student types, which only they can supply:
// the class code no longer carries the old verifier, and the salt it does carry
// is useless without the PIN itself. Returns true when work was moved.
export function recoverProfileWithPreviousPin(cid, sid, previousPk) {
  if (!safeKeyPart(cid) || !safeKeyPart(sid) || !safeKeyPart(previousPk)) return false
  // The destination must still be this student's own profile. If a classmate
  // signed in from another tab, STORAGE_KEY now points at theirs, and absorbing
  // into it would both expose this student's work and destroy the original.
  if (!STORAGE_KEY.startsWith(`${BASE_STORAGE_KEY}:${cid}:${sid}:`)) return false
  const key = `${BASE_STORAGE_KEY}:${cid}:${sid}:${previousPk}`
  if (key === STORAGE_KEY || !siblingProfileKeys(cid, sid).includes(key)) return false
  if (!profileHasWork(key)) return false

  // The name the student chose in the older profile must survive. The new
  // profile was seeded at login with the teacher's login nickname, and
  // mergeProgress keeps whatever the current profile already has — so without
  // this the recovered name would lose to the seed and their progress code
  // would silently go back to identifying them by the nickname.
  let previousName = ''
  try {
    const raw = localStorage.getItem(key)
    const parsed = raw ? JSON.parse(raw) : null
    previousName = typeof parsed?.name === 'string' ? parsed.name.trim() : ''
  } catch {
    previousName = ''
  }

  const moved = absorbProfile(key)
  if (moved && previousName) commit((cur) => ({ ...cur, name: previousName.slice(0, 60) }))
  listeners.forEach((fn) => fn())
  return moved
}

// Two tabs open on a shared classroom device must not disagree about whose
// progress they are showing. Without this, a tab left open by one student
// keeps rendering — and writing to — their profile after a classmate signs in
// from another tab. `storage` fires only in the *other* tabs, so this reacts
// to their logins and logouts; event.key === null means localStorage.clear().
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === null || event.key === STUDENT_STORE_KEY) {
      reloadProgressProfile()
    } else if (event.key === STORAGE_KEY) {
      // Same student, second tab: pick up their newly written progress.
      state = load()
      listeners.forEach((fn) => fn())
    }
  })
}

// --- mutations ---

export function markLessonRead(unitId) {
  updateUnit(unitId, () => ({ lessonRead: true }), (c) => !c.lessonRead)
}

export function markFlashcardsReviewed(unitId) {
  updateUnit(unitId, () => ({ flashcardsReviewed: true }), (c) => !c.flashcardsReviewed)
}

// Called periodically by the lesson page while it is open and visible.
// Deltas are capped by the caller; stored as whole seconds.
export function addReadingTime(unitId, seconds) {
  if (!(seconds > 0)) return
  updateUnit(unitId, (c) => ({ readSeconds: Math.round(c.readSeconds + seconds) }))
}

// High-water mark of how far down the lesson the student has scrolled.
export function recordScrollDepth(unitId, pct) {
  const clamped = Math.min(100, Math.max(0, Math.round(pct)))
  updateUnit(unitId, (c) => (clamped > c.scrollPct ? { scrollPct: clamped } : null))
}

export function recordQuizResult(unitId, correct, total) {
  const score = total > 0 ? correct / total : 0
  updateUnit(
    unitId,
    (c) => {
      const previousBest = c.bestQuizScore ?? 0
      const improvement = c.quizAttempts > 0 ? score - previousBest : 0
      return {
        quizAttempts: c.quizAttempts + 1,
        bestQuizScore: Math.max(previousBest, score),
        quizImprovementMax: Math.max(c.quizImprovementMax ?? 0, improvement),
      }
    },
    () => true,
  )
}

export function savePracticalReflection(activityId, reflection) {
  const text = typeof reflection === 'string' ? reflection.trim().slice(0, 4000) : ''
  updatePractical(
    activityId,
    (c) => ({
      reflection: text,
      reflectionCompleted: text.length > 0,
      readyForReview: text === c.reflection ? c.readyForReview : false,
    }),
    (c) => text.length > 0 && !c.reflectionCompleted,
  )
}

export function markPracticalReadyForReview(activityId) {
  if (!getPracticalProgress(activityId).reflectionCompleted) return false
  updatePractical(
    activityId,
    (c) => (c.reflectionCompleted ? { readyForReview: true } : null),
    (c) => !c.readyForReview,
  )
  return true
}

// Teacher verification is intentionally not exposed as a student-page action.
// A future teacher-controlled import can call this after validating its source.
export function applyTeacherPracticalVerification(activityId, verified = true) {
  updatePractical(
    activityId,
    () => ({ teacherVerified: !!verified }),
    (c) => !!verified && !c.teacherVerified,
  )
}

export function resetAllProgress() {
  commit((cur) => ({ ...cur, units: {}, gamification: emptyGamification() }))
}

export function setStudentName(name) {
  commit((cur) => ({ ...cur, name: name.trim().slice(0, 60) }))
}

// Seeds the name only when this profile has none. Login uses this rather than
// setStudentName: a student who edited "Your name" on the Sync page must not
// have it replaced by the teacher-chosen login nickname every time they sign
// back in, which would silently change how their progress code identifies them.
export function initStudentName(name) {
  commit((cur) => (cur.name ? cur : { ...cur, name: name.trim().slice(0, 60) }))
}

export function markBadgesSeen(badgeIds) {
  commit((cur) => {
    const gamification = normalizeGamification(cur.gamification)
    return {
      ...cur,
      gamification: {
        ...gamification,
        seenBadgeIds: [...new Set([...gamification.seenBadgeIds, ...(badgeIds ?? [])])],
      },
    }
  })
}

function mergePractical(currentValue, importedValue) {
  const current = normalizePractical(currentValue)
  const imported = normalizePractical(importedValue)
  const newer = imported.updatedAt > current.updatedAt ? imported : current
  return {
    reflection: newer.reflection,
    reflectionCompleted: current.reflectionCompleted || imported.reflectionCompleted,
    readyForReview: current.readyForReview || imported.readyForReview,
    teacherVerified: current.teacherVerified || imported.teacherVerified,
    updatedAt: Math.max(current.updatedAt, imported.updatedAt),
  }
}

// Merge imported progress into this device's progress, keeping the best of
// both for every unit (booleans OR, scores/attempts max). Used when a student
// loads their code on a second device that may already have some progress.
export function mergeProgress(name, importedUnits, importedGamification = null) {
  commit((cur) => {
  const merged = { ...cur.units }
  for (const [unitId, imp] of Object.entries(importedUnits)) {
    const cur = merged[unitId] ?? emptyUnit()
    merged[unitId] = {
      lessonRead: cur.lessonRead || !!imp.lessonRead,
      flashcardsReviewed: cur.flashcardsReviewed || !!imp.flashcardsReviewed,
      bestQuizScore:
        imp.bestQuizScore == null && cur.bestQuizScore == null
          ? null
          : Math.max(cur.bestQuizScore ?? 0, imp.bestQuizScore ?? 0),
      quizAttempts: Math.max(cur.quizAttempts, imp.quizAttempts ?? 0),
      quizImprovementMax: Math.max(cur.quizImprovementMax ?? 0, imp.quizImprovementMax ?? 0),
      // Max, not sum: re-importing the same code twice must not double-count.
      readSeconds: Math.max(cur.readSeconds ?? 0, imp.readSeconds ?? 0),
      scrollPct: Math.max(cur.scrollPct ?? 0, imp.scrollPct ?? 0),
      // touchedAt stays device-local so importing a code cannot fake recency
      // for "Continue where you left off" on this device.
      touchedAt: cur.touchedAt ?? 0,
    }
  }

  const currentGame = normalizeGamification(cur.gamification)
  const importedGame = normalizeGamification(importedGamification)
  const practicals = { ...currentGame.practicals }
  for (const [activityId, importedPractical] of Object.entries(importedGame.practicals)) {
    practicals[activityId] = mergePractical(practicals[activityId], importedPractical)
  }
  const gamification = {
    activeDates: [...new Set([...currentGame.activeDates, ...importedGame.activeDates])].sort(),
    practicals,
    seenBadgeIds: [...new Set([...currentGame.seenBadgeIds, ...importedGame.seenBadgeIds])],
  }
    return { ...cur, name: cur.name || name, units: merged, gamification }
  })
}

// --- assignments (teacher-issued class codes, imported on this device) ---

// Upsert keyed by case-insensitive trimmed name: re-importing the same name
// replaces the existing entry in place (array order preserved) rather than
// adding a duplicate.
export function importAssignment(assignment) {
  const key = assignment.name.trim().toLowerCase()
  commit((cur) => {
    const existingIndex = cur.assignments.findIndex((a) => a.name.trim().toLowerCase() === key)
    const assignments = [...cur.assignments]
    if (existingIndex >= 0) assignments[existingIndex] = assignment
    else assignments.push(assignment)
    return { ...cur, assignments }
  })
}

export function removeAssignment(name) {
  const key = name.trim().toLowerCase()
  commit((cur) => ({
    ...cur,
    assignments: cur.assignments.filter((a) => a.name.trim().toLowerCase() !== key),
  }))
}

// --- reads ---

export function getUnitProgress(unitId) {
  // Spread over defaults so records saved by older app versions
  // (before readSeconds existed) still have every field.
  return { ...emptyUnit(), ...(state.units[unitId] ?? {}) }
}

export function getPracticalProgress(activityId) {
  const gamification = normalizeGamification(state.gamification)
  return { ...emptyPractical(), ...(gamification.practicals[activityId] ?? {}) }
}

export function isUnitComplete(unitId) {
  const p = getUnitProgress(unitId)
  return p.lessonRead && p.flashcardsReviewed && (p.bestQuizScore ?? 0) >= PASS_THRESHOLD
}

// --- React binding ---

function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function useProgress() {
  return useSyncExternalStore(subscribe, () => state)
}

export function useAssignments() {
  return useSyncExternalStore(subscribe, () => state.assignments)
}
