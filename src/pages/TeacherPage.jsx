import { useEffect, useMemo, useState } from 'react'
import { getAllUnits, getUnitsByCategory } from '../content/index.js'
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

function isFlagged(p) {
  return !!p?.lessonRead && ((p.readSeconds ?? 0) < LOW_READ_SECONDS || (p.scrollPct ?? 0) < LOW_SCROLL_PCT)
}

// Same flag logic as isFlagged, but spelled out as human-readable reasons
// for the lesson detail panel.
function flagReasons(p) {
  if (!p?.lessonRead) return []
  const readSeconds = p.readSeconds ?? 0
  const scrollPct = p.scrollPct ?? 0
  const reasons = []
  if (readSeconds < LOW_READ_SECONDS) reasons.push('marked read with under 2 minutes on the page')
  if (scrollPct < LOW_SCROLL_PCT) reasons.push(`marked read having seen only ${scrollPct}% of it`)
  return reasons
}

// min:sec for the detail panel.
function formatMinSec(seconds) {
  const total = Math.max(0, Math.round(seconds ?? 0))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function statusInfo(p) {
  const started = !!p && (p.lessonRead || p.quizAttempts || p.flashcardsReviewed || p.readSeconds)
  if (isComplete(p)) return { key: 'done', label: 'Complete', icon: '✓' }
  if (started) return { key: 'progress', label: 'In progress', icon: '●' }
  return { key: 'none', label: 'Not started', icon: '○' }
}

function completedCount(row, unitList) {
  return unitList.filter((u) => isComplete(row.progressFor(u.id))).length
}

function flagCount(row, unitList) {
  return unitList.filter((u) => isFlagged(row.progressFor(u.id))).length
}

// Wide CSV: one row per student, four columns per unit. Opens cleanly in
// Sheets/Excel for gradebooks. Format unchanged from the flat-table version.
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

// --- shared drill-down building blocks ---

const GRADE_BAND_LABELS = { '7-8': '7th–8th', '9-10': '9th–10th', '11-12': '11th–12th' }

function GradeBandPill({ gradeBand }) {
  const label = GRADE_BAND_LABELS[gradeBand]
  if (!label) return null
  return <span className="pill pill-grade">{label}</span>
}

function StatusIcon({ progress }) {
  const info = statusInfo(progress)
  const flagged = isFlagged(progress)
  return (
    <span className={`status-dot status-${info.key}`}>
      <span aria-hidden="true">{info.icon}</span> {info.label}
      {flagged && (
        <span className="status-flag" title="Marked read too quickly or without seeing all of it">
          {' '}
          ⚠
        </span>
      )}
    </span>
  )
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
function ByStudentView({ rows, unitsByCategory, units, openStudent, toggleStudent, openLesson, toggleLesson }) {
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
        <button className="button" onClick={() => downloadCsv(rows, units)}>
          Export CSV
        </button>
      </div>

      {pivot === 'student' && (
        <ByStudentView
          rows={rows}
          unitsByCategory={unitsByCategory}
          units={units}
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

      <AddStudentForm />
    </div>
  )
}
