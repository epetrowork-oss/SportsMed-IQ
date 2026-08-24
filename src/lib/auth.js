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
// (share.js). Redeeming one on a device unlocks the Teacher tab there and
// records who the teacher is.

import { useSyncExternalStore } from 'react'
import { toBase64Url, fromBase64UrlBytes, deflate, inflate } from './share.js'

const STORAGE_KEY = 'sportmediq:auth:v1'
const TEACHER_PREFIX = 'SMIQT1.'
const OTHER_PREFIXES = ['SMIQ2.', 'SMIQ1.', 'SMIQA1.', 'SMIQC1.']

export async function sha256Hex(text) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function randomToken(length = 8) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return [...bytes].map((b) => alphabet[b % alphabet.length]).join('')
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
      // { tid, name, redeemedAt } once a teacher code has been redeemed here.
      teacher: parsed.teacher && typeof parsed.teacher === 'object' ? parsed.teacher : null,
      // Codes this device has issued (meaningful on the admin's device only):
      // [{ tid, name, code, issuedAt }]
      issued: Array.isArray(parsed.issued) ? parsed.issued : [],
    }
  } catch {
    return { admin: null, adminUnlocked: false, teacher: null, issued: [] }
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
  const salt = randomToken(8)
  const hash = await sha256Hex(`${salt}:${trimmed}`)
  save({ ...state, admin: { salt, hash }, adminUnlocked: true })
}

export async function loginAdmin(passcode) {
  if (!state.admin) throw new Error('No admin passcode has been set up on this device yet.')
  const hash = await sha256Hex(`${state.admin.salt}:${(passcode ?? '').trim()}`)
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

// Teacher-side: paste an access code to unlock the Teacher tab on this device.
export async function redeemTeacherCode(code) {
  const trimmed = (code ?? '').trim()
  if (!trimmed.startsWith(TEACHER_PREFIX)) {
    if (OTHER_PREFIXES.some((p) => trimmed.startsWith(p))) {
      throw new Error(
        'That is a different kind of SportMedIQ code — a teacher access code starts with SMIQT1.',
      )
    }
    throw new Error('That does not look like a teacher access code (should start with SMIQT1).')
  }
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
  const teacher = {
    tid: data.tid.slice(0, 40),
    name: data.name.trim().slice(0, 60),
    redeemedAt: new Date().toISOString(),
  }
  save({ ...state, teacher })
  return teacher
}

export function logoutTeacher() {
  save({ ...state, teacher: null })
}

// --- React binding ---

function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

// role: 'admin' (passcode entered on this device) beats 'teacher' (access
// code redeemed). null = locked.
export function useAuth() {
  const snapshot = useSyncExternalStore(subscribe, () => state)
  return {
    adminConfigured: !!snapshot.admin,
    role: snapshot.adminUnlocked ? 'admin' : snapshot.teacher ? 'teacher' : null,
    teacher: snapshot.teacher,
    issued: snapshot.issued,
  }
}
