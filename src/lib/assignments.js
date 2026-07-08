// Assignment ("class") codes: a teacher-built list of unit ids + a mode,
// serialized to a copy/pasteable string the same way progress codes are (see
// share.js) but with a distinct prefix so the two can never be confused by a
// student pasting into the wrong box.
//
// Format: "SMIQA1." + base64url(deflate-raw(UTF-8 JSON)). Reuses the exact
// compression helpers share.js's SMIQ2 progress-code format uses.
//
// Payload: { name, unitIds: string[], mode: "focus" | "open", due?:
// "YYYY-MM-DD", createdAt: ISO string }.

import { toBase64Url, fromBase64UrlBytes, deflate, inflate } from './share.js'
import { getUnit } from '../content/index.js'

const PREFIX = 'SMIQA1.'
const PROGRESS_PREFIXES = ['SMIQ2.', 'SMIQ1.']

export const ASSIGNMENT_MODES = ['focus', 'open']

// Thrown when a pasted code isn't a class code at all (wrong prefix), so
// callers can show a distinct message from "this is a class code but it's
// damaged/malformed".
export class WrongCodeTypeError extends Error {
  constructor(message) {
    super(message)
    this.name = 'WrongCodeTypeError'
  }
}

function isDueDateString(s) {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s)
}

// assignment: { name, unitIds, mode, due?, createdAt? }. createdAt defaults
// to now if omitted. Throws a plain Error with a friendly message if the
// shape is invalid.
export async function encodeAssignment(assignment) {
  const name = typeof assignment?.name === 'string' ? assignment.name.trim().slice(0, 60) : ''
  if (!name) throw new Error('Give the assignment a name.')

  const unitIds = Array.isArray(assignment?.unitIds) ? assignment.unitIds : []
  if (unitIds.length === 0) throw new Error('Pick at least one lesson to assign.')

  if (!ASSIGNMENT_MODES.includes(assignment?.mode))
    throw new Error('Assignment mode must be "focus" or "open".')

  const payload = {
    name,
    unitIds,
    mode: assignment.mode,
    createdAt: typeof assignment?.createdAt === 'string' ? assignment.createdAt : new Date().toISOString(),
  }
  if (isDueDateString(assignment?.due)) payload.due = assignment.due

  const json = JSON.stringify(payload)
  const compressed = await deflate(new TextEncoder().encode(json))
  return PREFIX + toBase64Url(compressed)
}

// Returns { name, unitIds, mode, due?, createdAt } or throws.
// - Throws WrongCodeTypeError if the code isn't SMIQA1 at all (including the
//   specific case of it looking like a student progress code).
// - Throws a plain Error for a damaged/truncated/malformed SMIQA1 payload, or
//   one where none of the assigned unitIds exist in this app version.
// Unit ids that don't exist in the content library are dropped; the
// assignment survives as long as at least one id remains.
export async function decodeAssignment(code) {
  const trimmed = (code ?? '').trim()

  if (!trimmed.startsWith(PREFIX)) {
    if (PROGRESS_PREFIXES.some((p) => trimmed.startsWith(p))) {
      throw new WrongCodeTypeError(
        'That looks like a student progress code, not a class code — paste it in the "Load a code" box above instead.'
      )
    }
    throw new WrongCodeTypeError(
      'That does not look like a SportMedIQ class code (should start with SMIQA1).'
    )
  }

  let data
  try {
    const compressed = fromBase64UrlBytes(trimmed.slice(PREFIX.length))
    const bytes = await inflate(compressed)
    data = JSON.parse(new TextDecoder().decode(bytes))
  } catch {
    throw new Error('Class code is damaged or incomplete — copy the whole code and try again.')
  }

  if (
    typeof data.name !== 'string' ||
    !data.name.trim() ||
    !Array.isArray(data.unitIds) ||
    data.unitIds.length === 0 ||
    !ASSIGNMENT_MODES.includes(data.mode)
  ) {
    throw new Error('Class code is damaged or incomplete — copy the whole code and try again.')
  }

  const unitIds = data.unitIds.filter((id) => typeof id === 'string' && getUnit(id) !== null)
  if (unitIds.length === 0) {
    throw new Error(
      "None of this class code's lessons exist in this app version — ask your teacher for an updated code."
    )
  }

  const result = {
    name: data.name.trim().slice(0, 60),
    unitIds,
    mode: data.mode,
    createdAt: typeof data.createdAt === 'string' ? data.createdAt : new Date().toISOString(),
  }
  if (isDueDateString(data.due)) result.due = data.due
  return result
}
