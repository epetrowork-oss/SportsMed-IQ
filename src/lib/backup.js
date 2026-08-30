// Backing up a teacher's device.
//
// Everything a teacher has lives in one browser's localStorage on one
// device: the classes, the roster with the plain PINs that let credential
// slips be reprinted, the content settings, the imported student progress.
// With no server behind it, a wiped Chromebook or a replaced laptop takes a
// semester of that with it and there is nothing to restore from. This is the
// restore-from.
//
// The file is **encrypted with the device's own passcode** — AES-GCM with a
// PBKDF2 key, the same derivation the passcode and PIN verifiers already use.
// That matters: a plain backup would be a file listing every student's login
// name and PIN, sitting in a Downloads folder or a Drive share. It costs the
// teacher no new secret to remember, because it is the passcode they already
// sign in with — the one they wrote down when they set the device up.
//
// What it does NOT carry is the device's credentials. A backup restores a
// teacher's *work*, never their identity: signing in on the new device is
// still a deliberate setup step (admin passcode, or a teacher access code),
// so a copied file can never provision an admin by itself.

import { toBase64Url, fromBase64UrlBytes, deflate, inflate } from './share.js'
import { verifyDevicePasscode } from './auth.js'
import { snapshotClasses, mergeClasses } from './classes.js'
import { snapshotRoster, mergeRoster } from './roster.js'
import { snapshotTeacherAssignments, mergeTeacherAssignments } from './teacherAssignments.js'

const FORMAT = 'sportmediq-backup'
const VERSION = 1
// Same cost as the passcode and PIN derivations: enough that guessing at the
// file is slow, few enough that a Chromebook makes the backup in a moment.
const KDF_ITERATIONS = 150000

function randomBytes(length) {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return bytes
}

async function deriveAesKey(salt, passcode) {
  const base = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passcode),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: KDF_ITERATIONS, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

function today() {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

/**
 * Builds an encrypted backup of this device's teaching data.
 *
 * The passcode is verified against the device's own verifier first, so a
 * mistyped one is refused here rather than quietly producing a file that
 * cannot be opened again.
 *
 * Returns { text, filename, counts } — the caller downloads `text`.
 */
export async function createBackup(passcode) {
  const secret = (passcode ?? '').trim()
  await verifyDevicePasscode(secret)

  const payload = {
    classes: snapshotClasses(),
    roster: snapshotRoster(),
    assignments: snapshotTeacherAssignments(),
    at: new Date().toISOString(),
  }
  const counts = {
    classes: payload.classes.length,
    students: payload.classes.reduce((n, c) => n + (c.students?.length ?? 0), 0),
    rosterRows: payload.roster.length,
    assignments: payload.assignments.length,
  }
  if (counts.classes === 0 && counts.rosterRows === 0 && counts.assignments === 0) {
    throw new Error('There is nothing on this device to back up yet.')
  }

  const salt = randomBytes(16)
  const iv = randomBytes(12)
  const key = await deriveAesKey(salt, secret)
  const compressed = await deflate(new TextEncoder().encode(JSON.stringify(payload)))
  const sealed = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, compressed),
  )

  const file = {
    format: FORMAT,
    v: VERSION,
    // Plaintext so a future version can read an old file, and so a teacher
    // can tell which device and day a file came from without opening it.
    // Deliberately nothing about students out here.
    at: payload.at,
    kdf: { name: 'PBKDF2-SHA256', iterations: KDF_ITERATIONS, salt: toBase64Url(salt) },
    iv: toBase64Url(iv),
    data: toBase64Url(sealed),
  }
  return {
    text: `${JSON.stringify(file, null, 2)}\n`,
    filename: `sportmediq-backup-${today()}.json`,
    counts,
  }
}

// Parses and decrypts, without writing anything. Every failure mode gets its
// own message: a teacher holding the wrong file should not be told their
// passcode is wrong.
export async function readBackup(text, passcode) {
  let file
  try {
    file = JSON.parse(text)
  } catch {
    throw new Error("That file isn't a SportMedIQ backup — pick the .json file the app saved.")
  }
  if (!file || file.format !== FORMAT) {
    throw new Error("That file isn't a SportMedIQ backup — pick the .json file the app saved.")
  }
  if (file.v !== VERSION) {
    throw new Error(`That backup was made by a newer version of the app (format ${file.v}).`)
  }
  if (!file.kdf?.salt || !file.iv || !file.data) {
    throw new Error('That backup file is incomplete — it may have been truncated when copied.')
  }

  const secret = (passcode ?? '').trim()
  if (!secret) throw new Error('Type the passcode the backup was made with.')

  const key = await deriveAesKey(
    fromBase64UrlBytes(file.kdf.salt),
    secret,
  )
  let plain
  try {
    // AES-GCM authenticates as it decrypts, so this same failure covers a
    // wrong passcode and a tampered file. Nothing is written either way.
    const opened = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: fromBase64UrlBytes(file.iv) },
      key,
      fromBase64UrlBytes(file.data),
    )
    plain = JSON.parse(new TextDecoder().decode(await inflate(new Uint8Array(opened))))
  } catch {
    throw new Error(
      "That passcode doesn't open this backup. Use the passcode from the device it was made on.",
    )
  }
  return {
    at: typeof plain.at === 'string' ? plain.at : file.at,
    classes: Array.isArray(plain.classes) ? plain.classes : [],
    roster: Array.isArray(plain.roster) ? plain.roster : [],
    assignments: Array.isArray(plain.assignments) ? plain.assignments : [],
  }
}

/**
 * Decrypts and merges a backup into this device.
 *
 * Merges rather than replaces: classes upsert by class id, roster rows by
 * student id, assignments by name. Restoring onto a device that is already
 * teaching adds what is missing and refreshes what matches, instead of
 * throwing away work that was never in the backup.
 *
 * Returns { at, classes, students, assignments } with { added, replaced }
 * counts, so the teacher is told what actually landed.
 */
export async function restoreBackup(text, passcode) {
  const backup = await readBackup(text, passcode)
  return {
    at: backup.at,
    classes: mergeClasses(backup.classes),
    students: mergeRoster(backup.roster),
    assignments: mergeTeacherAssignments(backup.assignments),
  }
}

// Hands the file to the browser. Kept beside the format so the download and
// the filename stay together.
export function downloadBackup({ text, filename }) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  // Revoke on the next turn: revoking synchronously can beat the download in
  // some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
