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
import { verifyDevicePasscode, credentialFingerprint, sessionFingerprint } from './auth.js'
import { strandedStores, unverifiedStores, storageAcceptsWrites } from './storageHealth.js'
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

// How many times to re-read before giving up on a stable snapshot. Reads are
// cheap; this only ever fails against a tab writing continuously.
const SNAPSHOT_ATTEMPTS = 5

// A restore writes three stores in sequence, and between those writes the
// device is in a state that is real -- it is on disk -- but is nobody's
// intent. Two equal reads cannot tell that apart from a settled device: a
// restoring tab paused between mergeClasses() and mergeRoster() presents the
// same intermediate combination to both reads, so the snapshot is stable
// because the writer stopped, not because the restore finished. A backup taken
// then holds the new classes with the old progress rows, and the teacher who
// takes it right after restoring has a file missing the thing they just
// restored.
//
// So a restore says out loud that it is running, and an export refuses while
// it is. This is a marker, not a lock: localStorage has no compare-and-set, so
// two tabs restoring at once is still last-writer-wins, and a tab that dies
// mid-restore leaves the marker behind -- which is what the timestamp is for.
// It closes the window it can see and does not pretend to be mutual exclusion.
const RESTORE_MARKER = 'sportmediq:restoreInProgress:v1'
// Long enough that no real restore outlives it, short enough that a crashed
// tab does not block backups for the rest of the day.
const RESTORE_MARKER_TTL_MS = 60000

function markRestoreRunning() {
  try {
    localStorage.setItem(RESTORE_MARKER, String(Date.now()))
  } catch {
    // Storage refusing is already reported by the health machinery; a backup
    // taken during this restore loses the protection, not the warning.
  }
}

function clearRestoreRunning() {
  try {
    localStorage.removeItem(RESTORE_MARKER)
  } catch {
    // Nothing to do: the timestamp expires on its own.
  }
}

function restoreIsRunning() {
  try {
    const at = Number(localStorage.getItem(RESTORE_MARKER))
    if (!at) return false
    // A marker from the future is a clock change, not a live restore.
    return Date.now() - at >= 0 && Date.now() - at < RESTORE_MARKER_TTL_MS
  } catch {
    return false
  }
}

function readStores() {
  return {
    classes: snapshotClasses(),
    roster: snapshotRoster(),
    assignments: snapshotTeacherAssignments(),
  }
}

/**
 * All three stores as they were at one moment, or an error.
 *
 * Three independent reads are three separate moments, and another tab's
 * restore writes classes, then roster rows, then assignments. So the reads can
 * straddle those writes and assemble a device that never existed: the OLD
 * class list with the NEWLY restored roster rows, whose students belong to a
 * class the file does not contain. Restoring that onto a replacement device
 * brings back orphaned progress rows and leaves out the class and PINs they
 * belong to -- and nothing about the session changed, so every other check
 * here passes and the file reports success.
 *
 * localStorage has no transaction, so the same compare-and-retry `commit` uses
 * is the best available: read, read again, and accept only when nothing moved
 * in between. It cannot see a write that landed and was reverted, and it does
 * not pretend to; what it does rule out is the torn payload above. When a tab
 * keeps writing, this refuses rather than returning a file whose contents were
 * never simultaneously true.
 */
function snapshotStores() {
  if (restoreIsRunning()) {
    throw new Error(
      'A restore is running in another tab — wait for it to finish, then save the backup so the file has everything it put back.',
    )
  }
  let taken = readStores()
  for (let attempt = 0; attempt < SNAPSHOT_ATTEMPTS; attempt += 1) {
    const again = readStores()
    if (JSON.stringify(again) === JSON.stringify(taken)) return taken
    taken = again
  }
  throw new Error(
    'Another tab kept changing this device while the backup was being made — nothing was saved. Close the other tabs and try again.',
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
 * `session` is the caller's own reading of who is signed in, taken BEFORE any
 * work it does of its own. A caller that awaits anything first -- reading a
 * file, say -- and lets this capture the session afterwards would bind to
 * whoever is signed in by then, which is exactly the release-and-reprovision
 * this binding exists to catch. The default is correct only for a caller that
 * calls straight away.
 *
 * Returns { text, filename, counts } — the caller downloads `text`.
 */
export async function createBackup(passcode, session = sessionFingerprint()) {
  // Captured BEFORE the verification, not after it. A sign-out during the
  // derivation leaves the credential perfectly valid, so verification
  // succeeds -- and a session read afterwards is the empty string, which the
  // check at the boundary then compares against the empty string and passes.
  // A signed-out device would have handed over every class and plaintext PIN
  // on it. Non-empty is therefore a precondition, not an incidental.
  if (!session) {
    throw new Error('Sign in on this device before saving a backup.')
  }
  const secret = (passcode ?? '').trim()
  // The fingerprint comes back FROM the verification rather than being looked
  // up after it. Re-reading the record here would read it a second time, and
  // another tab replacing the credential in between would leave this holding a
  // fingerprint of the replacement -- which the check below would then confirm,
  // having established nothing about the record the passcode actually matched,
  // and hand out a file encrypted with a passcode that had just been revoked.
  const { role, credential } = await verifyDevicePasscode(secret)
  // Verifying is not the moment of disclosure. Deriving the key, compressing
  // and encrypting are all awaits, and the device's authorization can change
  // during them -- after which returning the file would hand every class on
  // the device out on a session that no longer exists. TWO things have to
  // still hold at the boundary where the data actually leaves, and they are
  // separate: the matched record must still be the matched record, and the
  // device must still be signed in as the same person. A sign-out in another
  // tab changes only the unlocked flags -- the verifier record is untouched --
  // so a credential check alone passes straight through it.

  const stores = snapshotStores()
  // Health AT THE SNAPSHOT, because that is what the file is made of. Reading
  // it at the end instead lets a strand that this payload really is missing
  // disappear before it is reported: another tab persisting exactly the
  // stranded state during encryption clears the strand (round 23), and the
  // late read then says all is well about a file built from the older
  // snapshot. Both readings are kept and OR-ed below -- a strand either side
  // of the snapshot means the file lacks that change.
  const strandedAtSnapshot = strandedStores().length > 0
  const unverifiedAtSnapshot = unverifiedStores().length > 0
  const payload = { ...stores, at: new Date().toISOString() }
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
  if (credentialFingerprint(role) !== credential || sessionFingerprint() !== session) {
    throw new Error(
      "This device's sign-in changed while the backup was being made — nothing was saved. Sign in again and try once more.",
    )
  }

  return {
    text: `${JSON.stringify(file, null, 2)}\n`,
    filename: `sportmediq-backup-${today()}.json`,
    counts,
    // TRUE only when a store in this tab is holding a rejected write RIGHT
    // NOW. The snapshot is read from storage, so that change is provably not
    // in this file. False is NOT a claim that nothing is missing -- what
    // another tab holds in memory cannot be seen from here.
    knownIncomplete: strandedAtSnapshot || strandedStores().length > 0,
    // A refused change this tab can no longer account for. Weaker than
    // `knownIncomplete` on purpose: a later write may have carried it to
    // storage, or may have undone it, and nothing here can tell which -- so
    // this asks the teacher to check rather than telling them it is missing.
    unverifiedChange: unverifiedAtSnapshot || unverifiedStores().length > 0,
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
 * already has is kept (a class gains back only the students it is missing),
 * and an assignment it already has is kept with any difference reported.
 * So restoring onto a device that is already teaching cannot erase work the
 * backup never had, cannot undo a PIN reset made since it, and cannot roll an
 * assignment back to an older version on the strength of another device's
 * clock.
 *
 * `session` is the caller's own reading of who is signed in, taken BEFORE any
 * work it does of its own — see createBackup for why the default is only safe
 * for a caller that calls straight away.
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
export async function restoreBackup(text, passcode, session = sessionFingerprint()) {
  // WHO started this, captured before the slow part. Opening the file is slow,
  // and a release in another tab during it takes the device's credential away
  // AND wipes the stores -- then provisions someone else, at which point the
  // device is unlocked again. "Still unlocked" would therefore be satisfied by
  // a DIFFERENT teacher, and this continuation would write the first
  // teacher's classes and plaintext PINs into the second's freshly set up
  // device, undoing the release entirely. Worse, redeeming a teacher code
  // afterwards is refused precisely because class data exists, so the release
  // would neither erase the data nor leave a device anyone can open. It has to
  // be the same session, not merely a session.
  if (!session) {
    throw new Error('Sign in on this device before restoring a backup.')
  }
  const backup = await readBackup(text, passcode)
  // Checked immediately before the first write, against state re-read now.
  if (sessionFingerprint() !== session) {
    throw new Error(
      'This device was signed out or released while the backup was being opened — nothing was restored. Sign in again and try once more.',
    )
  }
  markRestoreRunning()
  try {
    return mergeAll(backup)
  } finally {
    clearRestoreRunning()
  }
}

// The three merges, in order. Split out only so restoreBackup's marker can
// wrap all of them in one `finally` -- a restore that throws half way must not
// leave the marker behind for the full minute.
function mergeAll(backup) {
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
    // Assignments the two devices disagree about. Kept as they are here and
    // reported, never resolved by timestamp: see mergeTeacherAssignments.
    assignmentConflicts: assignments.conflicts ?? [],
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
