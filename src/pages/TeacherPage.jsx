import { useEffect, useMemo, useState } from 'react'
import { getAllUnits, getUnitsByCategory, getStandardsForUnit, getUnit } from '../content/index.js'
import { useProgress, getUnitProgress, PASS_THRESHOLD } from '../lib/progress.js'
import { useRoster, addStudentFromCode, removeStudent } from '../lib/roster.js'
import {
  useTeacherAssignments,
  saveTeacherAssignment,
  removeTeacherAssignment,
} from '../lib/teacherAssignments.js'
import { ASSIGNMENT_MODES } from '../lib/assignments.js'
import { isComplete, isFlagged, flagReasons, formatMinSec, statusInfo } from '../lib/status.js'
import StatusIcon from '../components/StatusIcon.jsx'
import mockRoster from '../content/mock/students.json'

// due is "YYYY-MM-DD"; parse as local date, not UTC midnight, so it never
// displays a day early/late depending on timezone (mirrors SyncPage).
function formatDueDate(due) {
  const [y, m, d] = due.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function completedCount(row, unitList) {
  return unitList.filter((u) => isComplete(row.progressFor(u.id))).length
}

function flagCount(row, unitList) {
  return unitList.filter((u) => isFlagged(row.progressFor(u.id))).length
}

function assignmentCompletion(row, assignment) {
  const total = assignment.unitIds.length
  const complete = assignment.unitIds.filter((id) => isComplete(row.progressFor(id))).length
  return { total, complete, pct: total ? Math.round((complete / total) * 100) : 0 }
}

// Wide CSV: one row per student, one column per saved assignment (% complete)
// followed by four columns per unit. Opens cleanly in Sheets/Excel for
// gradebooks. Per-unit format unchanged from the flat-table version.
function buildCsv(rows, units, assignments) {
  const esc = (v) => `"${String(v ?? '').replaceAll('"', '""')}"`
  const header = [
    'Student',
    ...assignments.map((a) => `«${a.name}» — % assigned complete`),
    ...units.flatMap((u) => [
      `${u.title} — status`,
      `${u.title} — best quiz %`,
      `${u.title} — reading min`,
      `${u.title} — % of lesson seen`,
    ]),
  ]
  const lines = rows.map((row) => {
    const cells = [row.name]
    for (const assignment of assignments) {
      cells.push(assignmentCompletion(row, assignment).pct)
    }
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

  // Appended reference section (not part of the per-student table above) so
  // a teacher can see which California standards each unit is tagged with
  // without widening every student row by another column per unit. Only
  // units with at least one resolvable standard get a line.
  const standardsRows = units
    .map((u) => ({ unit: u, standards: getStandardsForUnit(u) }))
    .filter(({ standards }) => standards.length > 0)
    .map(({ unit, standards }) =>
      [unit.title, standards.map((s) => `${s.framework.shortName} ${s.officialCode}`).join('; ')]
        .map(esc)
        .join(',')
    )
  const standardsSection =
    standardsRows.length > 0
      ? ['', 'Standards reference', ['Unit', 'Standards'].map(esc).join(','), ...standardsRows]
      : []

  return [header.map(esc).join(','), ...lines, ...standardsSection].join('\n')
}

function downloadCsv(rows, units, assignments) {
  const blob = new Blob([buildCsv(rows, units, assignments)], { type: 'text/csv;charset=utf-8' })
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

// --- shared drill-down building blocks ---

const GRADE_BAND_LABELS = { '7-8': '7th–8th', '9-10': '9th–10th', '11-12': '11th–12th' }

function GradeBandPill({ gradeBand }) {
  const label = GRADE_BAND_LABELS[gradeBand]
  if (!label) return null
  return <span className="pill pill-grade">{label}</span>
}

// One expandable card/accordion row: disclosure triangle, label, optional
// right-aligned meta content. Real button semantics, 44px min touch height.
function DrillRow({ level = 0, expanded, onToggle, label, right }) {
  return (
    <div
      className={expanded ? 'drill-row drill-row-expanded' : 'drill-row'}
      style={{ '--level': level }}
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onToggle()
        }
      }}
    >
      <span className={expanded ? 'drill-caret drill-caret-open' : 'drill-caret'} aria-hidden="true">
        ▸
      </span>
      <span className="drill-label">{label}</span>
      {right && <span className="drill-right">{right}</span>}
    </div>
  )
}

function CategoryHeading({ level = 0, children }) {
  return (
    <h3 className="drill-category-heading" style={{ '--level': level }}>
      {children}
    </h3>
  )
}

// --- assignment builder (teacher-authored class codes) ---

const MODE_INFO = {
  focus: { label: 'Focus', desc: 'students see only assigned lessons in the Library.' },
  open: { label: 'Open', desc: 'students can browse everything.' },
}

// Grade-band filter for the unit picker below — local component state only,
// deliberately not persisted/shared with the "By Lesson" pivot's grade-band
// filter (sportmediq:teacherGradeBand).
const BUILDER_GRADE_BANDS = [
  { id: 'all', label: 'All' },
  { id: '7-8', label: '7th–8th' },
  { id: '9-10', label: '9th–10th' },
  { id: '11-12', label: '11th–12th' },
]

function TeacherAssignments() {
  const savedAssignments = useTeacherAssignments()
  const unitsByCategory = useMemo(() => getUnitsByCategory(), [])

  const [name, setName] = useState('')
  const [selected, setSelected] = useState(() => new Set())
  const [mode, setMode] = useState('focus')
  const [due, setDue] = useState('')
  const [gradeBand, setGradeBand] = useState('all')

  const [generatedCode, setGeneratedCode] = useState('')
  const [generateError, setGenerateError] = useState('')
  const [copied, setCopied] = useState(false)

  const [copiedName, setCopiedName] = useState(null)
  const [confirmRemove, setConfirmRemove] = useState(null)

  function toggleUnit(id) {
    setSelected((cur) => {
      const next = new Set(cur)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function generate() {
    try {
      const entry = await saveTeacherAssignment({
        name,
        unitIds: [...selected],
        mode,
        due: due || undefined,
      })
      setGeneratedCode(entry.code)
      setGenerateError('')
      setName('')
      setSelected(new Set())
      setMode('focus')
      setDue('')
    } catch (err) {
      setGenerateError(err.message)
    }
  }

  async function copyGeneratedCode() {
    try {
      await navigator.clipboard.writeText(generatedCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked (some school browsers) — the textarea is selectable.
    }
  }

  async function copySavedCode(assignment) {
    try {
      await navigator.clipboard.writeText(assignment.code)
      setCopiedName(assignment.name)
      setTimeout(() => setCopiedName(null), 2000)
    } catch {
      // Clipboard blocked (some school browsers) — the textarea is selectable.
    }
  }

  return (
    <section className="teacher-assignments">
      <h2>Assignments</h2>
      <p className="field-hint">
        Build a class code for a set of lessons, then share it with students to paste into
        their Sync page.
      </p>

      <label className="assignment-field">
        Assignment name
        <input
          className="text-input"
          type="text"
          placeholder="e.g. Week 3 — Concussion unit"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      <div className="grade-band-picker" role="group" aria-label="Filter assignment lessons by grade">
        {BUILDER_GRADE_BANDS.map((band) => (
          <button
            key={band.id}
            type="button"
            className={
              gradeBand === band.id ? 'grade-band-button grade-band-button-active' : 'grade-band-button'
            }
            onClick={() => setGradeBand(band.id)}
            aria-pressed={gradeBand === band.id}
          >
            {band.label}
          </button>
        ))}
      </div>

      <div className="assignment-unit-picker">
        {unitsByCategory.map(({ category, units: catUnits }) => {
          const visible =
            gradeBand === 'all' ? catUnits : catUnits.filter((u) => u.gradeBand === gradeBand)
          if (visible.length === 0) return null
          return (
            <div key={category}>
              <CategoryHeading level={0}>{category}</CategoryHeading>
              {visible.map((unit) => (
                <label key={unit.id} className="assignment-unit-row">
                  <input
                    type="checkbox"
                    checked={selected.has(unit.id)}
                    onChange={() => toggleUnit(unit.id)}
                  />
                  <span className="assignment-unit-title">{unit.title}</span>
                  <GradeBandPill gradeBand={unit.gradeBand} />
                </label>
              ))}
            </div>
          )
        })}
      </div>

      <p className="field-hint">
        {selected.size} lesson{selected.size === 1 ? '' : 's'} selected
      </p>

      <div className="assignment-mode-picker" role="radiogroup" aria-label="Assignment mode">
        {ASSIGNMENT_MODES.map((m) => (
          <label key={m} className="assignment-mode-option">
            <input
              type="radio"
              name="assignment-mode"
              value={m}
              checked={mode === m}
              onChange={() => setMode(m)}
            />
            <span>
              <strong>{MODE_INFO[m].label}</strong> — {MODE_INFO[m].desc}
            </span>
          </label>
        ))}
      </div>

      <label className="assignment-field">
        Due date (optional)
        <input
          className="text-input"
          type="date"
          value={due}
          onChange={(e) => setDue(e.target.value)}
        />
      </label>

      <div className="unit-actions">
        <button
          className="button button-primary"
          onClick={generate}
          disabled={!name.trim() || selected.size === 0}
        >
          Generate class code
        </button>
      </div>
      <p className="field-hint">
        To edit a saved assignment, rebuild it here with the same name and generate again — it
        replaces the old code rather than creating a duplicate.
      </p>

      {generateError && (
        <p className="import-error" role="status">
          {generateError}
        </p>
      )}

      {generatedCode && (
        <>
          <textarea
            className="code-box"
            readOnly
            value={generatedCode}
            rows={4}
            onFocus={(e) => e.target.select()}
          />
          <div className="unit-actions">
            <button className="button button-primary" onClick={copyGeneratedCode}>
              {copied ? '✓ Copied' : 'Copy code'}
            </button>
          </div>
        </>
      )}

      {savedAssignments.length > 0 && (
        <div className="assignment-list">
          <h3>Saved assignments</h3>
          {savedAssignments.map((a) => {
            const titles = a.unitIds.map((id) => getUnit(id)?.title).filter(Boolean)
            return (
              <div key={a.name} className="assignment-item">
                <div className="assignment-item-main">
                  <strong>{a.name}</strong>
                  <span className="field-hint">
                    {titles.length} lesson{titles.length === 1 ? '' : 's'} &middot;{' '}
                    {a.mode === 'focus' ? 'Focus mode' : 'Open mode'}
                    {a.due ? ` · Due ${formatDueDate(a.due)}` : ''}
                  </span>
                  <span className="field-hint">{titles.join(', ')}</span>
                </div>
                <span className="unit-actions">
                  <button className="button" onClick={() => copySavedCode(a)}>
                    {copiedName === a.name ? '✓ Copied' : 'Copy code'}
                  </button>
                  {confirmRemove === a.name ? (
                    <>
                      <button
                        className="button button-danger"
                        onClick={() => {
                          removeTeacherAssignment(a.name)
                          setConfirmRemove(null)
                        }}
                      >
                        Confirm remove
                      </button>
                      <button className="button" onClick={() => setConfirmRemove(null)}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      className="remove-button"
                      onClick={() => setConfirmRemove(a.name)}
                      aria-label={`Remove ${a.name}`}
                      title={`Remove ${a.name}`}
                    >
                      ✕
                    </button>
                  )}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

// Bottom of every drill-down path: one student, one lesson. Same info the
// old flat table's expand-row showed, as a small definition list.
function LessonDetailPanel({ progress }) {
  const p = progress
  const readSeconds = p?.readSeconds ?? 0
  const scrollPct = p?.scrollPct ?? 0
  const reasons = flagReasons(p)
  const info = statusInfo(p)
  const attempts = p?.quizAttempts ?? 0
  return (
    <dl className="lesson-detail">
      <div className="lesson-detail-row">
        <dt>Lesson read</dt>
        <dd>{p?.lessonRead ? 'Read' : readSeconds > 0 ? 'Not marked read yet' : 'Not started'}</dd>
      </div>
      <div className="lesson-detail-row">
        <dt>Reading time</dt>
        <dd>{formatMinSec(readSeconds)}</dd>
      </div>
      <div className="lesson-detail-row">
        <dt>Deepest scroll seen</dt>
        <dd>{scrollPct}%</dd>
      </div>
      {reasons.length > 0 && (
        <div className="lesson-detail-row">
          <dt>Flags</dt>
          <dd className="detail-flag">⚠ {reasons.join('; ')}</dd>
        </div>
      )}
      <div className="lesson-detail-row">
        <dt>Flashcards</dt>
        <dd>{p?.flashcardsReviewed ? 'Reviewed' : 'Not reviewed'}</dd>
      </div>
      <div className="lesson-detail-row">
        <dt>Best quiz score</dt>
        <dd>
          {p?.bestQuizScore != null ? `${Math.round(p.bestQuizScore * 100)}%` : '—'}
          {` · ${attempts} attempt${attempts === 1 ? '' : 's'}`}
        </dd>
      </div>
      <div className="lesson-detail-row">
        <dt>Status</dt>
        <dd className={`status-dot status-${info.key}`}>
          {info.icon} {info.label}
        </dd>
      </div>
    </dl>
  )
}

// --- pivot views ---

// By Student: roster list → student's lessons grouped by category → lesson
// detail panel.
function ByStudentView({
  rows,
  unitsByCategory,
  units,
  teacherAssignments,
  openStudent,
  toggleStudent,
  openLesson,
  toggleLesson,
}) {
  return (
    <div className="drill-list">
      {rows.map((row) => {
        const expanded = openStudent === row.id
        const complete = completedCount(row, units)
        const flags = flagCount(row, units)
        return (
          <div key={row.id} className="drill-group">
            <DrillRow
              level={0}
              expanded={expanded}
              onToggle={() => toggleStudent(row.id)}
              label={row.name}
              right={
                <span className="drill-row-right">
                  <span className="drill-stat">
                    {complete}/{units.length} lessons complete
                  </span>
                  {flags > 0 && <span className="status-flag">{flags} ⚠</span>}
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
                </span>
              }
            />
            {expanded && (
              <div className="drill-children">
                {teacherAssignments.length > 0 && (
                  <div className="assignment-progress-block">
                    <CategoryHeading level={1}>Assignments</CategoryHeading>
                    {teacherAssignments.map((a) => {
                      const { total, complete, pct } = assignmentCompletion(row, a)
                      return (
                        <p key={a.name} className="assignment-progress-row">
                          «{a.name}» — {complete}/{total} lessons complete ({pct}%)
                        </p>
                      )
                    })}
                  </div>
                )}
                {unitsByCategory.map(({ category, units: catUnits }) => (
                  <div key={category}>
                    <CategoryHeading level={1}>{category}</CategoryHeading>
                    {catUnits.map((lesson) => {
                      const lessonExpanded = openLesson === lesson.id
                      const p = row.progressFor(lesson.id)
                      return (
                        <div key={lesson.id}>
                          <DrillRow
                            level={1}
                            expanded={lessonExpanded}
                            onToggle={() => toggleLesson(lesson.id)}
                            label={
                              <>
                                {lesson.title} <GradeBandPill gradeBand={lesson.gradeBand} />
                              </>
                            }
                            right={<StatusIcon progress={p} />}
                          />
                          {lessonExpanded && (
                            <div className="drill-detail-wrap" style={{ '--level': 2 }}>
                              <LessonDetailPanel progress={p} />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// By Unit (= category): class-wide rollup per category → student rows with
// their per-category stats → that student's lessons in the category →
// lesson detail panel.
function ByUnitView({
  rows,
  unitsByCategory,
  openCategory,
  toggleCategory,
  openStudent,
  toggleStudent,
  openLesson,
  toggleLesson,
}) {
  return (
    <div className="drill-list">
      {unitsByCategory.map(({ category, units: catUnits }) => {
        const expanded = openCategory === category
        const totalPossible = catUnits.length * rows.length
        const totalComplete = rows.reduce((sum, row) => sum + completedCount(row, catUnits), 0)
        const totalFlags = rows.reduce((sum, row) => sum + flagCount(row, catUnits), 0)
        return (
          <div key={category} className="drill-group">
            <DrillRow
              level={0}
              expanded={expanded}
              onToggle={() => toggleCategory(category)}
              label={category}
              right={
                <span className="drill-row-right">
                  <span className="drill-stat">
                    {totalComplete}/{totalPossible} lesson completions across class
                  </span>
                  {totalFlags > 0 && <span className="status-flag">{totalFlags} ⚠</span>}
                </span>
              }
            />
            {expanded && (
              <div className="drill-children">
                {rows.map((row) => {
                  const studentExpanded = openStudent === row.id
                  const studentComplete = completedCount(row, catUnits)
                  return (
                    <div key={row.id}>
                      <DrillRow
                        level={1}
                        expanded={studentExpanded}
                        onToggle={() => toggleStudent(row.id)}
                        label={row.name}
                        right={
                          <span className="drill-stat">
                            {studentComplete}/{catUnits.length} complete
                          </span>
                        }
                      />
                      {studentExpanded && (
                        <div className="drill-children">
                          {catUnits.map((lesson) => {
                            const lessonExpanded = openLesson === lesson.id
                            const p = row.progressFor(lesson.id)
                            return (
                              <div key={lesson.id}>
                                <DrillRow
                                  level={2}
                                  expanded={lessonExpanded}
                                  onToggle={() => toggleLesson(lesson.id)}
                                  label={
                                    <>
                                      {lesson.title} <GradeBandPill gradeBand={lesson.gradeBand} />
                                    </>
                                  }
                                  right={<StatusIcon progress={p} />}
                                />
                                {lessonExpanded && (
                                  <div className="drill-detail-wrap" style={{ '--level': 3 }}>
                                    <LessonDetailPanel progress={p} />
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// By Lesson: lessons grouped by category, with class-wide stats per lesson
// → student rows with their status on that lesson → lesson detail panel.
function ByLessonView({ rows, unitsByCategory, gradeBand, openLesson, toggleLesson, openStudent, toggleStudent }) {
  const groups = unitsByCategory
    .map(({ category, units: catUnits }) => ({
      category,
      units: gradeBand === 'all' ? catUnits : catUnits.filter((u) => u.gradeBand === gradeBand),
    }))
    .filter((g) => g.units.length > 0)

  return (
    <div className="drill-list">
      {groups.map(({ category, units: catUnits }) => (
        <div key={category} className="drill-group">
          <CategoryHeading level={0}>{category}</CategoryHeading>
          {catUnits.map((lesson) => {
            const expanded = openLesson === lesson.id
            const total = rows.length
            const completeN = rows.filter((r) => isComplete(r.progressFor(lesson.id))).length
            const attempted = rows.map((r) => r.progressFor(lesson.id)).filter((p) => (p?.quizAttempts ?? 0) > 0)
            const avgQuiz = attempted.length
              ? Math.round((attempted.reduce((s, p) => s + (p.bestQuizScore ?? 0), 0) / attempted.length) * 100)
              : null
            const flags = rows.filter((r) => isFlagged(r.progressFor(lesson.id))).length
            return (
              <div key={lesson.id}>
                <DrillRow
                  level={0}
                  expanded={expanded}
                  onToggle={() => toggleLesson(lesson.id)}
                  label={
                    <>
                      {lesson.title} <GradeBandPill gradeBand={lesson.gradeBand} />
                    </>
                  }
                  right={
                    <span className="drill-row-right">
                      <span className="drill-stat">
                        {completeN}/{total} complete
                        {avgQuiz != null ? ` · avg quiz ${avgQuiz}%` : ''}
                      </span>
                      {flags > 0 && <span className="status-flag">{flags} ⚠</span>}
                    </span>
                  }
                />
                {expanded && (
                  <div className="drill-children">
                    {rows.map((row) => {
                      const studentExpanded = openStudent === row.id
                      const p = row.progressFor(lesson.id)
                      return (
                        <div key={row.id}>
                          <DrillRow
                            level={1}
                            expanded={studentExpanded}
                            onToggle={() => toggleStudent(row.id)}
                            label={row.name}
                            right={<StatusIcon progress={p} />}
                          />
                          {studentExpanded && (
                            <div className="drill-detail-wrap" style={{ '--level': 2 }}>
                              <LessonDetailPanel progress={p} />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// --- page ---

const PIVOT_KEY = 'sportmediq:teacherPivot'
const PIVOTS = [
  { id: 'unit', label: 'By Unit' },
  { id: 'lesson', label: 'By Lesson' },
  { id: 'student', label: 'By Student' },
]

const GRADE_BAND_KEY = 'sportmediq:teacherGradeBand'
const GRADE_BANDS = [
  { id: 'all', label: 'All' },
  { id: '7-8', label: '7th–8th' },
  { id: '9-10', label: '9th–10th' },
  { id: '11-12', label: '11th–12th' },
]

export default function TeacherPage() {
  useProgress() // include this device's live progress
  const { students } = useRoster()
  const teacherAssignments = useTeacherAssignments()
  const units = getAllUnits()
  const unitsByCategory = useMemo(() => getUnitsByCategory(), [])
  const usingMock = students.length === 0
  const [sortBy, setSortBy] = useState('name') // name | completed | flags

  const [pivot, setPivot] = useState(() => {
    try {
      return localStorage.getItem(PIVOT_KEY) || 'student'
    } catch {
      return 'student'
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(PIVOT_KEY, pivot)
    } catch {
      // Storage full or blocked — pivot choice just won't persist.
    }
  }, [pivot])

  const [gradeBand, setGradeBand] = useState(() => {
    try {
      return localStorage.getItem(GRADE_BAND_KEY) || 'all'
    } catch {
      return 'all'
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(GRADE_BAND_KEY, gradeBand)
    } catch {
      // Storage full or blocked — filter still works for this session.
    }
  }, [gradeBand])

  // A single drill path shared by every pivot: level 0 (student/category/
  // lesson depending on pivot), level 1, level 2. Switching pivots collapses
  // everything since the ids mean different things in each pivot.
  const [open0, setOpen0] = useState(null)
  const [open1, setOpen1] = useState(null)
  const [open2, setOpen2] = useState(null)
  useEffect(() => {
    setOpen0(null)
    setOpen1(null)
    setOpen2(null)
  }, [pivot])
  const toggle0 = (id) => {
    setOpen0((cur) => (cur === id ? null : id))
    setOpen1(null)
    setOpen2(null)
  }
  const toggle1 = (id) => {
    setOpen1((cur) => (cur === id ? null : id))
    setOpen2(null)
  }
  const toggle2 = (id) => {
    setOpen2((cur) => (cur === id ? null : id))
  }

  // Real students imported by code; the mock roster only appears until the
  // first real student is added. The last row is always live from this device.
  const rows = useMemo(() => {
    const studentRows = (usingMock ? mockRoster.students : students).map((s) => ({
      id: s.id,
      name: s.name,
      removable: !usingMock,
      progressFor: (unitId) => s.progress[unitId],
    }))
    studentRows.sort((a, b) => {
      if (sortBy === 'completed') {
        const d = completedCount(b, units) - completedCount(a, units)
        if (d !== 0) return d
      }
      if (sortBy === 'flags') {
        const d = flagCount(b, units) - flagCount(a, units)
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
        A lesson is complete when it's read, its flashcards are reviewed, and the best quiz
        score is at least {Math.round(PASS_THRESHOLD * 100)}%. Click any row to drill down to a
        student's reading time, scroll depth, and quiz/flashcard status. A ⚠ means a lesson was
        marked read with under 2 minutes of reading time or with less than 80% of it seen.
        {usingMock &&
          ' Showing sample students — add a real student below and the samples disappear.'}
      </p>

      <div className="grade-band-picker" role="group" aria-label="Pivot the roster view">
        {PIVOTS.map((p) => (
          <button
            key={p.id}
            className={pivot === p.id ? 'grade-band-button grade-band-button-active' : 'grade-band-button'}
            onClick={() => setPivot(p.id)}
            aria-pressed={pivot === p.id}
          >
            {p.label}
          </button>
        ))}
      </div>

      {pivot === 'lesson' && (
        <div className="grade-band-picker" role="group" aria-label="Filter lessons by grade">
          {GRADE_BANDS.map((band) => (
            <button
              key={band.id}
              className={gradeBand === band.id ? 'grade-band-button grade-band-button-active' : 'grade-band-button'}
              onClick={() => setGradeBand(band.id)}
              aria-pressed={gradeBand === band.id}
            >
              {band.label}
            </button>
          ))}
        </div>
      )}

      <div className="table-toolbar">
        <label>
          Sort by{' '}
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">Name</option>
            <option value="completed">Lessons completed</option>
            <option value="flags">Flags first</option>
          </select>
        </label>
        <button className="button" onClick={() => downloadCsv(rows, units, teacherAssignments)}>
          Export CSV
        </button>
      </div>

      {pivot === 'student' && (
        <ByStudentView
          rows={rows}
          unitsByCategory={unitsByCategory}
          units={units}
          teacherAssignments={teacherAssignments}
          openStudent={open0}
          toggleStudent={toggle0}
          openLesson={open1}
          toggleLesson={toggle1}
        />
      )}
      {pivot === 'unit' && (
        <ByUnitView
          rows={rows}
          unitsByCategory={unitsByCategory}
          openCategory={open0}
          toggleCategory={toggle0}
          openStudent={open1}
          toggleStudent={toggle1}
          openLesson={open2}
          toggleLesson={toggle2}
        />
      )}
      {pivot === 'lesson' && (
        <ByLessonView
          rows={rows}
          unitsByCategory={unitsByCategory}
          gradeBand={gradeBand}
          openLesson={open0}
          toggleLesson={toggle0}
          openStudent={open1}
          toggleStudent={toggle1}
        />
      )}

      <TeacherAssignments />
      <AddStudentForm />
    </div>
  )
}
