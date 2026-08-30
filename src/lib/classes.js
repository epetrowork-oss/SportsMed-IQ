// Teacher-side classes: the teacher creates a class, adds students by a
// login name of their choosing (first names, nicknames, seat numbers —
// anonymity is the point), and the app generates each student a unique
// student ID and a short PIN (a friendly word + two digits, e.g. MAPLE42).
//
// The whole class is shared with students as ONE class login code
// ("SMIQC1." + base64url(deflate-raw(JSON)), same plumbing as share.js).
// The code carries the roster with *hashed* PINs plus the class's content
// controls, so a student device can verify a login and apply the teacher's
// settings completely offline. Plain PINs live only here, on the teacher's
// own device, so the credential sheet can be re-printed.
//
// Content controls per class (settings):
//   units:       null = whole library visible, or an array of unit ids the
//                teacher has opened up so far.
//   quizzes:     false hides/blocks quizzes until the teacher enables them.
//   assignments: false hides the assignment queue / class-code entry so
//                students aren't shown assignment machinery before it's used.
//
// Changing students or settings clears the stored code: the teacher must
// regenerate and re-share it, which is how changes reach student devices in
// a no-server world.

import { useSyncExternalStore } from 'react'
import { toBase64Url, deflate } from './share.js'
import { deriveHex, randomToken } from './auth.js'
import { getUnit } from '../content/index.js'
import { reportStorageWrite } from './storageHealth.js'

const STORAGE_KEY = 'sportmediq:classes:v1'
export const CLASS_CODE_PREFIX = 'SMIQC1.'

// Classroom-safe 4-5 letter words. Word + 2 digits stays easy to read aloud
// and type, but keep in mind what the size of this list buys: the class code
// hands every student a verifier for every classmate's PIN, so the PIN space
// is the ceiling on how much guessing that costs. 256 words x 90 numbers =
// 23,040 combinations, and hashPin below deliberately makes each guess slow.
// Shrinking this list, or moving to a fast hash, breaks that assumption.
const PIN_WORDS = [
  'ACORN', 'AMBER', 'ANKLE', 'APPLE', 'APRON', 'ARBOR', 'ARENA', 'ARROW',
  'ASPEN', 'ATLAS', 'AUDIO', 'AWARD', 'BACON', 'BADGE', 'BAGEL', 'BAKER',
  'BANJO', 'BARGE', 'BASIL', 'BASIN', 'BEACH', 'BEADS', 'BEAM', 'BEAN',
  'BENCH', 'BERRY', 'BIRCH', 'BISON', 'BLAZE', 'BLEND', 'BLIMP', 'BLOOM',
  'BOARD', 'BOAT', 'BONUS', 'BOOTS', 'BRAID', 'BRAIN', 'BRAVE', 'BREAD',
  'BRICK', 'BRISK', 'BROOK', 'BROOM', 'BRUSH', 'BUDDY', 'BUGLE', 'BUNCH',
  'CABIN', 'CAMEL', 'CANOE', 'CARGO', 'CAROL', 'CEDAR', 'CHAIR', 'CHALK',
  'CHARM', 'CHART', 'CHASE', 'CHEER', 'CHESS', 'CHIME', 'CHIRP', 'CHOIR',
  'CIDER', 'CIVIC', 'CLAMP', 'CLASP', 'CLEAN', 'CLEAR', 'CLEAT', 'CLIFF',
  'CLIMB', 'CLOAK', 'CLOCK', 'CLOUD', 'CLOVE', 'COACH', 'COAST', 'COCOA',
  'COMET', 'COMMA', 'CORAL', 'COUCH', 'COURT', 'COVER', 'CRANE', 'CRATE',
  'CREEK', 'CREST', 'CRISP', 'CROWN', 'CURVE', 'CYCLE', 'DAISY', 'DANCE',
  'DELTA', 'DEPTH', 'DESK', 'DIARY', 'DIGIT', 'DINER', 'DITCH', 'DIVER',
  'DOZEN', 'DRAFT', 'DRAKE', 'DRESS', 'DRIFT', 'DRILL', 'DRUM', 'DUNE',
  'EAGLE', 'EARTH', 'EASEL', 'EAST', 'EBONY', 'ECHO', 'EDGE', 'EIGHT',
  'ELBOW', 'EMBER', 'ENTRY', 'EQUAL', 'EVENT', 'EXTRA', 'FABLE', 'FANCY',
  'FERRY', 'FIELD', 'FILM', 'FINCH', 'FIRST', 'FLAME', 'FLARE', 'FLASK',
  'FLEET', 'FLINT', 'FLOAT', 'FLOOR', 'FLUTE', 'FOCUS', 'FORGE', 'FRAME',
  'FROND', 'FROST', 'FRUIT', 'GABLE', 'GAUGE', 'GLASS', 'GLIDE', 'GLOBE',
  'GLOVE', 'GRAIN', 'GRAND', 'GRAPE', 'GRASS', 'GRAVY', 'GREEN', 'GRILL',
  'GROVE', 'GUIDE', 'HABIT', 'HANDY', 'HAPPY', 'HARP', 'HAVEN', 'HAZEL',
  'HEART', 'HEDGE', 'HELIX', 'HILL', 'HONEY', 'HORSE', 'HOTEL', 'HOUSE',
  'HUMID', 'HUMOR', 'ICING', 'IDEAL', 'IGLOO', 'INDEX', 'INLET', 'IRON',
  'IVORY', 'JELLY', 'JEWEL', 'JOLLY', 'JOUST', 'JUICE', 'KAYAK', 'KNEE',
  'KNOT', 'LABEL', 'LAKE', 'LANCE', 'LARCH', 'LASER', 'LATCH', 'LEAF',
  'LEDGE', 'LEMON', 'LEVEL', 'LIGHT', 'LILAC', 'LIMIT', 'LINEN', 'LLAMA',
  'LOCAL', 'LODGE', 'LOTUS', 'LOYAL', 'LUCKY', 'LUNAR', 'LUNCH', 'LYRIC',
  'MAGIC', 'MAJOR', 'MANGO', 'MAPLE', 'MARCH', 'MARSH', 'MEDAL', 'MELON',
  'MERIT', 'METAL', 'METER', 'MINT', 'MIXER', 'MODEL', 'MOTOR', 'MOUNT',
  'MOUSE', 'MOVIE', 'MUSIC', 'NERVE', 'NOBLE', 'NORTH', 'NOTCH', 'NOVEL',
  'OASIS', 'OCEAN', 'OLIVE', 'ONION', 'OPERA', 'ORBIT', 'ORGAN', 'OTTER',
  'OUNCE', 'OVAL', 'OXIDE', 'PANDA', 'PAPER', 'PARK', 'PASTA', 'PATCH',
]

// Unbiased pick from `range` (rejection sampling — `byte % range` would skew
// toward low values whenever range doesn't divide 256).
function randomBelow(range) {
  const limit = Math.floor(256 / range) * range
  const byte = new Uint8Array(1)
  do {
    crypto.getRandomValues(byte)
  } while (byte[0] >= limit)
  return byte[0] % range
}

export function generatePin() {
  return `${PIN_WORDS[randomBelow(PIN_WORDS.length)]}${10 + randomBelow(90)}`
}

export function normalizePin(pin) {
  return (pin ?? '').toUpperCase().replace(/\s+/g, '')
}

export async function hashPin(salt, pin) {
  // PBKDF2, not a plain digest: these verifiers travel to every student in
  // the class inside the class code, so each guess must cost real time. See
  // the note on PIN_WORDS above and docs/ACCOUNTS.md for the threat model.
  return deriveHex(salt, normalizePin(pin))
}

const defaultSettings = () => ({ units: null, quizzes: true, assignments: true })

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

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return { classes: Array.isArray(parsed.classes) ? parsed.classes : [] }
  } catch {
    return { classes: [] }
  }
}

let state = load()
const listeners = new Set()
// Whether the most recent write reached localStorage. Read straight from
// the write itself, so nothing has to be inferred by re-reading.
let lastWriteOk = true

function save(next) {
  state = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    lastWriteOk = true
  } catch {
    // Storage full or blocked — keep working in memory for the rest of the
    // session, but say so. Silence here is what let a teacher build a whole
    // class, and a backup of it, on top of writes that never happened.
    lastWriteOk = false
  }
  reportStorageWrite(lastWriteOk)
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

// Every mutation bumps `rev`. buildClassLoginCode captures it before its
// hashing awaits and refuses to publish if it moved, so a code can never be
// attached to a roster that changed while it was being built.
function updateClass(cid, updater) {
  let next = null
  commit((cur) => {
    const cls = cur.classes.find((c) => c.cid === cid)
    if (!cls) throw new Error('That class no longer exists on this device.')
    next = { ...updater(cls), rev: (cls.rev ?? 0) + 1 }
    return { ...cur, classes: cur.classes.map((c) => (c.cid === cid ? next : c)) }
  })
  return next
}

// Roster or settings changed → the last generated code no longer matches
// what students should have. Clearing it makes the UI ask for a regenerate.
function withStaleCode(cls, patch) {
  return { ...cls, ...patch, code: '', codeAt: null }
}

// Student IDs read like "P3-01": a short prefix from the class name + a
// per-class sequence number. Unique within the class; combined with the
// class id they are unique everywhere.
function idPrefix(className) {
  const letters = className
    .split(/\s+/)
    .map((word) => word.replace(/[^a-zA-Z0-9]/g, '').charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 4)
  return letters || 'STU'
}

// --- mutations ---

export function createClass(name) {
  const trimmed = (name ?? '').trim().slice(0, 60)
  if (!trimmed) throw new Error('Give the class a name.')
  if (load().classes.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
    throw new Error('A class with that name already exists.')
  }
  const cls = {
    cid: `c-${randomToken(6)}`,
    name: trimmed,
    createdAt: new Date().toISOString(),
    rev: 0,
    seq: 0,
    students: [], // [{ sid, name, pin, createdAt }]
    settings: defaultSettings(),
    code: '',
    codeAt: null,
  }
  commit((cur) => ({ ...cur, classes: [...cur.classes, cls] }))
  return cls
}

export function removeClass(cid) {
  commit((cur) => ({ ...cur, classes: cur.classes.filter((c) => c.cid !== cid) }))
}

export function addStudent(cid, loginName) {
  const name = (loginName ?? '').trim().slice(0, 40)
  if (!name) throw new Error('Enter a login name for the student.')
  return updateClass(cid, (cls) => {
    if (cls.students.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      throw new Error(`"${name}" is already in this class — pick a different login name.`)
    }
    const seq = (cls.seq ?? cls.students.length) + 1
    const sid = `${idPrefix(cls.name)}-${String(seq).padStart(2, '0')}`
    // The salt is per student and permanent — never regenerated when a code
    // is rebuilt or a PIN is reset. A student who changes PIN can then still
    // recompute the key of their old progress profile by typing their old PIN
    // (see progress.js); a rotating salt would strand that work forever.
    const student = {
      sid,
      name,
      pin: generatePin(),
      salt: randomToken(6),
      createdAt: new Date().toISOString(),
    }
    return withStaleCode(cls, { seq, students: [...cls.students, student] })
  }).students.at(-1)
}

export function removeStudentFromClass(cid, sid) {
  updateClass(cid, (cls) =>
    withStaleCode(cls, { students: cls.students.filter((s) => s.sid !== sid) }),
  )
}

export function resetStudentPin(cid, sid) {
  return updateClass(cid, (cls) =>
    withStaleCode(cls, {
      // Salt deliberately preserved — see addStudent.
      students: cls.students.map((s) => (s.sid === sid ? { ...s, pin: generatePin() } : s)),
    }),
  ).students.find((s) => s.sid === sid)
}

export function updateClassSettings(cid, patch) {
  updateClass(cid, (cls) =>
    withStaleCode(cls, { settings: normalizeSettings({ ...normalizeSettings(cls.settings), ...patch }) }),
  )
}

// --- the class login code ---

// Encodes the class for students: roster with hashed PINs + settings. Also
// stores the code on the class so it can be re-copied without re-encoding.
export async function buildClassLoginCode(cid) {
  const initial = state.classes.find((c) => c.cid === cid)
  if (!initial) throw new Error('That class no longer exists on this device.')
  if (initial.students.length === 0) throw new Error('Add at least one student first.')

  // Back-fill any missing salt BEFORE the hashing awaits, so the roster this
  // code is built from is already the one that will be stored.
  if (initial.students.some((s) => !s.salt)) {
    updateClass(cid, (c) => ({
      ...c,
      students: c.students.map((s) => ({ ...s, salt: s.salt || randomToken(6) })),
    }))
  }

  const cls = state.classes.find((c) => c.cid === cid)
  const rev = cls.rev ?? 0

  const settings = normalizeSettings(cls.settings)
  // Drop unit ids that no longer exist in this app version rather than
  // shipping dead references to student devices.
  if (settings.units) settings.units = settings.units.filter((id) => getUnit(id) !== null)

  const students = await Promise.all(
    cls.students.map(async (s) => ({
      sid: s.sid,
      name: s.name,
      salt: s.salt,
      hash: await hashPin(s.salt, s.pin),
    })),
  )

  // Those hashes took real time (PBKDF2 per student), and another Teacher tab
  // may have reset a PIN or removed someone meanwhile — the storage listener
  // would have replaced `state` while `cls` stayed the old snapshot. Publishing
  // now would attach a code built from the old roster to the new class: a
  // credential sheet showing one PIN while the code accepts another, or a
  // removed student still able to sign in.
  const current = state.classes.find((c) => c.cid === cid)
  if (!current) throw new Error('That class no longer exists on this device.')
  if ((current.rev ?? 0) !== rev) {
    throw new Error('This class changed in another tab while the code was being built — generate it again.')
  }

  const payload = {
    v: 1,
    cid: cls.cid,
    name: cls.name,
    settings,
    students,
    at: new Date().toISOString(),
  }
  const compressed = await deflate(new TextEncoder().encode(JSON.stringify(payload)))
  const code = CLASS_CODE_PREFIX + toBase64Url(compressed)
  // Compression is another await, so re-check the revision once more: the
  // class must not have changed between the hashing check and publishing.
  updateClass(cid, (c) => {
    if ((c.rev ?? 0) !== rev) {
      throw new Error('This class changed in another tab while the code was being built — generate it again.')
    }
    return { ...c, code, codeAt: payload.at }
  })
  return code
}

// --- sharing the code ---

// The query key the join link carries the class code in.
export const JOIN_PARAM = 'c'

// The class login code as a link a student can tap instead of pasting 1,500
// characters by hand. There is no server to shorten it against, so the link
// is long by construction — the QR code beside it on the dashboard is the
// answer to that, since nobody has to read a QR by eye.
export function classJoinUrl(code, origin) {
  if (!code) return ''
  const host = origin ?? (typeof window === 'undefined' ? '' : window.location.origin)
  const path = import.meta.env?.BASE_URL ?? '/'
  return `${host}${path}#/login?${JOIN_PARAM}=${encodeURIComponent(code)}`
}

// Plain-text credential sheet the teacher can copy into a doc, print, and
// cut into slips. One line per student.
export function credentialSheetText(cls) {
  const header = `${cls.name} — SportMedIQ logins\nLogin name · Student ID · PIN\n`
  const lines = cls.students.map((s) => `${s.name} · ${s.sid} · ${s.pin}`)
  return header + lines.join('\n')
}

// --- React binding ---

// Two Teacher tabs on one device must not fight over this store. Without
// this, the second tab keeps a stale module-local snapshot and its next write
// persists that whole stale array — silently erasing classes, rosters and PINs
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

// What the backup is built from. Storage is the truth, full stop: it is the
// only state that survives a reload, it already carries what another tab
// wrote, and it holds no record another tab has deleted.
//
// The tempting alternative -- union it with this tab's module state, so a
// write localStorage refused still reaches the backup -- cannot work. A
// record that is in memory and not in storage is EITHER a write that failed
// here OR one another tab deleted whose `storage` event has not arrived yet,
// and nothing in the two states tells those apart. Unioning resurrects the
// deletion: a class the teacher removed on another tab comes back, PINs and
// all. A refused write is surfaced instead (storageHealth.js), which is the
// honest answer to the case the union was reaching for -- a teacher whose
// browser is not saving needs to be told so, not to have it quietly
// compensated for in one code path.
export function snapshotClasses() {
  return load().classes
}

// Whether two roster records are the same person. The salt is permanent and
// random per student (see addStudent), which makes it the identity that
// survives a PIN reset, a rename, and a trip through a backup file. Records
// old enough to predate salts fall back to the login name.
function sameStudent(a, b) {
  if (a.salt && b.salt) return a.salt === b.salt
  return a.name.trim().toLowerCase() === b.name.trim().toLowerCase()
}

// Highest sequence number any of these students was issued, so a merged class
// never hands out an ID that is already on a slip in someone's pocket.
function highestSeq(students) {
  return students.reduce((high, s) => {
    const suffix = Number.parseInt(String(s.sid ?? '').split('-').pop(), 10)
    return Number.isFinite(suffix) && suffix > high ? suffix : high
  }, 0)
}

/**
 * Restores classes from a backup.
 *
 * The rule is: a restore never removes and never rolls back. A class this
 * device does not have is taken whole. A class it does have keeps everything
 * it already holds -- its students, their current PINs, its settings -- and
 * only gains the students the backup has that it lacks.
 *
 * That asymmetry is deliberate. Restoring an older backup over a live class
 * used to replace the roster wholesale, which deleted every student added
 * since the backup along with their PINs, and regressed `seq` so the next
 * student added would reuse a departed one's ID. Preferring the device's copy
 * of a student it already has also means a restore cannot quietly undo a PIN
 * reset: the PIN on the slip in the student's pocket stays the one that works.
 *
 * Returns { added, updated, conflicts, persisted }. `updated` counts classes
 * that gained students back; `conflicts` lists students the restore refused to
 * guess about (see below); `persisted` is false when the write did not reach
 * localStorage, which save() alone would swallow.
 */
export function mergeClasses(incoming) {
  const list = Array.isArray(incoming) ? incoming.filter((c) => c && typeof c.cid === 'string') : []
  let added = 0
  let updated = 0
  let conflicts = []
  commit((cur) => {
    // `cur` is state re-read from storage at write time: the same truth the
    // snapshot uses, and what keeps this safe against another tab.
    const byCid = new Map(cur.classes.map((c) => [c.cid, c]))
    added = 0
    updated = 0
    conflicts = []
    for (const cls of list) {
      const device = byCid.get(cls.cid)
      if (!device) {
        added += 1
        byCid.set(cls.cid, { ...cls, settings: normalizeSettings(cls.settings) })
        continue
      }
      const held = new Map(device.students.map((s) => [s.sid, s]))
      const restored = []
      for (const student of cls.students ?? []) {
        const mine = held.get(student.sid)
        if (!mine) {
          restored.push(student)
        } else if (!sameStudent(mine, student)) {
          // Two devices that both restored this class start from the same
          // sequence, so each one's next student is issued the SAME id. The
          // two records are different people wearing one ID, and no rule here
          // can tell which the teacher meant. Filtering by id alone dropped
          // the incoming student's name, PIN and salt without a word; this
          // says so instead, and changes nothing.
          conflicts.push({
            className: device.name,
            sid: student.sid,
            onDevice: mine.name,
            inBackup: student.name,
          })
        }
      }
      const students = restored.length > 0 ? [...device.students, ...restored] : device.students
      // The sequence merges even when no student is restored, and that case
      // is not hypothetical: a device that issued an ID and then deleted that
      // student carries a `seq` higher than its roster shows. Restoring such a
      // backup onto an older copy with the same remaining students would
      // otherwise leave the lower sequence in place, and the next student
      // added would be handed the departed student's ID -- which the roster
      // still keys their progress rows by.
      const seq = Math.max(device.seq ?? 0, cls.seq ?? 0, highestSeq(students))
      if (restored.length === 0) {
        // Nothing to report to the teacher, and the class code still
        // describes this roster, so it is left alone.
        if (seq !== (device.seq ?? 0)) byCid.set(cls.cid, { ...device, seq })
        continue
      }
      updated += 1
      byCid.set(cls.cid, {
        ...device,
        students,
        seq,
        // The roster changed, so the code the teacher last generated no
        // longer describes this class -- same rule as every other roster
        // edit. rev outruns both copies so a code built before the restore
        // cannot be published over it.
        rev: Math.max(device.rev ?? 0, cls.rev ?? 0) + 1,
        code: '',
        codeAt: null,
      })
    }
    return { ...cur, classes: [...byCid.values()] }
  })
  // Not re-read and compared: save() knows whether its own write reached
  // localStorage, and that is the only thing that can say so without
  // inference. Every comparison tried here -- the id is present, the ids and
  // the sequence, the whole record -- was a guess about which differences
  // matter, and the first two were wrong.
  const persisted = lastWriteOk
  return { added, updated, conflicts, persisted }
}

// Wipes this store. Used when a teacher releases the device: their data must
// not outlive the credential that protected it.
export function clearAllClasses() {
  save({ classes: [] })
}

function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function useClasses() {
  return useSyncExternalStore(subscribe, () => state.classes)
}
