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
  if (state.teacher && !state.teacherUnlocked && !state.adminUnlocked) {
    throw new Error(
      `This device is already set up for ${state.teacher.name}. Sign in with the teacher passcode before adding a program admin.`,
    )
  }
  const salt = randomToken(8)
  const hash = await deriveHex(salt, trimmed)
  save({ ...state, admin: { salt, hash }, adminUnlocked: true })
}

export async function loginAdmin(passcode) {
  if (!state.admin) throw new Error('No admin passcode has been set up on this device yet.')
  const hash = await deriveHex(state.admin.salt, (passcode ?? '').trim())
  if (hash !== state.admin.hash) throw new Error('That admin passcode is not right.')
  save({ ...state, adminUnlocked: true })
}

export function logoutAdmin() {
  save({ ...state, adminUnlocked: false })
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
  save({
    ...state,
    issued: [...state.issued.filter((t) => t.tid !== tid), entry].sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
  })
  return entry
}

// Admin-side bookkeeping only: with no server there is no remote revocation —
// this removes the entry from this device's issued list.
export function removeIssuedTeacher(tid) {
  save({ ...state, issued: state.issued.filter((t) => t.tid !== tid) })
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
  if (!state.adminUnlocked && !state.teacherUnlocked && (state.teacher || state.admin)) {
    throw new Error(
      state.teacher
        ? `This device is already set up for ${state.teacher.name}. Sign in with the teacher passcode, or ask the program admin to sign in and hand the device over.`
        : 'This device already has a program admin. Sign in as admin first.',
    )
  }

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
  save({ ...state, teacher, teacherUnlocked: true })
  return teacher
}

// Every unlock after the first: passcode only, no code needed.
export async function loginTeacher(passcode) {
  if (!state.teacher) throw new Error('No teacher has been set up on this device yet.')
  const hash = await deriveHex(state.teacher.salt, (passcode ?? '').trim())
  if (hash !== state.teacher.hash) throw new Error('That teacher passcode is not right.')
  save({ ...state, teacherUnlocked: true })
}

// Sign out = lock. The teacher record stays so the device still refuses a
// pasted code; signing back in needs the passcode.
export function logoutTeacher() {
  save({ ...state, teacherUnlocked: false })
}

// Hand the device to a different teacher, or recover from a forgotten
// passcode. Only from an unlocked device: the signed-in teacher, or the admin.
export function forgetTeacher() {
  if (!state.adminUnlocked && !state.teacherUnlocked) {
    throw new Error('Sign in first to remove the teacher from this device.')
  }
  save({ ...state, teacher: null, teacherUnlocked: false })
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
