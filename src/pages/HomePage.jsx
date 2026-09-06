import { homeHero } from '../content/homeHero.js'
import { nextLearningStep } from '../lib/learningPath.js'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllUnits, getUnit } from '../content/index.js'
import {
  useProgress,
  useAssignments,
  getUnitProgress,
  isUnitComplete,
  importAssignment,
  localDateKey,
} from '../lib/progress.js'
import { getGamificationSummary } from '../lib/gamification.js'
import { isComplete } from '../lib/status.js'
import { decodeAssignment, assignmentStats, hasActiveFocusAssignment, assignedUnitIds } from '../lib/assignments.js'
import { useStudentSession, isUnitVisible } from '../lib/studentSession.js'
import StatusIcon from '../components/StatusIcon.jsx'
import ImagePlaceholder from '../components/ImagePlaceholder.jsx'

// due is "YYYY-MM-DD"; parse as a local date, not UTC midnight, so it never
// displays a day early/late depending on timezone. Same approach as SyncPage.
function parseLocalDate(due) {
  const [y, m, d] = due.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatDueDate(due) {
  return parseLocalDate(due).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function startOfToday() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

function dueInfo(due, complete) {
  if (complete) return { label: 'Completed', className: 'pill pill-done' }
  if (!due) return null
  const days = Math.round((parseLocalDate(due) - startOfToday()) / 86400000)
  if (days < 0) return { label: 'Overdue', className: 'pill pill-progress' }
  if (days === 0) return { label: 'Due today', className: 'pill pill-progress' }
  if (days === 1) return { label: 'Due tomorrow', className: 'pill pill-progress' }
  if (days <= 7) return { label: `Due in ${days} days`, className: 'pill pill-grade' }
  return { label: `Due ${formatDueDate(due)}`, className: 'field-hint' }
}

// "Started" means the student has touched the lesson in some way but has not
// necessarily completed it. This matches the status rules used elsewhere.
function isUnitStarted(p) {
  return !!p && (p.lessonRead || p.quizAttempts > 0 || p.flashcardsReviewed || p.readSeconds > 0)
}

function progressSummary(p) {
  const parts = [p.lessonRead ? 'read' : 'lesson pending']
  parts.push(p.quizAttempts > 0 ? `quiz ${Math.round((p.bestQuizScore ?? 0) * 100)}%` : 'quiz pending')
  parts.push(p.flashcardsReviewed ? 'cards done' : 'cards pending')
  return parts.join(' · ')
}

const GRADE_BANDS = {
  all: 'All grades',
  '7-8': '7th–8th grade',
  '9-10': '9th–10th grade',
  '11-12': '11th–12th grade',
}

function findContinueUnit(controls) {
  const candidates = getAllUnits()
    .filter((unit) => !controls?.restricted || isUnitVisible(unit.id, controls))
    .filter((unit) => {
      const p = getUnitProgress(unit.id)
      return isUnitStarted(p) && !isComplete(p) && nextLearningStep(unit.id, p, controls).stage !== 'waiting'
    })
  if (candidates.length === 0) return null
  // getAllUnits() is already in canonical order, so when every candidate has
  // touchedAt === 0 (for example, older imported progress) the first wins.
  return candidates.reduce((best, unit) =>
    getUnitProgress(unit.id).touchedAt > getUnitProgress(best.id).touchedAt ? unit : best
  )
}

function ContinueCard({ unit, controls }) {
  const p = getUnitProgress(unit.id)
  const gradeLabel = GRADE_BANDS[unit.gradeBand]
  return (
    <Link to={nextLearningStep(unit.id, p, controls).to} className="continue-card">
      <span className="continue-kicker kicker">Continue where you left off</span>
      <h2 className="continue-title">{unit.title}</h2>
      <div className="continue-meta">
        {gradeLabel && <span className="pill pill-grade">{gradeLabel}</span>}
        <StatusIcon progress={p} />
      </div>
      <p className="continue-summary">{progressSummary(p)}</p>
      <span className="continue-action">{nextLearningStep(unit.id, p, controls).label} <span aria-hidden="true">→</span></span>
    </Link>
  )
}

function StartCard() {
  return (
    <Link to="/lessons" className="continue-card">
      <span className="continue-kicker kicker">Get started</span>
      <h2 className="continue-title">Find your next lesson</h2>
      <p className="continue-summary">Browse the library to choose an available topic.</p>
    </Link>
  )
}

function assignmentView(assignment) {
  const stats = assignmentStats(assignment, isUnitComplete)
  return { assignment, ...stats, allDone: stats.total > 0 && stats.complete === stats.total }
}

function sortAssignments(assignments) {
  return assignments.map(assignmentView).sort((a, b) => {
    if (a.allDone !== b.allDone) return a.allDone ? 1 : -1
    if (a.assignment.due && b.assignment.due) return a.assignment.due.localeCompare(b.assignment.due)
    if (a.assignment.due) return -1
    if (b.assignment.due) return 1
    return (a.assignment.createdAt ?? '').localeCompare(b.assignment.createdAt ?? '')
  })
}

function AssignmentCard({ view, controls }) {
  const { assignment, total, complete, allDone } = view
  const pct = total > 0 ? Math.round((complete / total) * 100) : 0
  const nextUnit = assignment.unitIds.map(getUnit).find((unit) => unit && isUnitVisible(unit.id, controls) && !isUnitComplete(unit.id))
  const nextStep = nextUnit ? nextLearningStep(nextUnit.id, getUnitProgress(nextUnit.id), controls) : null
  const due = dueInfo(assignment.due, allDone)

  return (
    <div className="assignment-card">
      <div className="assignment-card-header">
        <h3>{assignment.name}</h3>
        {due && <span className={due.className}>{due.label}</span>}
      </div>
      {allDone ? (
        <p className="assignment-progress-text">All {total} lessons complete.</p>
      ) : (
        <>
          <div
            className="assignment-progress-bar"
            role="progressbar"
            aria-valuenow={complete}
            aria-valuemin={0}
            aria-valuemax={total}
            aria-label={`${assignment.name} progress`}
          >
            <div className="assignment-progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <p className="assignment-progress-text">
            {complete} of {total} lesson{total === 1 ? '' : 's'} complete
          </p>
        </>
      )}
      {!allDone && (!nextUnit || nextStep?.stage === 'waiting') && <p className="field-hint">Your next step opens when your teacher updates class access.</p>}
      {!allDone && nextUnit && nextStep.stage !== 'waiting' && (
        <Link to={nextStep.to} className="button button-primary assignment-next-up">
          Next up: {nextUnit.title}
        </Link>
      )}
    </div>
  )
}

function MyLessons({ assignments, controls }) {
  const views = sortAssignments(assignments)
  const active = views.filter((view) => !view.allDone)
  const completed = views.filter((view) => view.allDone)

  return (
    <section className="my-lessons">
      <h2>My Lessons</h2>
      <p className="field-hint">A lesson is complete after you read it, pass its quiz, and review its flashcards.</p>
      <div className="assignment-card-list">
        {active.map((view) => (
          <AssignmentCard key={view.assignment.name} view={view} controls={controls} />
        ))}
      </div>
      {completed.length > 0 && (
        <details className="standards-alignment">
          <summary>Completed assignments ({completed.length})</summary>
          <div className="assignment-card-list">
            {completed.map((view) => (
              <AssignmentCard key={view.assignment.name} view={view} controls={controls} />
            ))}
          </div>
        </details>
      )}
    </section>
  )
}

function GamificationPanel({ progress }) {
  const summary = getGamificationSummary(progress, getAllUnits(), localDateKey())
  const nextText = summary.nextLevelXp == null
    ? 'Highest current level'
    : `${summary.nextLevelXp - summary.xp} XP to next level`

  return (
    <section className="assignment-card" aria-labelledby="home-achievements-heading">
      <div className="assignment-card-header">
        <h2 id="home-achievements-heading">Level {summary.level.level}: {summary.level.name}</h2>
        <span className="pill pill-grade">{summary.xp} XP</span>
      </div>
      <p className="assignment-progress-text">
        {nextText} · {summary.currentStreak}-day streak · {summary.earnedBadges.length} badge{summary.earnedBadges.length === 1 ? '' : 's'}
      </p>
      <Link to="/achievements" className="button">View achievements</Link>
    </section>
  )
}

function ClassCodeEntry({ hasAssignments = false }) {
  const [pasted, setPasted] = useState('')
  const [result, setResult] = useState(null)

  async function submit() {
    try {
      const assignment = await decodeAssignment(pasted)
      importAssignment(assignment)
      setPasted('')
      setResult({ ok: true, message: `Added ${assignment.name}.` })
    } catch (err) {
      setResult({ ok: false, message: err.message })
    }
  }

  return (
    <section className="class-code-entry">
      <h3>{hasAssignments ? 'Add another assignment' : 'Have an assignment code?'}</h3>
      <div className="class-code-entry-row">
        <label htmlFor="home-class-code" className="sr-only">Assignment code</label>
        <input
          id="home-class-code"
          type="text"
          className="text-input"
          placeholder="Paste your assignment code here"
          value={pasted}
          onChange={(e) => {
            setPasted(e.target.value)
            setResult(null)
          }}
        />
        <button className="button button-primary" onClick={submit} disabled={!pasted.trim()}>
          Add
        </button>
      </div>
      {result && (
        <p className={result.ok ? 'import-ok' : 'import-error'} role="status">{result.message}</p>
      )}
    </section>
  )
}

export default function HomePage() {
  const progress = useProgress()
  const assignments = useAssignments()
  const { session, controls } = useStudentSession()
  const focusMode = controls?.assignments !== false && hasActiveFocusAssignment(assignments, isUnitComplete)
  const continueUnit = focusMode ? null : findContinueUnit(controls)
  const hideAssignmentUi = !!(controls && !controls.assignments)

  const focusedIds = focusMode ? new Set(assignedUnitIds(assignments)) : null
  const visibleUnits = getAllUnits().filter((u) => isUnitVisible(u.id, controls) && (!focusMode || focusedIds.has(u.id)))
  const completed = visibleUnits.filter((u) => isUnitComplete(u.id)).length
  return (
    <div className="page dashboard-page">
      <header className="page-heading">
        <span className="kicker">YOUR LEARNING SPACE</span>
        <h1>{session ? `Welcome back, ${session.name}` : 'Your next step starts here'}</h1>
        <p>{controls?.className || 'Build your sports medicine knowledge, one lesson at a time.'}</p>
      </header>
      <div className="home-layout">
        <div>
          {!focusMode && (continueUnit ? <ContinueCard unit={continueUnit} controls={controls} /> : <StartCard />)}
          {!hideAssignmentUi && assignments.length > 0 && <MyLessons assignments={assignments} controls={controls} />}
          {focusMode && !assignments.length && <StartCard />}
          <section className="explore-panel">
            <div><span className="kicker">KEEP EXPLORING</span><h2>Knowledge for the sidelines</h2><p>Find a topic, build a skill, and put your learning into practice.</p>
            <Link to="/lessons" className="button">Explore the library →</Link></div>
            <ImagePlaceholder {...homeHero} />
          </section>
        </div>
        <aside className="home-sidebar" aria-label="Learning summary">
          <section className="summary-panel"><span className="kicker">YOUR PROGRESS</span><strong className="stat-number">{completed}<small> / {visibleUnits.length}</small></strong><p>Available lessons completed</p><Link to="/achievements">View progress →</Link></section>
          <GamificationPanel progress={progress} />
          <section className="help-panel"><h2>Ready to hand in your work?</h2><p>Share a progress code so your teacher can update their roster.</p><Link to="/sync">Share with your teacher →</Link></section>
          {!hideAssignmentUi && <details className="setup-details"><summary>Add an assignment</summary><ClassCodeEntry hasAssignments={assignments.length > 0} /></details>}
        </aside>
      </div>
    </div>
  )
}
