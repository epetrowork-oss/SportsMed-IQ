#!/usr/bin/env node
// Regression gate for src/lib/qr.js.
//
// The encoder's error-correction tables are transcribed from ISO/IEC 18004 and
// cannot be derived from anything, so they need checking against something
// outside this file. Two independent checks do that:
//
//   1. Byte-mode capacities, which are published per version and level. They
//      fall out of the raw-module geometry and the EC tables together, so a
//      wrong table entry moves a capacity off its published value.
//   2. Matrix fingerprints. Every matrix below was compared module-for-module
//      against an independent encoder (node-qrcode) and round-tripped through
//      an independent decoder (jsQR) when these were recorded: 154 of 160
//      version/level combinations came back byte-identical, the other six
//      differed only in which of two equally-scoring masks was chosen, and
//      every one of the 160 decoded back to its exact payload. Neither library
//      is a dependency of this app — they were used once, here, to establish
//      that these fingerprints are right. From then on, this file is what
//      notices if a change to the encoder moves any of them.
//
// Run: npm run test:qr

import { createHash } from 'node:crypto'
import { encodeQr, byteCapacity } from '../src/lib/qr.js'

const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
const payload = (n) => Array.from({ length: n }, (_, i) => ALPHA[(i * 7 + 3) % ALPHA.length]).join('')

// Published byte-mode capacities (ISO/IEC 18004 table 7).
const CAPACITIES = [
  ['L', 1, 17], ['M', 1, 14], ['Q', 1, 11], ['H', 1, 7],
  ['L', 10, 271], ['M', 10, 213], ['Q', 10, 151], ['H', 10, 119],
  ['L', 25, 1273], ['M', 25, 997], ['Q', 25, 715], ['H', 25, 535],
  ['L', 40, 2953], ['M', 40, 2331], ['Q', 40, 1663], ['H', 40, 1273],
]

// [level, version, expected mask, sha256 of the module bits (first 16 hex)]
const FINGERPRINTS = [
  ['L', 1, 3, 'a29d9b18dfab12f5'],
  ['L', 2, 3, '233c0181cf2788ab'],
  ['L', 5, 3, '3c8d6da1b4c044b5'],
  ['L', 7, 2, '091e074568203d1b'],
  ['L', 10, 5, 'e73e2ef70546577e'],
  ['L', 15, 2, '7d8c378b263298d4'],
  ['L', 20, 2, 'b7c7a5726b82df15'],
  ['L', 23, 2, '03d6020c41d37578'],
  ['L', 27, 2, 'c879ab53a48896c1'],
  ['L', 32, 2, 'c98d2701c0821648'],
  ['L', 35, 2, '18b1ce828cd453f5'],
  ['L', 40, 2, '028732d1c7379f7a'],
  ['M', 1, 1, '2603b5276c1e535e'],
  ['M', 2, 1, 'ac54caf59facb483'],
  ['M', 5, 2, '6b926bd713534be4'],
  ['M', 7, 2, '72654b686c14f071'],
  ['M', 10, 1, '79db1517b53ac691'],
  ['M', 15, 2, '820d6e4de11f7185'],
  ['M', 20, 3, '16726785a48dd853'],
  ['M', 23, 2, 'c379e0358df04d2e'],
  ['M', 27, 3, 'de8d87d17e5666b7'],
  ['M', 32, 2, '849e49a1db110511'],
  ['M', 35, 2, 'c650e106ee972245'],
  ['M', 40, 2, 'ecc9e9c75415a767'],
  ['Q', 1, 0, '86703b5ac06296c9'],
  ['Q', 2, 6, '6efad589bdc2cc01'],
  ['Q', 5, 1, '9fa8688bb046ba1b'],
  ['Q', 7, 3, 'cfa4c08ae278df25'],
  ['Q', 10, 6, 'd4771e02c9ea0a12'],
  ['Q', 15, 6, '8d696ef0debd724e'],
  ['Q', 20, 6, '376762bde882afca'],
  ['Q', 23, 2, 'dc5e9fa069789e93'],
  ['Q', 27, 6, '60e2042d97a9f847'],
  ['Q', 32, 2, '69fd5fa32be0ff12'],
  ['Q', 35, 2, '7648924eb4ea96ec'],
  ['Q', 40, 2, 'bf23366afa79bb0a'],
  ['H', 1, 1, 'ecd6cbf0c7499371'],
  ['H', 2, 6, '6a0f7cbc3245555d'],
  ['H', 5, 2, '26cf42b10cbb8c03'],
  ['H', 7, 1, '3878400f7b71be27'],
  ['H', 10, 4, '7de7061df97c5f39'],
  ['H', 15, 7, '63ca7c8456ac0e65'],
  ['H', 20, 1, '521c170cff8c5a3e'],
  ['H', 23, 2, '636c74320ed95d46'],
  ['H', 27, 3, '3e43ec98aa950aab'],
  ['H', 32, 1, '50e70b04f8c6b6d1'],
  ['H', 35, 2, '7f4e8049555c8993'],
  ['H', 40, 1, 'e41eb9bdd2f5c3fe'],
]

let failures = 0
const fail = (message) => {
  console.error('FAIL', message)
  failures += 1
}

for (const [ecl, version, expected] of CAPACITIES) {
  const actual = byteCapacity(version, ecl)
  if (actual !== expected) fail(`capacity ${ecl}${version}: ${actual}, expected ${expected}`)
}

for (const [ecl, version, mask, digest] of FINGERPRINTS) {
  const text = payload(byteCapacity(version, ecl))
  const matrix = encodeQr(text, { minEc: ecl })
  if (!matrix) {
    fail(`${ecl}${version}: encoder returned null for a full-capacity payload`)
    continue
  }
  if (matrix.version !== version || matrix.ecl !== ecl) {
    fail(`${ecl}${version}: encoder chose ${matrix.ecl}${matrix.version}`)
    continue
  }
  if (matrix.size !== version * 4 + 17) {
    fail(`${ecl}${version}: size ${matrix.size}, expected ${version * 4 + 17}`)
    continue
  }
  if (matrix.mask !== mask) fail(`${ecl}${version}: mask ${matrix.mask}, expected ${mask}`)
  const bits = matrix.modules.map((row) => row.map((v) => (v ? '1' : '0')).join('')).join('')
  const actual = createHash('sha256').update(bits).digest('hex').slice(0, 16)
  if (actual !== digest) fail(`${ecl}${version}: matrix ${actual}, expected ${digest}`)
}

// A payload one byte past the largest symbol has nowhere to go, and the
// caller (the teacher dashboard) relies on null rather than an exception.
if (encodeQr('x'.repeat(byteCapacity(40, 'L') + 1), { minEc: 'L' }) !== null) {
  fail('an oversized payload should encode to null')
}

// Capacity is what forces the version up, so the boundary is worth pinning:
// exactly full stays, one more byte steps up a version.
{
  const cap = byteCapacity(5, 'M')
  if (encodeQr(payload(cap), { minEc: 'M' }).version !== 5) fail('full v5-M payload should stay at v5')
  if (encodeQr(payload(cap + 1), { minEc: 'M' }).version !== 6) fail('v5-M + 1 byte should step to v6')
}

// Below L there is nothing to step down to, so a payload that fits only at L
// must come back as L rather than as null.
{
  const onlyAtL = encodeQr(payload(byteCapacity(40, 'M') + 1), { minEc: 'M' })
  if (!onlyAtL || onlyAtL.ecl !== 'L') fail('a payload past M capacity should fall back to level L')
}

console.log(
  failures === 0
    ? `qr self-test: ${CAPACITIES.length} capacities and ${FINGERPRINTS.length} matrices OK`
    : `qr self-test: ${failures} failure(s)`,
)
process.exit(failures === 0 ? 1 - 1 : 1)
