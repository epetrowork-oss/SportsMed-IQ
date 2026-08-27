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

function save(next) {
  state = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage full or blocked — keep working in memory.
  }
  listeners.forEach((fn) => fn())
}

function updateClass(cid, updater) {
  const cls = state.classes.find((c) => c.cid === cid)
  if (!cls) throw new Error('That class no longer exists on this device.')
  const next = updater(cls)
  save({ ...state, classes: state.classes.map((c) => (c.cid === cid ? next : c)) })
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
  if (state.classes.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
    throw new Error('A class with that name already exists.')
  }
  const cls = {
    cid: `c-${randomToken(6)}`,
    name: trimmed,
    createdAt: new Date().toISOString(),
    seq: 0,
    students: [], // [{ sid, name, pin, createdAt }]
    settings: defaultSettings(),
    code: '',
    codeAt: null,
  }
  save({ ...state, classes: [...state.classes, cls] })
  return cls
}

export function removeClass(cid) {
  save({ ...state, classes: state.classes.filter((c) => c.cid !== cid) })
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
    const student = { sid, name, pin: generatePin(), createdAt: new Date().toISOString() }
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
  const cls = state.classes.find((c) => c.cid === cid)
  if (!cls) throw new Error('That class no longer exists on this device.')
  if (cls.students.length === 0) throw new Error('Add at least one student first.')

  const settings = normalizeSettings(cls.settings)
  // Drop unit ids that no longer exist in this app version rather than
  // shipping dead references to student devices.
  if (settings.units) settings.units = settings.units.filter((id) => getUnit(id) !== null)

  const students = await Promise.all(
    cls.students.map(async (s) => {
      const salt = randomToken(6)
      return { sid: s.sid, name: s.name, salt, hash: await hashPin(salt, s.pin) }
    }),
  )

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
  updateClass(cid, (c) => ({ ...c, code, codeAt: payload.at }))
  return code
}

// Plain-text credential sheet the teacher can copy into a doc, print, and
// cut into slips. One line per student.
export function credentialSheetText(cls) {
  const header = `${cls.name} — SportMedIQ logins\nLogin name · Student ID · PIN\n`
  const lines = cls.students.map((s) => `${s.name} · ${s.sid} · ${s.pin}`)
  return header + lines.join('\n')
}

// --- React binding ---

function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function useClasses() {
  return useSyncExternalStore(subscribe, () => state.classes)
}
