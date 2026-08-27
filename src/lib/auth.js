// Device-local login for the Teacher tab: an admin passcode (set up once on
// the program owner's device) and teacher access codes the admin issues.
//
// Honest scope, documented for future sessions: there is no server, so this
// is access control for a *device*, not real authentication. Its job is to
// keep students on a shared classroom device out of the teacher dashboard
// and to give each teacher a code that identifies them. Anyone who clears
// localStorage gets a fresh, locked device; nothing sensitive is stored
// beyond the salted hash of the admin passcode.
//
// Teacher access codes: "SMIQT1." + base64url(deflate-raw(UTF-8 JSON)),
// payload { v: 1, tid, name, at }. Same plumbing as every other code format
// (share.js). The code says *who* a teacher is; it is not a secret and it is
// not signed (no server to sign it), so it alone must never unlock a device
// that already holds teacher data — anyone who knows the format could build
// one. Redeeming therefore happens once, on a device with nothing to protect,
// and the teacher sets a passcode at that moment; every later unlock on that
// device needs the passcode. See docs/ACCOUNTS.md.

import { useSyncExternalStore } from 'react'
import { toBase64Url, fromBase64UrlBytes, deflate, inflate } from './share.js'

const STORAGE_KEY = 'sportmediq:auth:v1'
const TEACHER_PREFIX = 'SMIQT1.'
const OTHER_PREFIXES = ['SMIQ2.', 'SMIQ1.', 'SMIQA1.', 'SMIQC1.']

// PBKDF2-SHA256, used for the admin passcode here and for the student PIN
// verifiers in classes.js. A fast hash is the wrong tool for both: the PIN
// verifiers are handed to every student in the class inside the class code,
// so with SHA-256 anyone holding the code could enumerate the whole PIN space
// offline in milliseconds. Iterations are a deliberate compromise — enough to
// make bulk guessing cost real time, few enough that generating a class code
// for a full roster stays a few seconds on a school Chromebook.
export const PIN_HASH_ITERATIONS = 150000

export async function deriveHex(salt, secret, iterations = PIN_HASH_ITERATIONS, bits = 128) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const derived = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations, hash: 'SHA-256' },
    key,
    bits,
  )
  return [...new Uint8Array(derived)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function randomToken(length = 8) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return [...bytes].map((b) => alphabet[b % alphabet.length]).join('')
}

function normalizeTeacher(value) {
  if (!value || typeof value !== 'object') return null
  const { tid, name, salt, hash } = value
  if (typeof tid !== 'string' || typeof name !== 'string' || !name.trim()) return null
  if (typeof salt !== 'string' || !salt || typeof hash !== 'string' || !hash) return null
  return { tid, name, salt, hash, redeemedAt: value.redeemedAt ?? null }
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return {
      // { salt, hash } once the admin passcode has been set up on this device.
      admin: parsed.admin && typeof parsed.admin === 'object' ? parsed.admin : null,
      // Whether the admin is currently logged in on this device.
      adminUnlocked: !!parsed.adminUnlocked,
      // { tid, name, redeemedAt, salt, hash } once a teacher has redeemed a
      // code here AND set a device passcode. A record without a verifier is
      // from a pre-passcode build and is discarded rather than trusted, so
      // the device falls back to "redeem a code" instead of unlocking free.
      teacher: normalizeTeacher(parsed.teacher),
      // Whether that teacher is currently signed in on this device.
      teacherUnlocked: !!parsed.teacherUnlocked && !!normalizeTeacher(parsed.teacher),
      // Codes this device has issued (meaningful on the admin's device only):
      // [{ tid, name, code, issuedAt }]
      issued: Array.isArray(parsed.issued) ? parsed.issued : [],
    }
  } catch {
    return { admin: null, adminUnlocked: false, teacher: null, teacherUnlocked: false, issued: [] }
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

// EVERY write goes through this, and `updater` receives state re-read from
// localStorage — never a snapshot captured before an await.
//
// This is the fix for a whole class of bug rather than one instance of it:
// each of these functions reads state, awaits something slow (PBKDF2,
// compression), then writes a whole store object. `storage` events are
// delivered asynchronously, so between the read and the write another tab can
// have completed a change that this tab has not seen — and spreading the old
// snapshot silently reverts it. Re-reading inside the write closes that for
// every call site at once. The updater may throw to abort.
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

// --- admin ---

export function adminConfigured() {
  return !!state.admin
}

export async function setupAdmin(passcode) {
  const trimmed = (passcode ?? '').trim()
  if (trimmed.length < 6) throw new Error('Pick an admin passcode of at least 6 characters.')
  if (state.admin) throw new Error('An admin passcode is already set on this device.')
  // Without this, first-run admin setup is a back door around the teacher
  // passcode: a teacher-only device has no admin record, so anyone could
  // "set up admin" on the locked sign-in screen and land in the dashboard
  // holding that teacher's classes. Claiming admin on a device that already
  // belongs to a teacher requires their session first.
  const blockedEarly = adminSetupBlockedReason(state)
  if (blockedEarly) throw new Error(blockedEarly)

  const salt = randomToken(8)
  const hash = await deriveHex(salt, trimmed)

  // Re-checked against fresh state: another tab may have provisioned a teacher
  // while that derivation ran.
  return commit((cur) => {
    const blocked = adminSetupBlockedReason(cur)
    if (blocked) throw new Error(blocked)
    if (cur.admin) throw new Error('An admin passcode is already set on this device.')
    return { ...cur, admin: { salt, hash }, adminUnlocked: true }
  })
}

function adminSetupBlockedReason(st) {
  if (st.teacher && !st.teacherUnlocked && !st.adminUnlocked) {
    return `This device is already set up for ${st.teacher.name}. Sign in with the teacher passcode before adding a program admin.`
  }
  return null
}

export async function loginAdmin(passcode) {
  if (!state.admin) throw new Error('No admin passcode has been set up on this device yet.')
  const hash = await deriveHex(state.admin.salt, (passcode ?? '').trim())
  // Verified against the *current* record, not the one captured before the
  // derivation: another tab may have changed or removed it meanwhile.
  return commit((cur) => {
    if (!cur.admin) throw new Error('No admin passcode has been set up on this device yet.')
    if (hash !== cur.admin.hash) throw new Error('That admin passcode is not right.')
    return { ...cur, adminUnlocked: true }
  })
}

export function logoutAdmin() {
  commit((cur) => ({ ...cur, adminUnlocked: false }))
}

// A device can now hold both roles (an admin added from a teacher's dashboard,
// or a teacher provisioned from an admin's). "Sign out" must end the session
// outright rather than silently demoting admin -> teacher and leaving the
// dashboard open, which is not what anyone clicking it expects.
export function signOut() {
  commit((cur) => ({ ...cur, adminUnlocked: false, teacherUnlocked: false }))
}

// --- teacher access codes ---

// Admin-side: create a code for a named teacher and remember it so it can be
// re-copied later. Re-issuing for the same name (case-insensitive) replaces
// the old entry.
export async function issueTeacherCode(teacherName) {
  const name = (teacherName ?? '').trim().slice(0, 60)
  if (!name) throw new Error("Enter the teacher's name first.")
  const existing = state.issued.find((t) => t.name.toLowerCase() === name.toLowerCase())
  const tid = existing?.tid ?? `t-${randomToken(8)}`
  const payload = { v: 1, tid, name, at: new Date().toISOString() }
  const compressed = await deflate(new TextEncoder().encode(JSON.stringify(payload)))
  const code = TEACHER_PREFIX + toBase64Url(compressed)
  const entry = { tid, name, code, issuedAt: payload.at }
  // Merged into fresh state: spreading the pre-await snapshot would write back
  // this tab's `adminUnlocked: true` even if the admin signed out in another
  // tab meanwhile, re-opening the dashboard.
  commit((cur) => {
    if (!cur.adminUnlocked) {
      throw new Error('You were signed out while the code was being generated — sign in and try again.')
    }
    return {
      ...cur,
      issued: [...cur.issued.filter((t) => t.tid !== tid), entry].sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    }
  })
  return entry
}

// Admin-side bookkeeping only: with no server there is no remote revocation —
// this removes the entry from this device's issued list.
export function removeIssuedTeacher(tid) {
  commit((cur) => ({ ...cur, issued: cur.issued.filter((t) => t.tid !== tid) }))
}

// Class data is protected by whatever credential guards this device, so it
// counts as "provisioned" even if the auth record is gone — otherwise
// releasing a teacher on a device with no admin would leave their rosters and
// plaintext PINs sitting behind a lock anyone could re-provision. Read
// directly rather than importing classes.js, which imports this module.
const CLASSES_KEY = 'sportmediq:classes:v1'

function deviceHoldsClassData() {
  try {
    const raw = localStorage.getItem(CLASSES_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    return Array.isArray(parsed?.classes) && parsed.classes.length > 0
  } catch {
    return false
  }
}

// Why redemption must be refused right now: null when it may proceed.
//
// Reads what is *persisted*, not just this tab's snapshot. `storage` events
// are delivered asynchronously, so another tab can have provisioned a teacher
// whose record is already in localStorage while this tab's listener has not
// run yet — a snapshot check would sail past it and overwrite them. A direct
// read sees the other tab's write immediately.
function redemptionBlockedReason(st) {
  // This tab's own session still authorizes a hand-over.
  if (st.adminUnlocked || st.teacherUnlocked) return null

  const teacher = st.teacher
  if (teacher) {
    return `This device is already set up for ${teacher.name}. Sign in with the teacher passcode, or ask the program admin to sign in and hand the device over.`
  }
  if (st.admin) {
    return 'This device already has a program admin. Sign in as admin first.'
  }
  if (deviceHoldsClassData()) {
    return 'This device still holds a class roster. Sign in and clear it (Release device) before setting up a new teacher.'
  }
  return null
}

// Teacher-side, first run on a device: redeem an access code AND set the
// passcode that will unlock this device from now on.
//
// Refused outright when the device already holds teacher data (a teacher
// record or an admin passcode) and nobody is signed in — that is exactly the
// case a forged code would target. Getting past it needs the existing
// credential: the teacher's passcode, or the admin signing in and calling
// forgetTeacher() to hand the device over.
export async function redeemTeacherCode(code, passcode) {
  const blocked = redemptionBlockedReason(load())
  if (blocked) throw new Error(blocked)

  const trimmed = (code ?? '').trim()
  if (!trimmed.startsWith(TEACHER_PREFIX)) {
    if (OTHER_PREFIXES.some((p) => trimmed.startsWith(p))) {
      throw new Error(
        'That is a different kind of SportMedIQ code — a teacher access code starts with SMIQT1.',
      )
    }
    throw new Error('That does not look like a teacher access code (should start with SMIQT1).')
  }

  const secret = (passcode ?? '').trim()
  if (secret.length < 6) throw new Error('Pick a teacher passcode of at least 6 characters.')

  let data
  try {
    const bytes = await inflate(fromBase64UrlBytes(trimmed.slice(TEACHER_PREFIX.length)))
    data = JSON.parse(new TextDecoder().decode(bytes))
  } catch {
    throw new Error('Teacher access code is damaged or incomplete — copy the whole code and try again.')
  }
  if (typeof data.tid !== 'string' || typeof data.name !== 'string' || !data.name.trim()) {
    throw new Error('Teacher access code is damaged or incomplete — copy the whole code and try again.')
  }

  const salt = randomToken(8)
  const teacher = {
    tid: data.tid.slice(0, 40),
    name: data.name.trim().slice(0, 60),
    redeemedAt: new Date().toISOString(),
    salt,
    hash: await deriveHex(salt, secret),
  }

  // Re-check immediately before committing, with no await in between. The
  // guard above ran before two awaits (decompressing attacker-supplied bytes,
  // then key derivation), during which another tab can provision this device;
  // because the check reads persisted storage rather than this tab's snapshot,
  // it sees that write even if our `storage` event has not been delivered yet.
  // localStorage offers no compare-and-set, so two commits landing in the same
  // instant still resolve last-writer-wins — but that window is now sub-
  // millisecond and contains no awaits.
  commit((cur) => {
    const blockedNow = redemptionBlockedReason(cur)
    if (blockedNow) throw new Error(blockedNow)
    return { ...cur, teacher, teacherUnlocked: true }
  })
  return teacher
}

// Every unlock after the first: passcode only, no code needed.
export async function loginTeacher(passcode) {
  if (!state.teacher) throw new Error('No teacher has been set up on this device yet.')
  const hash = await deriveHex(state.teacher.salt, (passcode ?? '').trim())
  // Checked against the persisted teacher. If this device was released in
  // another tab while the derivation ran, the old passcode must not write the
  // old teacher back and undo the hand-over.
  return commit((cur) => {
    if (!cur.teacher) {
      throw new Error('This device was released while you were signing in — set it up again.')
    }
    if (hash !== cur.teacher.hash) throw new Error('That teacher passcode is not right.')
    return { ...cur, teacherUnlocked: true }
  })
}

// Sign out = lock. The teacher record stays so the device still refuses a
// pasted code; signing back in needs the passcode.
export function logoutTeacher() {
  commit((cur) => ({ ...cur, teacherUnlocked: false }))
}

// Hand the device to a different teacher, or recover from a forgotten
// passcode. Only from an unlocked device: the signed-in teacher, or the admin.
//
// The caller must also clear the teacher-side data stores when no admin
// remains to guard them (TeacherPage does this) — otherwise the classes and
// their plaintext PINs would sit on a device that now looks blank. The
// redemption guard above enforces the same rule independently, so forgetting
// to clear leaves the device locked rather than open.
export function forgetTeacher() {
  // Authorization is checked against freshly-read state INSIDE the commit. A
  // tab signed out in another tab may not have had its storage event delivered
  // yet, and its stale snapshot would otherwise still read as unlocked — which
  // matters more here than anywhere else, because the caller wipes the class
  // data once this succeeds. Throwing here means the wipe never runs.
  commit((cur) => {
    if (!cur.adminUnlocked && !cur.teacherUnlocked) {
      throw new Error('Sign in first to remove the teacher from this device.')
    }
    return { ...cur, teacher: null, teacherUnlocked: false }
  })
}

// Sign-out must reach every tab. Without this a second Teacher tab keeps its
// authenticated snapshot and goes on exposing the dashboard after the first
// tab signs out — the same cross-tab hole already closed for the student
// session and progress stores. `storage` fires only in other tabs;
// event.key === null means localStorage.clear().
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

// role: 'admin' (admin passcode entered here) beats 'teacher' (teacher
// passcode entered here). null = locked. `teacherConfigured` tells the
// sign-in screen whether to ask for a passcode or for a code + new passcode.
export function useAuth() {
  const snapshot = useSyncExternalStore(subscribe, () => state)
  return {
    adminConfigured: !!snapshot.admin,
    teacherConfigured: !!snapshot.teacher,
    teacherName: snapshot.teacher?.name ?? '',
    role: snapshot.adminUnlocked ? 'admin' : snapshot.teacherUnlocked ? 'teacher' : null,
    teacher: snapshot.teacher,
    issued: snapshot.issued,
  }
}
