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
// What that does NOT buy is protection independent of the passcode. An
// attacker holding the file guesses against it offline, at their own pace,
// with no lockout and nobody watching; the iteration count prices each guess
// but cannot price a search space small enough to walk. The minimum passcode
// here is six characters, which is well inside that space. So the file is
// only as hard to open as its passcode is to guess — the callers say that,
// name the kind of storage it belongs in, and get `shortPasscode` below to
// flag the one part of it the code can actually see. Only that part: a short
// passcode is worth saying out loud, but a long one is not evidence of
// anything, and nothing here treats it as such.
//
// What it does NOT carry is the device's credentials. A backup restores a
// teacher's *work*, never their identity: signing in on the new device is
// still a deliberate setup step (admin passcode, or a teacher access code),
// so a copied file can never provision an admin by itself.

import { toBase64Url, fromBase64UrlBytes, deflate, inflate } from './share.js'
import { verifyDevicePasscode, credentialFingerprint, deviceIsUnlocked } from './auth.js'
import { storageIsFailing, storageAcceptsWrites } from './storageHealth.js'
import { snapshotClasses, mergeClasses } from './classes.js'
import { snapshotRoster, mergeRoster } from './roster.js'
import { snapshotTeacherAssignments, mergeTeacherAssignments } from './teacherAssignments.js'

const FORMAT = 'sportmediq-backup'
const VERSION = 1
// Same cost as the passcode and PIN derivations: enough that guessing at the
// file is slow, few enough that a Chromebook makes the backup in a moment.
const KDF_ITERATIONS = 150000
// A length, and nothing more. Composition is deliberately not scored: a rule
// that called `Passw0rd!` strong would be the same overclaim the whole file
// is written against. Which means the threshold works in one direction only.
// Under it, the space is small enough that guessing is worth warning about
// whatever the characters are. Over it, NOTHING follows: `passwordpassword`
// is 16 characters and trivially guessed, and an 11-character random secret
// is not enumerable at all. So this measures shortness, is named for
// shortness, and its false case is read as "nothing to say", never as "fine".
const SHORT_PASSCODE = 12

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
  const role = await verifyDevicePasscode(secret)
  // Verifying is not the moment of disclosure. Deriving the key, compressing
  // and encrypting are all awaits, and an admin can release the teacher
  // during them -- after which returning the file would hand every class on
  // the device out on a credential that no longer exists. The matched record
  // has to still be the matched record at the boundary where the data
  // actually leaves, so it is fingerprinted here and re-checked below.
  const credential = credentialFingerprint(role)

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
  if (credentialFingerprint(role) !== credential) {
    throw new Error(
      "This device's sign-in changed while the backup was being made — nothing was saved. Sign in again and try once more.",
    )
  }

  return {
    text: `${JSON.stringify(file, null, 2)}\n`,
    filename: `sportmediq-backup-${today()}.json`,
    counts,
    // TRUE only when a store in this tab has actually had a write rejected.
    // The snapshot is read from storage, so a change that never reached
    // storage is provably not in this file. False is NOT a claim that nothing
    // is missing -- what another tab holds in memory cannot be seen from here.
    knownIncomplete: storageIsFailing(),
    // A separate and weaker fact: storage refused a probe write just now.
    // That establishes the browser is in trouble, not that this payload lost
    // anything -- the probe is one byte and quota rejection is size-dependent,
    // so it can fail while every real write landed, and pass while a large one
    // elsewhere did not. Reported as a risk, never as a finding.
    storageRefusing: !storageAcceptsWrites(),
    // Whether the secret this file was just sealed with is SHORT. True is a
    // reason to warn; false says only that this one check found nothing, not
    // that the passcode is strong -- see SHORT_PASSCODE above. Knowable here
    // and nowhere else: the passcode is not stored, so this call is the only
    // moment anything can say even this much.
    shortPasscode: secret.length < SHORT_PASSCODE,
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
 * A restore never removes and never rolls back: a class, roster row or
 * assignment this device does not have is taken from the backup, and one it
 * already has is kept (a class gains back only the students it is missing).
 * So restoring onto a device that is already teaching cannot erase work the
 * backup never had, and cannot undo a PIN reset made since it.
 *
 * Returns { at, classes, students, assignments, conflicts, persisted } with
 * { added, updated } counts per kind (and `skipped` for roster rows held back
 * by a conflict), so the teacher is told what landed.
 *
 * `persisted` is false when a merge did not reach localStorage. The stores
 * swallow a rejected write on purpose -- keeping it in memory means the
 * dashboard still works for the rest of the session -- but a restore that
 * reports success and vanishes on reload is a lie the teacher would only
 * discover after throwing the file away. Every caller must show that.
 */
export async function restoreBackup(text, passcode) {
  const backup = await readBackup(text, passcode)
  // Opening the file is slow, and a release in another tab during it takes
  // the device's credential away AND wipes the stores. Writing now would
  // repopulate them with classes and plaintext PINs that nothing guards --
  // and worse, redeeming a teacher code afterwards is refused precisely
  // because class data exists, so the release would neither erase the data
  // nor leave a device anyone can open. Checked immediately before the first
  // write, against state re-read now.
  if (!deviceIsUnlocked()) {
    throw new Error(
      'This device was signed out or released while the backup was being opened — nothing was restored. Sign in again and try once more.',
    )
  }
  const classes = mergeClasses(backup.classes)
  // A student ID the class merge refused to guess about must be refused here
  // too. Roster rows key by exactly that (class, student) pair, so restoring
  // one would file the backup student's name and progress under whoever holds
  // that ID on this device -- settling in one store the question the other
  // deliberately declined to answer.
  const students = mergeRoster(
    backup.roster,
    new Set(classes.conflicts.map((c) => `${c.cid}:${c.sid}`)),
  )
  const assignments = mergeTeacherAssignments(backup.assignments)
  return {
    at: backup.at,
    classes,
    students,
    assignments,
    // Students the restore would not guess about: same student ID, different
    // person, which happens when two devices both restored a class and each
    // added someone next. Reported rather than silently dropped.
    conflicts: classes.conflicts ?? [],
    // Login names that now stand for two students in one class -- legitimate
    // after a restore, but the sign-in list cannot tell them apart on name
    // alone, so the teacher has to know.
    duplicateNames: classes.duplicateNames ?? [],
    // Any one store failing to write leaves the device partly restored, which
    // is exactly the state the teacher must not mistake for a finished one.
    persisted: classes.persisted && students.persisted && assignments.persisted,
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
