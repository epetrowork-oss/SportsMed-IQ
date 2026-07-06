// Progress codes: a student's name + progress serialized to a copy/pasteable
// string. No server involved — codes move by hand (paste, email, LMS message),
// which keeps the app fully offline. Format: "SMIQ1." + base64url(JSON).

const PREFIX = 'SMIQ1.'

function toBase64Url(str) {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  bytes.forEach((b) => (binary += String.fromCharCode(b)))
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}

function fromBase64Url(b64) {
  const padded = b64.replaceAll('-', '+').replaceAll('_', '/')
  const binary = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4))
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function encodeProgress(name, units) {
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
  return PREFIX + toBase64Url(JSON.stringify({ name, units: compactUnits, at: Date.now() }))
}

// Returns { name, units, at } or throws with a user-readable message.
export function decodeProgressCode(code) {
  const trimmed = code.trim()
  if (!trimmed.startsWith(PREFIX)) {
    throw new Error('That does not look like a SportMedIQ code (should start with SMIQ1).')
  }
  let data
  try {
    data = JSON.parse(fromBase64Url(trimmed.slice(PREFIX.length)))
  } catch {
    throw new Error('Code is damaged or incomplete — copy the whole code and try again.')
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
