// Progress codes: a student's name + progress serialized to a copy/pasteable
// string. No server involved — codes move by hand (paste, email, LMS message),
// which keeps the app fully offline.
//
// Format v2 (current, always emitted): "SMIQ2." + base64url(deflate-raw(UTF-8
// JSON)). Compressed with the browser's built-in CompressionStream so codes
// stay short enough to comfortably copy/paste — no dependency needed.
// Format v1 (legacy, decode-only): "SMIQ1." + base64url(UTF-8 JSON), no
// compression. Codes students already have must keep importing forever, so
// decodeProgressCode still accepts them.

const PREFIX_V2 = 'SMIQ2.'
const PREFIX_V1 = 'SMIQ1.'

// The base64url + deflate-raw helpers below are exported so
// src/lib/assignments.js (SMIQA1 class codes) can reuse the exact same
// compression plumbing instead of duplicating it.

export function toBase64Url(bytes) {
  let binary = ''
  bytes.forEach((b) => (binary += String.fromCharCode(b)))
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}

export function fromBase64UrlBytes(b64) {
  const padded = b64.replaceAll('-', '+').replaceAll('_', '/')
  const binary = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4))
  return Uint8Array.from(binary, (c) => c.charCodeAt(0))
}

function fromBase64Url(b64) {
  return new TextDecoder().decode(fromBase64UrlBytes(b64))
}

export async function deflate(bytes) {
  const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

export async function inflate(bytes) {
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

export async function encodeProgress(name, units) {
  // Only carry fields the schema knows, so codes stay small and predictable.
  const compactUnits = {}
  for (const [unitId, p] of Object.entries(units)) {
    compactUnits[unitId] = {
      lessonRead: !!p.lessonRead,
      flashcardsReviewed: !!p.flashcardsReviewed,
      bestQuizScore: p.bestQuizScore ?? null,
      quizAttempts: p.quizAttempts ?? 0,
      readSeconds: Math.round(p.readSeconds ?? 0),
      scrollPct: Math.round(p.scrollPct ?? 0),
    }
  }
  const json = JSON.stringify({ name, units: compactUnits, at: Date.now() })
  const compressed = await deflate(new TextEncoder().encode(json))
  return PREFIX_V2 + toBase64Url(compressed)
}

// Returns { name, units, at } or throws with a user-readable message.
export async function decodeProgressCode(code) {
  const trimmed = code.trim()
  let data
  if (trimmed.startsWith(PREFIX_V2)) {
    try {
      const compressed = fromBase64UrlBytes(trimmed.slice(PREFIX_V2.length))
      const bytes = await inflate(compressed)
      data = JSON.parse(new TextDecoder().decode(bytes))
    } catch {
      throw new Error('Code is damaged or incomplete — copy the whole code and try again.')
    }
  } else if (trimmed.startsWith(PREFIX_V1)) {
    try {
      data = JSON.parse(fromBase64Url(trimmed.slice(PREFIX_V1.length)))
    } catch {
      throw new Error('Code is damaged or incomplete — copy the whole code and try again.')
    }
  } else if (trimmed.startsWith('SMIQA1.')) {
    throw new Error(
      'That looks like a class code, not a progress code — paste it in the "Class code" box instead.'
    )
  } else {
    throw new Error('That does not look like a SportMedIQ code (should start with SMIQ1 or SMIQ2).')
  }
  if (typeof data.name !== 'string' || typeof data.units !== 'object' || data.units === null) {
    throw new Error('Code is damaged or incomplete — copy the whole code and try again.')
  }
  const units = {}
  for (const [unitId, p] of Object.entries(data.units)) {
    if (typeof p !== 'object' || p === null) continue
    const score = typeof p.bestQuizScore === 'number' ? p.bestQuizScore : null
    units[unitId] = {
      lessonRead: !!p.lessonRead,
      flashcardsReviewed: !!p.flashcardsReviewed,
      bestQuizScore: score == null ? null : Math.min(1, Math.max(0, score)),
      quizAttempts: Number.isInteger(p.quizAttempts) && p.quizAttempts > 0 ? p.quizAttempts : 0,
      readSeconds:
        typeof p.readSeconds === 'number' && p.readSeconds > 0
          ? Math.round(Math.min(p.readSeconds, 60 * 60 * 24)) // sanity cap: one day
          : 0,
      scrollPct:
        typeof p.scrollPct === 'number' && p.scrollPct > 0
          ? Math.round(Math.min(p.scrollPct, 100))
          : 0,
    }
  }
  return { name: data.name.trim().slice(0, 60), units, at: data.at ?? null }
}
