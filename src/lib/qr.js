// A QR encoder, written here because the app ships no third-party code and
// makes no network calls — a hosted QR image or a CDN library would break
// both rules, and the whole point of the class join code is that it works on
// a school Chromebook with the wi-fi off.
//
// Byte mode only, which is all a URL needs. Everything else follows ISO/IEC
// 18004: Reed-Solomon over GF(256), the standard block interleave, the eight
// mask patterns scored by the spec's four penalty rules.
//
// The two tables below are the parts that cannot be derived from anything —
// they are the spec's error-correction block structure. Every version and
// level was checked against an independent encoder and decoder while this was
// written (154 of 160 matrices byte-identical, the rest differing only in a
// tied mask choice; all 160 decoded), and scripts/qr-selftest.mjs pins the
// result as fingerprints so a later edit cannot quietly move them.

// --- GF(256), primitive polynomial x^8 + x^4 + x^3 + x^2 + 1 (0x11D) ---

const EXP = new Uint8Array(512)
const LOG = new Uint8Array(256)
{
  let x = 1
  for (let i = 0; i < 255; i += 1) {
    EXP[i] = x
    LOG[x] = i
    x <<= 1
    if (x & 0x100) x ^= 0x11d
  }
  for (let i = 255; i < 512; i += 1) EXP[i] = EXP[i - 255]
}

function mul(a, b) {
  return a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]]
}

// Generator polynomial for `degree` EC codewords: product of (x - a^i).
// Coefficients run highest power first; the leading 1 is implicit in use.
function rsGenerator(degree) {
  let poly = [1]
  for (let i = 0; i < degree; i += 1) {
    const root = EXP[i]
    const next = new Array(poly.length + 1).fill(0)
    for (let j = 0; j < poly.length; j += 1) {
      next[j] ^= poly[j]
      next[j + 1] ^= mul(poly[j], root)
    }
    poly = next
  }
  return poly
}

function rsRemainder(data, degree) {
  const gen = rsGenerator(degree)
  const out = new Uint8Array(degree)
  for (const byte of data) {
    const factor = byte ^ out[0]
    out.copyWithin(0, 1)
    out[degree - 1] = 0
    for (let i = 0; i < degree; i += 1) out[i] ^= mul(gen[i + 1], factor)
  }
  return out
}

// --- the spec's error-correction tables (index 0 unused) ---

const ECC_PER_BLOCK = {
  L: [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  M: [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  Q: [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  H: [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
}

const NUM_BLOCKS = {
  L: [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  M: [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  Q: [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  H: [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
}

const ECL_BITS = { L: 1, M: 0, Q: 3, H: 2 }
export const EC_LEVELS = ['L', 'M', 'Q', 'H']

// Total modules available for data + EC, before the function patterns are
// taken out. Straight from the spec's geometry, so no table is needed.
function rawDataModules(version) {
  let result = (16 * version + 128) * version + 64
  if (version >= 2) {
    const numAlign = Math.floor(version / 7) + 2
    result -= (25 * numAlign - 10) * numAlign - 55
    if (version >= 7) result -= 36
  }
  return result
}

function dataCodewords(version, ecl) {
  return (
    Math.floor(rawDataModules(version) / 8) -
    ECC_PER_BLOCK[ecl][version] * NUM_BLOCKS[ecl][version]
  )
}

// How many bytes of payload a version/level holds in byte mode, after the
// mode indicator and character count.
export function byteCapacity(version, ecl) {
  const headerBits = 4 + (version < 10 ? 8 : 16)
  return Math.floor((dataCodewords(version, ecl) * 8 - headerBits) / 8)
}

function alignmentCenters(version) {
  if (version === 1) return []
  const count = Math.floor(version / 7) + 2
  const step = version === 32 ? 26 : Math.ceil((version * 4 + 4) / (count * 2 - 2)) * 2
  const result = [6]
  for (let pos = version * 4 + 10; result.length < count; pos -= step) result.splice(1, 0, pos)
  return result
}

function bchRemainder(data, generator, bits) {
  let rem = data
  for (let i = 0; i < bits; i += 1) rem = (rem << 1) ^ ((rem >>> (bits - 1)) * generator)
  return rem
}

// --- encoding ---

function encodeSegment(bytes, version, ecl) {
  const bits = []
  const push = (value, length) => {
    for (let i = length - 1; i >= 0; i -= 1) bits.push((value >>> i) & 1)
  }
  push(0b0100, 4) // byte mode
  push(bytes.length, version < 10 ? 8 : 16)
  for (const b of bytes) push(b, 8)

  const capacityBits = dataCodewords(version, ecl) * 8
  push(0, Math.min(4, capacityBits - bits.length)) // terminator
  while (bits.length % 8 !== 0) bits.push(0)

  const out = []
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0
    for (let j = 0; j < 8; j += 1) byte = (byte << 1) | bits[i + j]
    out.push(byte)
  }
  // Alternating pad bytes, per the spec, until the data capacity is full.
  for (let pad = 0xec; out.length < capacityBits / 8; pad ^= 0xec ^ 0x11) out.push(pad)
  return out
}

function interleave(data, version, ecl) {
  const numBlocks = NUM_BLOCKS[ecl][version]
  const eccLen = ECC_PER_BLOCK[ecl][version]
  const total = dataCodewords(version, ecl)
  const shortLen = Math.floor(total / numBlocks)
  const numShort = numBlocks - (total % numBlocks)

  const blocks = []
  let at = 0
  for (let i = 0; i < numBlocks; i += 1) {
    const len = shortLen + (i < numShort ? 0 : 1)
    const dat = data.slice(at, at + len)
    at += len
    blocks.push({ dat, ecc: rsRemainder(dat, eccLen) })
  }

  const out = []
  for (let i = 0; i <= shortLen; i += 1) {
    for (const block of blocks) if (i < block.dat.length) out.push(block.dat[i])
  }
  for (let i = 0; i < eccLen; i += 1) {
    for (const block of blocks) out.push(block.ecc[i])
  }
  return out
}

// --- matrix ---

function newGrid(size, value) {
  return Array.from({ length: size }, () => new Array(size).fill(value))
}

function drawFunctionPatterns(modules, reserved, version) {
  const size = modules.length
  const set = (r, c, dark) => {
    if (r < 0 || c < 0 || r >= size || c >= size) return
    modules[r][c] = dark
    reserved[r][c] = true
  }
  // Marks a module as off-limits to data without touching its value — the
  // format-info band crosses the two timing modules at (8,6) and (6,8), and
  // overwriting those would break the timing pattern a scanner locks onto.
  const reserve = (r, c) => {
    if (r < 0 || c < 0 || r >= size || c >= size) return
    reserved[r][c] = true
  }

  // Timing patterns.
  for (let i = 0; i < size; i += 1) {
    set(6, i, i % 2 === 0)
    set(i, 6, i % 2 === 0)
  }

  // Finder patterns with their separators: concentric rings around each
  // centre, dark except the ring at distance 2 and the separator at 4.
  for (const [br, bc] of [[0, 0], [0, size - 7], [size - 7, 0]]) {
    for (let dr = -1; dr <= 7; dr += 1) {
      for (let dc = -1; dc <= 7; dc += 1) {
        const ring = Math.max(Math.abs(dr - 3), Math.abs(dc - 3))
        set(br + dr, bc + dc, ring !== 2 && ring !== 4)
      }
    }
  }

  // Alignment patterns, skipping the three that would sit on a finder.
  const centers = alignmentCenters(version)
  for (let i = 0; i < centers.length; i += 1) {
    for (let j = 0; j < centers.length; j += 1) {
      const skip =
        (i === 0 && j === 0) ||
        (i === 0 && j === centers.length - 1) ||
        (i === centers.length - 1 && j === 0)
      if (skip) continue
      for (let dr = -2; dr <= 2; dr += 1) {
        for (let dc = -2; dc <= 2; dc += 1) {
          set(centers[i] + dr, centers[j] + dc, Math.max(Math.abs(dr), Math.abs(dc)) !== 1)
        }
      }
    }
  }

  // Format information: reserved now, written once the mask is chosen.
  for (let i = 0; i < 9; i += 1) {
    reserve(8, i)
    reserve(i, 8)
  }
  for (let i = 0; i < 8; i += 1) {
    reserve(8, size - 1 - i)
    reserve(size - 1 - i, 8)
  }
  set(size - 8, 8, true) // the always-dark module

  // Version information (7 and up), in the two 3x6 blocks by the finders.
  if (version >= 7) {
    const bits = (version << 12) | bchRemainder(version, 0x1f25, 12)
    for (let i = 0; i < 18; i += 1) {
      const dark = ((bits >>> i) & 1) === 1
      set(Math.floor(i / 3), size - 11 + (i % 3), dark)
      set(size - 11 + (i % 3), Math.floor(i / 3), dark)
    }
  }
}

function drawFormatBits(modules, version, ecl, mask) {
  const size = modules.length
  const data = (ECL_BITS[ecl] << 3) | mask
  const bits = ((data << 10) | bchRemainder(data, 0x537, 10)) ^ 0x5412
  const bit = (i) => ((bits >>> i) & 1) === 1

  // First copy: down the left of the top-right finder, then along the top of
  // the bottom-left one.
  for (let i = 0; i <= 5; i += 1) modules[i][8] = bit(i)
  modules[7][8] = bit(6)
  modules[8][8] = bit(7)
  modules[8][7] = bit(8)
  for (let i = 9; i < 15; i += 1) modules[8][14 - i] = bit(i)

  // Second copy, so a damaged corner does not cost the reader the format.
  for (let i = 0; i < 8; i += 1) modules[8][size - 1 - i] = bit(i)
  for (let i = 8; i < 15; i += 1) modules[size - 15 + i][8] = bit(i)
  modules[size - 8][8] = true
}

function placeCodewords(modules, reserved, codewords) {
  const size = modules.length
  let bitIndex = 0
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5 // the vertical timing pattern column is skipped
    for (let vert = 0; vert < size; vert += 1) {
      for (let j = 0; j < 2; j += 1) {
        const col = right - j
        const upward = ((right + 1) & 2) === 0
        const row = upward ? size - 1 - vert : vert
        if (reserved[row][col]) continue
        const byte = codewords[bitIndex >>> 3]
        modules[row][col] = byte !== undefined && ((byte >>> (7 - (bitIndex & 7))) & 1) === 1
        bitIndex += 1
      }
    }
  }
}

function maskBit(mask, row, col) {
  switch (mask) {
    case 0: return (row + col) % 2 === 0
    case 1: return row % 2 === 0
    case 2: return col % 3 === 0
    case 3: return (row + col) % 3 === 0
    case 4: return (Math.floor(row / 2) + Math.floor(col / 3)) % 2 === 0
    case 5: return ((row * col) % 2) + ((row * col) % 3) === 0
    case 6: return (((row * col) % 2) + ((row * col) % 3)) % 2 === 0
    default: return (((row + col) % 2) + ((row * col) % 3)) % 2 === 0
  }
}

function applyMask(modules, reserved, mask) {
  const size = modules.length
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      if (!reserved[r][c] && maskBit(mask, r, c)) modules[r][c] = !modules[r][c]
    }
  }
}

// The spec's four penalty rules. Lower is better; the mask with the lowest
// total is the one a scanner will have the easiest time with.
function penalty(modules) {
  const size = modules.length
  let score = 0

  const runScore = (runLength) => (runLength >= 5 ? 3 + (runLength - 5) : 0)

  const finderLike = (line) => {
    // 1:1:3:1:1 surrounded by four light modules, in either direction.
    let count = 0
    for (let i = 0; i + 6 < size; i += 1) {
      const window = line.slice(i, i + 7).join('')
      if (window !== '1011101') continue
      const before = line.slice(Math.max(0, i - 4), i)
      const after = line.slice(i + 7, i + 11)
      const clear = (arr, need) => arr.length >= need && arr.every((v) => v === 0)
      if (clear(before, 4) || clear(after, 4)) count += 1
    }
    return count * 40
  }

  for (let r = 0; r < size; r += 1) {
    const row = []
    let run = 1
    for (let c = 0; c < size; c += 1) {
      row.push(modules[r][c] ? 1 : 0)
      if (c > 0) {
        if (modules[r][c] === modules[r][c - 1]) run += 1
        else {
          score += runScore(run)
          run = 1
        }
      }
    }
    score += runScore(run)
    score += finderLike(row)
  }

  for (let c = 0; c < size; c += 1) {
    const col = []
    let run = 1
    for (let r = 0; r < size; r += 1) {
      col.push(modules[r][c] ? 1 : 0)
      if (r > 0) {
        if (modules[r][c] === modules[r - 1][c]) run += 1
        else {
          score += runScore(run)
          run = 1
        }
      }
    }
    score += runScore(run)
    score += finderLike(col)
  }

  for (let r = 0; r + 1 < size; r += 1) {
    for (let c = 0; c + 1 < size; c += 1) {
      const v = modules[r][c]
      if (v === modules[r][c + 1] && v === modules[r + 1][c] && v === modules[r + 1][c + 1]) {
        score += 3
      }
    }
  }

  let dark = 0
  for (const row of modules) for (const v of row) if (v) dark += 1
  const percent = (dark * 100) / (size * size)
  score += Math.floor(Math.abs(percent - 50) / 5) * 10
  return score
}

function buildMatrix(bytes, version, ecl) {
  const size = version * 4 + 17
  const modules = newGrid(size, false)
  const reserved = newGrid(size, false)
  drawFunctionPatterns(modules, reserved, version)
  placeCodewords(modules, reserved, interleave(encodeSegment(bytes, version, ecl), version, ecl))

  let best = null
  for (let mask = 0; mask < 8; mask += 1) {
    applyMask(modules, reserved, mask)
    drawFormatBits(modules, version, ecl, mask)
    const score = penalty(modules)
    if (!best || score < best.score) {
      best = { mask, score, modules: modules.map((row) => row.slice()) }
    }
    applyMask(modules, reserved, mask) // masking is its own inverse
  }
  return { size, modules: best.modules, version, ecl, mask: best.mask }
}

/**
 * Encodes `text` as a QR matrix, choosing the smallest version that fits.
 *
 * `minEc` is the error-correction level to aim for; it is stepped down
 * (never below L) rather than refusing a payload that only fits at a lower
 * level, because a scannable code with less redundancy beats no code.
 * Returns null when the text does not fit at any version — the caller is
 * expected to fall back to the link.
 */
export function encodeQr(text, { minEc = 'M' } = {}) {
  const bytes = Array.from(new TextEncoder().encode(text))
  const order = EC_LEVELS.slice(0, EC_LEVELS.indexOf(minEc) + 1).reverse()
  for (const ecl of order) {
    for (let version = 1; version <= 40; version += 1) {
      if (bytes.length <= byteCapacity(version, ecl)) return buildMatrix(bytes, version, ecl)
    }
  }
  return null
}

/** Largest payload any QR code can carry, for callers that check first. */
export const MAX_QR_BYTES = byteCapacity(40, 'L')

// --- drawing ---

export const QUIET_ZONE = 4 // modules of margin the spec requires

// One SVG path covering every dark module, built as horizontal runs so a
// 150x150 symbol is a few hundred path commands instead of 20,000 rects.
export function qrPath(matrix, quiet = QUIET_ZONE) {
  const parts = []
  for (let r = 0; r < matrix.size; r += 1) {
    let run = 0
    for (let c = 0; c <= matrix.size; c += 1) {
      const dark = c < matrix.size && matrix.modules[r][c]
      if (dark) {
        run += 1
        continue
      }
      if (run > 0) {
        parts.push(`M${c - run + quiet} ${r + quiet}h${run}v1h-${run}z`)
        run = 0
      }
    }
  }
  return parts.join('')
}

// Standalone SVG markup, for the print window (which gets a written-out HTML
// document rather than React). Returns '' when the text will not fit.
export function qrSvgMarkup(text, { minEc = 'M', size = 340, label = 'QR code' } = {}) {
  const matrix = encodeQr(text, { minEc })
  if (!matrix) return ''
  const dim = matrix.size + QUIET_ZONE * 2
  const safeLabel = String(label).replace(/[<>&"]/g, '')
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dim} ${dim}" width="${size}" height="${size}"` +
    ` role="img" aria-label="${safeLabel}" shape-rendering="crispEdges">` +
    `<rect width="${dim}" height="${dim}" fill="#ffffff"/>` +
    `<path d="${qrPath(matrix)}" fill="#000000"/>` +
    `</svg>`
  )
}
