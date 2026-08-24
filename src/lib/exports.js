// Teacher exports, tuned per office suite. Everything is CSV (the app takes
// no dependencies, and CSV is the one format Excel, Word tables, Google
// Sheets, Docs, Teams and Classroom all accept):
//
// - Microsoft flavor: UTF-8 with BOM + CRLF line endings. Excel needs the
//   BOM to read accents/arrows correctly when double-clicking a .csv; the
//   result pastes cleanly into Word tables and uploads into a Teams
//   assignment or OneDrive.
// - Google flavor: plain UTF-8 + LF, which Sheets/Docs/Classroom expect on
//   import (Sheets shows a stray BOM as a garbage first cell in some paths).
//
// Two layouts:
// - Detail export: the existing wide per-unit table (status/quiz/reading/
//   scroll per unit) + standards reference — the full evidence record.
// - Gradebook export: one row per student with % complete per assignment
//   and best quiz % per unit — shaped like the grade columns Teams and
//   Classroom gradebooks use, so a teacher can transfer grades by paste or
//   upload without hand-reshaping. (Neither LMS documents a public bulk
//   grade-import format; columns are student + one column per graded item,
//   which is what both export and accept via copy/paste.)

import { getStandardsForUnit } from '../content/index.js'
import { isComplete, isFlagged } from './status.js'

function esc(v) {
  return `"${String(v ?? '').replaceAll('"', '""')}"`
}

function toCsv(rows, eol) {
  return rows.map((cells) => cells.map(esc).join(',')).join(eol)
}

export function downloadTextFile(filename, text, { bom = false, mime = 'text/csv;charset=utf-8' } = {}) {
  const blob = new Blob([bom ? '\uFEFF' + text : text], { type: mime })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function assignmentPct(row, assignment) {
  const total = assignment.unitIds.length
  if (total === 0) return 0
  const complete = assignment.unitIds.filter((id) => isComplete(row.progressFor(id))).length
  return Math.round((complete / total) * 100)
}

// --- detail layout (the original wide CSV, unchanged columns) ---

function buildDetailRows(rows, units, assignments) {
  const header = [
    'Student',
    'Student ID',
    ...assignments.map((a) => `«${a.name}» — % assigned complete`),
    ...units.flatMap((u) => [
      `${u.title} — status`,
      `${u.title} — best quiz %`,
      `${u.title} — reading min`,
      `${u.title} — % of lesson seen`,
    ]),
  ]
  const lines = rows.map((row) => {
    const cells = [row.name, row.sid ?? '']
    for (const assignment of assignments) cells.push(assignmentPct(row, assignment))
    for (const unit of units) {
      const p = row.progressFor(unit.id)
      const started = p && (p.lessonRead || p.quizAttempts || p.flashcardsReviewed || p.readSeconds)
      let status = !started ? 'Not started' : isComplete(p) ? 'Complete' : 'In progress'
      if (isFlagged(p)) status += ' (flagged)'
      cells.push(
        status,
        p?.bestQuizScore != null ? Math.round(p.bestQuizScore * 100) : '',
        p?.readSeconds ? Math.round(p.readSeconds / 60) : started ? 0 : '',
        p?.scrollPct ? p.scrollPct : started ? 0 : '',
      )
    }
    return cells
  })

  // Appended standards reference (same as the original export): which
  // California standards each unit is tagged with, without widening every
  // student row.
  const standardsRows = units
    .map((u) => ({ unit: u, standards: getStandardsForUnit(u) }))
    .filter(({ standards }) => standards.length > 0)
    .map(({ unit, standards }) => [
      unit.title,
      standards.map((s) => `${s.framework.shortName} ${s.officialCode}`).join('; '),
    ])
  const standardsSection =
    standardsRows.length > 0 ? [[''], ['Standards reference'], ['Unit', 'Standards'], ...standardsRows] : []

  return [header, ...lines, ...standardsSection]
}

// --- gradebook layout (Teams/Classroom-shaped grade columns) ---

function buildGradebookRows(rows, units, assignments) {
  const header = [
    'Student',
    'Student ID',
    ...assignments.map((a) => `${a.name} (% complete)`),
    'Lessons complete',
    'Lessons total',
    ...units.map((u) => `${u.title} (best quiz %)`),
  ]
  const lines = rows.map((row) => {
    const complete = units.filter((u) => isComplete(row.progressFor(u.id))).length
    return [
      row.name,
      row.sid ?? '',
      ...assignments.map((a) => assignmentPct(row, a)),
      complete,
      units.length,
      ...units.map((u) => {
        const p = row.progressFor(u.id)
        return p?.bestQuizScore != null ? Math.round(p.bestQuizScore * 100) : ''
      }),
    ]
  })
  return [header, ...lines]
}

// --- public download functions ---
// rows: [{ name, sid?, progressFor(unitId) }] — the teacher page's roster rows.

export function downloadDetailCsvMicrosoft(rows, units, assignments) {
  downloadTextFile(
    `sportmediq-progress-excel-${today()}.csv`,
    toCsv(buildDetailRows(rows, units, assignments), '\r\n'),
    { bom: true },
  )
}

export function downloadDetailCsvGoogle(rows, units, assignments) {
  downloadTextFile(
    `sportmediq-progress-google-${today()}.csv`,
    toCsv(buildDetailRows(rows, units, assignments), '\n'),
  )
}

export function downloadGradebookCsvMicrosoft(rows, units, assignments) {
  downloadTextFile(
    `sportmediq-gradebook-teams-${today()}.csv`,
    toCsv(buildGradebookRows(rows, units, assignments), '\r\n'),
    { bom: true },
  )
}

export function downloadGradebookCsvGoogle(rows, units, assignments) {
  downloadTextFile(
    `sportmediq-gradebook-classroom-${today()}.csv`,
    toCsv(buildGradebookRows(rows, units, assignments), '\n'),
  )
}
