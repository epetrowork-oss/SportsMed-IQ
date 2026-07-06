import { Fragment, useMemo, useState } from 'react'
import { getAllUnits } from '../content/index.js'
import { useProgress, getUnitProgress, PASS_THRESHOLD } from '../lib/progress.js'
import { useRoster, addStudentFromCode, removeStudent } from '../lib/roster.js'
import mockRoster from '../content/mock/students.json'

// Same completion rule as the student side.
function isComplete(p) {
  return (
    !!p &&
    p.lessonRead &&
    p.flashcardsReviewed &&
    (p.bestQuizScore ?? 0) >= PASS_THRESHOLD
  )
}

// A lesson marked read with under 2 minutes on the page — or without seeing
// at least 80% of it — gets flagged as a likely click-through.
const LOW_READ_SECONDS = 120
const LOW_SCROLL_PCT = 80

function readLabel(seconds) {
  if (!seconds || seconds < 60) return seconds > 0 ? '<1m' : null
  return `${Math.round(seconds / 60)}m`
}

function StatusCell({ progress }) {
  const readSeconds = progress?.readSeconds ?? 0
  const scrollPct = progress?.scrollPct ?? 0
  const time = readLabel(readSeconds)
  const lowTime = !!progress?.lessonRead && readSeconds < LOW_READ_SECONDS
  const lowScroll = !!progress?.lessonRead && scrollPct < LOW_SCROLL_PCT
  const flagged = lowTime || lowScroll
  const flagTitle = flagged
    ? [
        lowTime && 'Marked read with under 2 minutes on the lesson page',
        lowScroll && `Marked read having seen only ${scrollPct}% of the lesson`,
      ]
        .filter(Boolean)
        .join('. ')
    : undefined
  // Show the scroll depth whenever it tells the teacher something (<100%).
  const seen = scrollPct > 0 && scrollPct < 100 ? `${scrollPct}% seen` : null

  if (isComplete(progress)) {
    return (
      <td className={flagged ? 'cell-done cell-flag' : 'cell-done'} title={flagTitle}>
        ✓ Complete{time ? ` · ${time} read` : ''}
        {seen ? ` · ${seen}` : ''}
        {flagged ? ' ⚠' : ''}
      </td>
    )
  }
  if (
    !progress ||
    (!progress.lessonRead && !progress.quizAttempts && !progress.flashcardsReviewed && !readSeconds)
  ) {
    return <td className="cell-progress">Not started</td>
  }
  const parts = []
  if (progress.lessonRead)
    parts.push(`read ${time ?? '<1m'}${seen ? ` · ${seen}` : ''}${flagged ? ' ⚠' : ''}`)
  else if (time) parts.push(`${time} reading${seen ? ` · ${seen}` : ''}`)
  if (progress.bestQuizScore != null)
    parts.push(`quiz ${Math.round(progress.bestQuizScore * 100)}%`)
  if (progress.flashcardsReviewed) parts.push('cards')
  return (
    <td className={flagged ? 'cell-progress cell-flag' : 'cell-progress'} title={flagTitle}>
      {parts.join(' · ') || 'Started'}
    </td>
  )
}

function isFlagged(p) {
  return !!p?.lessonRead && ((p.readSeconds ?? 0) < LOW_READ_SECONDS || (p.scrollPct ?? 0) < LOW_SCROLL_PCT)
}

// Same flag logic as isFlagged/StatusCell, but spelled out as human-readable
// reasons for the per-student detail panel.
function flagReasons(p) {
  if (!p?.lessonRead) return []
  const readSeconds = p.readSeconds ?? 0
  const scrollPct = p.scrollPct ?? 0
  const reasons = []
  if (readSeconds < LOW_READ_SECONDS) reasons.push('marked read with under 2 minutes on the page')
  if (scrollPct < LOW_SCROLL_PCT) reasons.push(`marked read having seen only ${scrollPct}% of it`)
  return reasons
}

// min:sec, for the detail panel (StatusCell's readLabel above only needs
// whole minutes for the compact table cells).
function formatMinSec(seconds) {
  const total = Math.max(0, Math.round(seconds ?? 0))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function unitStatusLabel(p) {
  const started = !!p && (p.lessonRead || p.quizAttempts || p.flashcardsReviewed || p.readSeconds)
  if (!started) return 'Not started'
  return isComplete(p) ? 'Complete' : 'In progress'
}

// Full per-unit breakdown for one student, shown beneath their row.
function StudentDetail({ row, units }) {
  return (
    <div className="student-detail">
      <table className="student-detail-table">
        <thead>
          <tr>
            <th>Unit</th>
            <th>Lesson read</th>
            <th>Flashcards</th>
            <th>Best quiz</th>
            <th>Attempts</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {units.map((unit) => {
            const p = row.progressFor(unit.id)
            const readSeconds = p?.readSeconds ?? 0
            const scrollPct = p?.scrollPct ?? 0
            const reasons = flagReasons(p)
            return (
              <tr key={unit.id}>
                <td>{unit.title}</td>
                <td>
                  {p?.lessonRead ? 'Read' : readSeconds > 0 ? 'Not marked read' : '—'}
                  {' · '}
                  {formatMinSec(readSeconds)} · {scrollPct}% seen
                  {reasons.length > 0 && (
                    <div className="detail-flag">⚠ {reasons.join('; ')}</div>
                  )}
                </td>
                <td>{p?.flashcardsReviewed ? 'Reviewed' : 'Not reviewed'}</td>
                <td>{p?.bestQuizScore != null ? `${Math.round(p.bestQuizScore * 100)}%` : '—'}</td>
                <td>{p?.quizAttempts ?? 0}</td>
                <td>{unitStatusLabel(p)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// Wide CSV: one row per student, four columns per unit. Opens cleanly in
// Sheets/Excel for gradebooks.
function buildCsv(rows, units) {
  const esc = (v) => `"${String(v ?? '').replaceAll('"', '""')}"`
  const header = [
    'Student',
    ...units.flatMap((u) => [
      `${u.title} — status`,
      `${u.title} — best quiz %`,
      `${u.title} — reading min`,
      `${u.title} — % of lesson seen`,
    ]),
  ]
  const lines = rows.map((row) => {
    const cells = [row.name]
    for (const unit of units) {
      const p = row.progressFor(unit.id)
      const started =
        p && (p.lessonRead || p.quizAttempts || p.flashcardsReviewed || p.readSeconds)
      let status = !started ? 'Not started' : isComplete(p) ? 'Complete' : 'In progress'
      if (isFlagged(p)) status += ' (flagged)'
      cells.push(
        status,
        p?.bestQuizScore != null ? Math.round(p.bestQuizScore * 100) : '',
        p?.readSeconds ? Math.round(p.readSeconds / 60) : started ? 0 : '',
        p?.scrollPct ? p.scrollPct : started ? 0 : '',
      )
    }
    return cells.map(esc).join(',')
  })
  return [header.map(esc).join(','), ...lines].join('\n')
}

function downloadCsv(rows, units) {
  const blob = new Blob([buildCsv(rows, units)], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `sportmediq-progress-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

function AddStudentForm() {
  const [code, setCode] = useState('')
  const [result, setResult] = useState(null) // { ok, message }

  async function add() {
    try {
      const student = await addStudentFromCode(code)
      setResult({ ok: true, message: `Added ${student.name}.` })
      setCode('')
    } catch (err) {
      setResult({ ok: false, message: err.message })
    }
  }

  return (
    <section className="add-student">
      <h2>Add a student</h2>
      <p className="field-hint">
        Paste the progress code from the student's Sync page. Pasting a newer code for the
        same name updates their row.
      </p>
      <textarea
        className="code-box"
        placeholder="Paste a student's progress code (starts with SMIQ)"
        value={code}
        onChange={(e) => {
          setCode(e.target.value)
          setResult(null)
        }}
        rows={3}
      />
      <div className="unit-actions">
        <button className="button button-primary" onClick={add} disabled={!code.trim()}>
          Add student
        </button>
      </div>
      {result && (
        <p className={result.ok ? 'import-ok' : 'import-error'} role="status">
          {result.message}
        </p>
      )}
    </section>
  )
}

export default function TeacherPage() {
  useProgress() // include this device's live progress in the table
  const { students } = useRoster()
  const units = getAllUnits()
  const usingMock = students.length === 0
  const [sortBy, setSortBy] = useState('name') // name | completed | flags
  const [expandedId, setExpandedId] = useState(null)

  // Real students imported by code; the mock roster only appears until the
  // first real student is added. The last row is always live from this device.
  const rows = useMemo(() => {
    const studentRows = (usingMock ? mockRoster.students : students).map((s) => ({
      id: s.id,
      name: s.name,
      removable: !usingMock,
      progressFor: (unitId) => s.progress[unitId],
    }))
    const completedCount = (r) => units.filter((u) => isComplete(r.progressFor(u.id))).length
    const flagCount = (r) => units.filter((u) => isFlagged(r.progressFor(u.id))).length
    studentRows.sort((a, b) => {
      if (sortBy === 'completed') {
        const d = completedCount(b) - completedCount(a)
        if (d !== 0) return d
      }
      if (sortBy === 'flags') {
        const d = flagCount(b) - flagCount(a)
        if (d !== 0) return d
      }
      return a.name.localeCompare(b.name)
    })
    return [
      ...studentRows,
      {
        id: 'local',
        name: 'You (this device)',
        removable: false,
        progressFor: (unitId) => getUnitProgress(unitId),
      },
    ]
  }, [usingMock, students, units, sortBy])

  return (
    <div className="page">
      <h1>Teacher dashboard</h1>
      <p className="empty-note">
        A unit is complete when the lesson is read, the flashcards are reviewed, and the best
        quiz score is at least {Math.round(PASS_THRESHOLD * 100)}%. Each cell shows time spent
        on the lesson page and how much of it was scrolled into view; a ⚠ means the lesson was
        marked read with under 2 minutes of reading time or with less than 80% of it seen.
        {usingMock &&
          ' Showing sample students — add a real student below and the samples disappear.'}
      </p>

      <p className="empty-note">
        Completed:{' '}
        {units
          .map(
            (unit) =>
              `${unit.title} ${rows.filter((r) => isComplete(r.progressFor(unit.id))).length}/${rows.length}`,
          )
          .join(' · ')}
      </p>

      <div className="table-toolbar">
        <label>
          Sort by{' '}
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">Name</option>
            <option value="completed">Units completed</option>
            <option value="flags">Flags first</option>
          </select>
        </label>
        <button className="button" onClick={() => downloadCsv(rows, units)}>
          Export CSV
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              {units.map((unit) => (
                <th key={unit.id}>{unit.title}</th>
              ))}
              <th aria-label="Actions"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const expanded = expandedId === row.id
              const toggle = () => setExpandedId((id) => (id === row.id ? null : row.id))
              return (
                <Fragment key={row.id}>
                  <tr
                    className={expanded ? 'roster-row roster-row-expanded' : 'roster-row'}
                    onClick={toggle}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        toggle()
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-expanded={expanded}
                  >
                    <td>{row.name}</td>
                    {units.map((unit) => (
                      <StatusCell key={unit.id} progress={row.progressFor(unit.id)} />
                    ))}
                    <td>
                      {row.removable && (
                        <button
                          className="remove-button"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeStudent(row.id)
                          }}
                          aria-label={`Remove ${row.name}`}
                          title={`Remove ${row.name}`}
                        >
                          ✕
                        </button>
                      )}
                    </td>
                  </tr>
                  {expanded && (
                    <tr className="detail-row">
                      <td colSpan={units.length + 2}>
                        <StudentDetail row={row} units={units} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      <AddStudentForm />
    </div>
  )
}
