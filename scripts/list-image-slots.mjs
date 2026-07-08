// Shot-list generator: scans src/content/units/*.json for every image slot
// in the app — the 7 home-page category icons, one hero thumbnail per
// strand, and any per-section lesson diagrams — and prints a markdown table
// to stdout. This is the brief handed to the image author (currently
// ChatGPT, working in a separate session with its own repo access): one
// source of truth, two audiences (dev layout via ImagePlaceholder, and this
// shot list).
//
// Run with: npm run images:shotlist  (or: node scripts/list-image-slots.mjs)

import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const unitsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/content/units')

// Mirrors src/pages/HomePage.jsx's slugify — kept in sync by hand since this
// script has no build step to share a module with the React app.
function slugify(s) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function mdEscape(s) {
  return String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ')
}

const files = (await readdir(unitsDir)).filter((f) => f.endsWith('.json')).sort()
const units = []
for (const file of files) {
  try {
    units.push(JSON.parse(await readFile(path.join(unitsDir, file), 'utf8')))
  } catch {
    // Malformed JSON is the validator's job to catch; skip it here so the
    // shot list still generates from whatever units do parse.
  }
}

// slots: Map<asset, row>, insertion order preserved, de-duplicated by asset.
const slots = new Map()
const addSlot = (asset, row) => {
  if (!asset || slots.has(asset)) return
  slots.set(asset, row)
}

// 0. Home hero — a single fixed page-level asset with no content-JSON
// backing to derive it from, unlike the slots below. Kept in sync by hand
// with the <ImagePlaceholder> call in src/pages/HomePage.jsx.
addSlot('home-hero.webp', {
  asset: 'home-hero.webp',
  purpose: 'home hero image',
  ratio: '21:9',
  background: 'white',
  location: 'public/images/home/',
  text: 'None',
  description:
    'A student athletic trainer taping an ankle on the sideline, first-aid kit open nearby — welcoming, hands-on scene that sets the tone for the app.',
  alt: "A student athletic trainer taping an athlete's ankle on the sideline",
})

// 1. Category icons — one per unique category, derived from the string.
const categories = [...new Set(units.map((u) => u.category).filter(Boolean))].sort()
for (const category of categories) {
  const asset = `category-${slugify(category)}.webp`
  addSlot(asset, {
    asset,
    purpose: 'category icon',
    ratio: '1:1',
    background: 'transparent',
    location: 'public/images/categories/',
    text: 'None',
    description: `Simple flat icon representing ${category}`,
    alt: `${category} icon`,
  })
}

// 2. Unit card thumbnails — one hero per strand, shared across grade bands.
// When a strand has multiple grade-band units, prefer the 9-10 baseline
// version's title/summary for the brief (falls back to whichever sorts
// first by id if no 9-10 unit exists for that strand).
const strands = [...new Set(units.map((u) => u.strand).filter(Boolean))].sort()
for (const strand of strands) {
  const versions = units.filter((u) => u.strand === strand)
  const canonical = versions.find((u) => u.gradeBand === '9-10') ?? versions[0]
  const asset = `unit-${strand}-hero.webp`
  addSlot(asset, {
    asset,
    purpose: 'unit card thumbnail',
    ratio: '3:2',
    background: 'white',
    location: `public/images/units/${strand}/`,
    text: 'None',
    description: `Illustrative thumbnail for ${canonical.title}: ${canonical.summary}`,
    alt: `Thumbnail illustration for ${canonical.title}`,
  })
}

// 3. Lesson diagrams — optional per-section "image" objects.
for (const unit of units) {
  for (const section of unit.sections ?? []) {
    const img = section.image
    if (!img) continue
    addSlot(img.asset, {
      asset: img.asset,
      purpose: 'lesson diagram',
      ratio: img.ratio,
      background: img.background,
      location: img.location,
      text: 'None',
      description: img.description,
      alt: img.alt,
    })
  }
}

const rows = [...slots.values()]

console.log('| Asset | Purpose | Ratio | Background | Location | Text in image | Description | Alt text |')
console.log('|---|---|---|---|---|---|---|---|')
for (const r of rows) {
  console.log(
    `| ${mdEscape(r.asset)} | ${mdEscape(r.purpose)} | ${mdEscape(r.ratio)} | ${mdEscape(r.background)} | ${mdEscape(r.location)} | ${mdEscape(r.text)} | ${mdEscape(r.description)} | ${mdEscape(r.alt)} |`
  )
}

const counts = rows.reduce((acc, r) => {
  acc[r.purpose] = (acc[r.purpose] ?? 0) + 1
  return acc
}, {})
console.log('')
console.log(
  `${rows.length} image slot${rows.length === 1 ? '' : 's'} total: ` +
    Object.entries(counts)
      .map(([purpose, n]) => `${n} ${purpose}${n === 1 ? '' : 's'}`)
      .join(', ') +
    '.'
)
