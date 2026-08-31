// Teacher-built assignments ("class codes"): built and generated on the
// teacher's own device. Stored locally so the generated code can be
// re-copied later without re-encoding it. Same simple store pattern as
// roster.js (plain module state + localStorage + useSyncExternalStore).

import { useSyncExternalStore } from 'react'
import { encodeAssignment } from './assignments.js'
import { reportStorageWrite, reportStorageDiscard } from './storageHealth.js'

const STORAGE_KEY = 'sportmediq:teacherAssignments:v1'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return { assignments: Array.isArray(parsed.assignments) ? parsed.assignments : [] }
  } catch {
    return { assignments: [] }
  }
}

let state = load()
const listeners = new Set()
// Whether the most recent write reached localStorage. Read straight from
// the write itself, so nothing has to be inferred by re-reading.
let lastWriteOk = true

function save(next) {
  const held = JSON.stringify(state)
  // Asked BEFORE anything is replaced: is what this tab is holding already
  // written down? Another tab can persist exactly this state and have its
  // `storage` event still queued, in which case the change survived and this
  // commit is not what loses it -- it reads that same state back out of
  // storage and builds on it.
  const heldWasStored = readRaw() === held
  state = next
  const payload = JSON.stringify(state)
  // Replacing state above throws away whatever a refused write was holding
  // here -- `next` came from `load()`, so it cannot contain it. Two exceptions,
  // and both are proved by an exact comparison rather than assumed: the same
  // state is being written again (a retry that preserved it), or storage
  // already had it. All three branches are no-ops when this store was not
  // stranded, which is every ordinary write.
  if (held === payload) {
    // Nothing replaced; this write's own outcome below is the whole story.
  } else if (heldWasStored) {
    reportStorageWrite('assignments', true)
  } else {
    reportStorageDiscard('assignments')
  }
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
  // differs from what a reader will now get. A write whose intent storage
  // already satisfies -- a merge that added nothing, a setting changed back
  // to its current value, an empty store whose key was never written --
  // lost nothing when it was rejected.
  //
  // Compared through `load()`, not against the raw string: `load()` is how
  // every reader here sees storage, so this asks the only question that
  // matters, and an absent key and an empty store come out equal because to
  // a reader they are. Note it is the WHOLE state either way, not a chosen
  // subset: every earlier attempt to infer persistence picked fields to
  // compare and each subset was wrong differently.
  lastWriteOk = landed || JSON.stringify(load()) === payload
  // Health follows the same question the outcome does: is the intended state
  // what a reader now gets? If it is -- because the write landed, or because
  // storage already holds it -- this store has nothing outstanding. If it is
  // not, it does. Anything an EARLIER refused write was holding has already
  // been accounted for by the discard above, which runs first, so clearing
  // here cannot bury it.
  reportStorageWrite('assignments', lastWriteOk)
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

// Encodes {name, unitIds, mode, due?} into a class code (letting
// encodeAssignment's validation errors propagate — they already have
// friendly messages) and upserts the saved entry keyed by case-insensitive
// trimmed name: re-saving the same name replaces the existing entry in
// place (array order preserved) rather than adding a duplicate — same
// semantics as importAssignment in progress.js. Returns the saved entry,
// which also carries the generated `code` so it can be re-copied later
// without re-encoding.
export async function saveTeacherAssignment({ name, unitIds, mode, due }) {
  const createdAt = new Date().toISOString()
  const toEncode = { name, unitIds, mode, createdAt }
  if (due) toEncode.due = due

  const code = await encodeAssignment(toEncode)

  const entry = {
    name: typeof name === 'string' ? name.trim().slice(0, 60) : '',
    unitIds,
    mode,
    createdAt,
    code,
  }
  if (due) entry.due = due

  // Merged into fresh state: encodeAssignment above is async, so another tab
  // may have saved or removed an assignment that this tab has not seen.
  const key = entry.name.toLowerCase()
  commit((cur) => {
    const existingIndex = cur.assignments.findIndex((a) => a.name.trim().toLowerCase() === key)
    const assignments = [...cur.assignments]
    if (existingIndex >= 0) assignments[existingIndex] = entry
    else assignments.push(entry)
    return { assignments }
  })
  return entry
}

export function removeTeacherAssignment(name) {
  const key = name.trim().toLowerCase()
  commit((cur) => ({
    assignments: cur.assignments.filter((a) => a.name.trim().toLowerCase() !== key),
  }))
}

// Two Teacher tabs on one device must not fight over this store. Without
// this, the second tab keeps a stale module-local snapshot and its next write
// persists that whole stale array — silently erasing saved assignments
// saved from the first tab. `storage` fires only in other tabs.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === null || event.key === STORAGE_KEY) {
      const held = JSON.stringify(state)
      state = load()
      // Another tab wrote this store, so this tab's state is replaced. Either
      // it lands on exactly what a refused write here was holding -- in which
      // case the other tab has just saved that very state, and this store has
      // nothing outstanding -- or it does not, and this tab can no longer
      // account for the change. Both are no-ops unless this store was
      // stranded.
      if (held !== JSON.stringify(state)) reportStorageDiscard('assignments')
      else reportStorageWrite('assignments', true)
      listeners.forEach((fn) => fn())
    }
  })
}

// --- backup ---

// Storage is the truth -- see snapshotClasses in classes.js.
export function snapshotTeacherAssignments() {
  return load().assignments
}

// Restores saved assignments, keyed by the same case-insensitive name
// saveTeacherAssignment uses. An entry this device does not have is added; one
// it already has is KEPT, and a difference is reported rather than resolved.
// Returns { added, kept, conflicts, persisted }.
//
// This used to take whichever copy had the later `createdAt`, which was the
// one place here a restore could roll something back. It cannot work: a
// restore is by definition cross-device, `createdAt` is the source device's
// wall clock, and there is no trusted clock between two Chromebooks. A source
// device running ten minutes fast makes every one of its assignments look
// newer, and an older backup then overwrites a genuinely newer local
// assignment -- its units, its due date, and the code already handed out for
// it. Ordering by an untrusted timestamp is a guess, and guessing is what
// every other store here stopped doing.
//
// So the rule is the one the rest of the restore follows: never remove and
// never roll back. A real difference goes to the teacher, who knows which
// device they last edited on.
export function mergeTeacherAssignments(incoming) {
  const list = Array.isArray(incoming) ? incoming.filter((a) => a && typeof a.name === 'string') : []
  let added = 0
  let kept = 0
  let conflicts = []
  const key = (entry) => entry.name.trim().toLowerCase()
  // Compared whole, not on chosen fields: the point is to be sure a kept entry
  // and a discarded one really are the same assignment, and picking which
  // fields count is how that goes wrong.
  const same = (a, b) =>
    JSON.stringify({ unitIds: a.unitIds, mode: a.mode, due: a.due ?? null, code: a.code }) ===
    JSON.stringify({ unitIds: b.unitIds, mode: b.mode, due: b.due ?? null, code: b.code })
  commit((cur) => {
    added = 0
    kept = 0
    conflicts = []
    const assignments = [...cur.assignments]
    for (const entry of list) {
      const at = assignments.findIndex((a) => key(a) === key(entry))
      if (at < 0) {
        assignments.push(entry)
        added += 1
      } else if (same(assignments[at], entry)) {
        kept += 1
      } else {
        kept += 1
        conflicts.push({ name: assignments[at].name })
      }
    }
    return { assignments }
  })
  // The write itself says whether it landed -- see mergeClasses.
  const persisted = lastWriteOk
  return { added, kept, conflicts, persisted }
}

// Wipes this store. Used when a teacher releases the device: their data must
// not outlive the credential that protected it.
export function clearTeacherAssignments() {
  save({ assignments: [] })
}

function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function useTeacherAssignments() {
  return useSyncExternalStore(subscribe, () => state.assignments)
}
