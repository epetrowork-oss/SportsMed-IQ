// Teacher roster: real students added by pasting their progress codes.
// Stored on the teacher's device in localStorage, same simple store pattern
// as progress.js. Re-importing a code for the same student name updates
// that student's row.

import { useSyncExternalStore } from 'react'
import { decodeProgressCode } from './share.js'
import { reportStorageWrite } from './storageHealth.js'

const STORAGE_KEY = 'sportmediq:roster:v1'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return { students: Array.isArray(parsed.students) ? parsed.students : [] }
  } catch {
    return { students: [] }
  }
}

let state = load()
const listeners = new Set()
// Whether the most recent write reached localStorage. Read straight from
// the write itself, so nothing has to be inferred by re-reading.
let lastWriteOk = true

function save(next) {
  state = next
  const payload = JSON.stringify(state)
  // Storage full or blocked — keep working in memory for the rest of the
  // session, but say so. Silence here is what let a teacher build a whole
  // class, and a backup of it, on top of writes that never happened.
  let landed = false
  try {
    localStorage.setItem(STORAGE_KEY, payload)
    landed = true
  } catch {
    // refused
  }
  // A refused write only STRANDS something if what it was trying to write
  // differs from what is already stored. A write whose payload storage
  // already holds -- a merge that added nothing, a setting changed back to
  // its current value -- lost nothing when it was rejected. Note this is the
  // WHOLE payload, not a chosen subset: every earlier attempt to infer
  // persistence by re-reading picked fields to compare and got it wrong.
  lastWriteOk = landed || readRaw() === payload
  // Health is a different question from this write's outcome, and the three
  // cases are not two. A write that landed clears the store. A write that was
  // refused and stranded something marks it. A write that was refused and
  // stranded NOTHING says nothing at all -- it must not mark the store,
  // because nothing is missing, and it must not clear it either, because it
  // never reached storage and cannot vouch for an earlier change that did not
  // either.
  if (landed) reportStorageWrite('roster', true)
  else if (!lastWriteOk) reportStorageWrite('roster', false)
  listeners.forEach((fn) => fn())
}

// Every write goes through this, and `updater` receives state re-read from
// localStorage — never a snapshot captured before an await. Between a read and
// a write another tab can complete a change this tab has not seen yet
// (`storage` events are asynchronous), and spreading the old snapshot would
// silently revert it. The updater may throw to abort.
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

function hasGamificationData(value) {
  if (!value || typeof value !== 'object') return false
  return (Array.isArray(value.activeDates) && value.activeDates.length > 0)
    || (Array.isArray(value.seenBadgeIds) && value.seenBadgeIds.length > 0)
    || (value.practicals && typeof value.practicals === 'object' && Object.keys(value.practicals).length > 0)
}

// Decodes the code and upserts the student. Codes exported under a class
// login carry the student ID + class ID, so those match by sid (a student
// whose login name the teacher renames still lands on the same row);
// everything else falls back to the old case-insensitive name match.
// Throws a user-readable error for bad codes or missing names.
//
// The returned object carries `mergedLegacyRow` when the import adopted a
// pre-class-login row (see below). It is on the returned copy only, never on
// what is stored, so it exists to be reported to the teacher once and then
// forgotten.
export async function addStudentFromCode(code) {
  const { name, units, gamification, at, sid, cid } = await decodeProgressCode(code)
  if (!name) {
    throw new Error(
      'This code has no student name — ask the student to enter their name on the Sync page first.',
    )
  }
  // Resolved against fresh state inside the commit: decoding above is async,
  // and another tab may have added or removed a student meanwhile — writing
  // this tab's whole array back would erase them.
  let student = null
  let mergedLegacyRow = false
  commit((cur) => {
    // Match by student ID when the code carries one, and DO NOT fall back to
    // the name in that case: two students called "Alex" in different classes
    // are different people, and matching them by name would make the second
    // import overwrite the first one's row and progress. The name fallback
    // exists only for legacy codes, which have no ids to match on.
    const byId = sid
      ? cur.students.find((s) => s.sid === sid && (!cid || !s.cid || s.cid === cid))
      : null

    // One exception, for devices upgraded from a build that predates class
    // logins: those rows have no ids at all, so the student's first modern
    // code would add a second row and split their history in two. Such a row
    // can be adopted -- but only when the name picks it out beyond doubt:
    // exactly one row on the whole roster carries this name, and that row is
    // itself a legacy one. If any second row shares the name, there is no way
    // to tell whose old work it is, so the duplicate stands rather than
    // guessing and attributing one student's semester to another.
    const sameName = cur.students.filter((s) => s.name.toLowerCase() === name.toLowerCase())
    const adoptable =
      sid && !byId && sameName.length === 1 && !sameName[0].sid && !sameName[0].cid
        ? sameName[0]
        : null
    mergedLegacyRow = !!adoptable

    const existing = sid
      ? byId ?? adoptable
      : cur.students.find((s) => s.name.toLowerCase() === name.toLowerCase() && !s.sid)
    student = {
      id: existing?.id ?? `stu-${Date.now().toString(36)}`,
      name,
      sid: sid ?? existing?.sid ?? null,
      cid: cid ?? existing?.cid ?? null,
      progress: units,
      // Legacy codes decode to an empty gamification shape. Do not let that
      // erase richer data already stored for the same student on this device.
      gamification: hasGamificationData(gamification)
        ? gamification
        : existing?.gamification ?? gamification,
      updatedAt: at ?? Date.now(),
    }
    return {
      students: [...cur.students.filter((s) => s.id !== student.id), student].sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    }
  })
  return { ...student, mergedLegacyRow }
}

export function removeStudent(id) {
  commit((cur) => ({ students: cur.students.filter((s) => s.id !== id) }))
}

// Two Teacher tabs on one device must not fight over this store. Without
// this, the second tab keeps a stale module-local snapshot and its next write
// persists that whole stale array — silently erasing the imported student roster
// saved from the first tab. `storage` fires only in other tabs.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === null || event.key === STORAGE_KEY) {
      state = load()
      listeners.forEach((fn) => fn())
    }
  })
}

// --- backup ---

// Storage is the truth -- see snapshotClasses in classes.js for why a union
// with module state cannot be.
export function snapshotRoster() {
  return load().students
}

/**
 * Restores imported student rows from a backup.
 *
 * A row this device already holds is never overwritten -- the restore only
 * adds rows the device is missing. That is the whole rule, and it is stated
 * that way because every attempt to be cleverer here has been wrong: rows key
 * by (class, student), a key that two devices restored from one class could
 * both issue to different people, and no field on a roster row says which
 * person it is. Comparing timestamps let the backup file one student's
 * progress under another's name; consulting the class store's conflicts
 * covered that only while the device still HAD the class, and missed a
 * retained row for a class it had deleted.
 *
 * Never overwriting needs none of that reasoning and cannot be wrong in that
 * direction. What it costs is a genuinely newer row in the backup not
 * refreshing an older one here, which is recoverable in one step: these rows
 * are a cache of a student's exported progress code, and re-importing the
 * code is the normal way to update one.
 *
 * `skip` carries the (cid, sid) pairs the class merge refused to guess about,
 * used only to tell the teacher which held-back rows were a real collision
 * rather than an ordinary duplicate.
 *
 * Returns { added, kept, skipped, persisted }.
 */
export function mergeRoster(incoming, skip = new Set()) {
  const list = Array.isArray(incoming) ? incoming.filter((s) => s && typeof s.name === 'string') : []
  let added = 0
  let kept = 0
  let skipped = 0
  const keyOf = (row) => (row.sid ? `sid:${row.cid ?? ''}:${row.sid}` : `id:${row.id}`)
  commit((cur) => {
    added = 0
    kept = 0
    skipped = 0
    const byKey = new Map(cur.students.map((row) => [keyOf(row), row]))
    for (const row of list) {
      // The refusal comes first, before anything is inserted. A conflicted
      // (class, student) pair means the class store found two people behind
      // that ID, and this device may hold no roster row for its one yet --
      // in which case an insert is not "adding a row the device is missing",
      // it is filing the backup student's name and progress under the key
      // that belongs to the other one, where the device student's next
      // progress import would then land on top of it.
      if (row.sid && skip.has(`${row.cid ?? ''}:${row.sid}`)) {
        skipped += 1
        continue
      }
      const key = keyOf(row)
      if (!byKey.has(key)) {
        byKey.set(key, row)
        added += 1
        continue
      }
      kept += 1
    }
    return {
      students: [...byKey.values()].sort((a, b) => a.name.localeCompare(b.name)),
    }
  })
  const persisted = lastWriteOk
  return { added, kept, skipped, persisted }
}

// Wipes this store. Used when a teacher releases the device: their data must
// not outlive the credential that protected it.
export function clearRoster() {
  save({ students: [] })
}

function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function useRoster() {
  return useSyncExternalStore(subscribe, () => state)
}
