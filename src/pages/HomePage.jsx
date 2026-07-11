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
import { decodeAssignment, assignmentStats, hasActiveFocusAssignment } from '../lib/assignments.js'
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

function findContinueUnit() {
  const candidates = getAllUnits().filter((unit) => {
    const p = getUnitProgress(unit.id)
    return isUnitStarted(p) && !isComplete(p)
  })
  if (candidates.length === 0) return null
  // getAllUnits() is already in canonical order, so when every candidate has
  // touchedAt === 0 (for example, older imported progress) the first wins.
  return candidates.reduce((best, unit) =>
    getUnitProgress(unit.id).touchedAt > getUnitProgress(best.id).touchedAt ? unit : best
  )
}

function ContinueCard({ unit }) {
  const p = getUnitProgress(unit.id)
  const gradeLabel = GRADE_BANDS[unit.gradeBand]
  return (
    <Link to={`/unit/${unit.id}`} className="continue-card">
      <span className="continue-kicker">Continue where you left off</span>
      <h2 className="continue-title">{unit.title}</h2>
      <div className="continue-meta">
        {gradeLabel && <span className="pill pill-grade">{gradeLabel}</span>}
        <StatusIcon progress={p} />
      </div>
      <p className="continue-summary">{progressSummary(p)}</p>
    </Link>
  )
}

function StartCard() {
  return (
    <Link to="/lessons" className="continue-card">
      <span className="continue-kicker">Get started</span>
      <h2 className="continue-title">Start your first lesson</h2>
      <p className="continue-summary">Browse the library to pick a topic and dive in.</p>
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

function AssignmentCard({ view }) {
  const { assignment, total, complete, nextUnitId, allDone } = view
  const pct = total > 0 ? Math.round((complete / total) * 100) : 0
  const nextUnit = nextUnitId ? getUnit(nextUnitId) : null
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
      {!allDone && nextUnit && (
        <Link to={`/unit/${nextUnit.id}`} className="button button-primary assignment-next-up">
          Next up: {nextUnit.title}
        </Link>
      )}
    </div>
  )
}

function MyLessons({ assignments }) {
  const views = sortAssignments(assignments)
  const active = views.filter((view) => !view.allDone)
  const completed = views.filter((view) => view.allDone)

  return (
    <section className="my-lessons">
      <h2>My Lessons</h2>
      <p className="field-hint">A lesson is complete after you read it, pass its quiz, and review its flashcards.</p>
      <div className="assignment-card-list">
        {active.map((view) => (
          <AssignmentCard key={view.assignment.name} view={view} />
        ))}
      </div>
      {completed.length > 0 && (
        <details className="standards-alignment">
          <summary>Completed assignments ({completed.length})</summary>
          <div className="assignment-card-list">
            {completed.map((view) => (
              <AssignmentCard key={view.assignment.name} view={view} />
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
      <h3>{hasAssignments ? 'Add another class code' : 'Have a class code from your teacher?'}</h3>
      <div className="class-code-entry-row">
        <label htmlFor="home-class-code" className="sr-only">Class code</label>
        <input
          id="home-class-code"
          type="text"
          className="text-input"
          placeholder="Paste your class code here"
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
  const focusMode = hasActiveFocusAssignment(assignments, isUnitComplete)
  const continueUnit = focusMode ? null : findContinueUnit()

  return (
    <div className="page">
      <section className="home-hero">
        <div className="home-hero-image">
          <ImagePlaceholder
            asset="home-hero.webp"
            purpose="home hero image"
            ratio="21:9"
            background="white"
            description="A red first-aid kit bag with a Star of Life emblem, water bottle, and athletic tape on the sideline of a sunlit stadium field — welcoming scene that sets the tone for the app."
            location="public/images/home/"
            alt="A red first-aid kit bag, water bottle, and athletic tape on the sideline of a stadium field"
          />
        </div>
        <div className="home-hero-text">
          <h1>SportMedIQ</h1>
          <p className="home-hero-tagline">
            Learn sports medicine skills, one lesson at a time — read a lesson, quiz yourself, and
            review flashcards, all saved right on your device.
          </p>
        </div>
      </section>

      {assignments.length > 0 && <MyLessons assignments={assignments} />}

      {!focusMode && (continueUnit ? <ContinueCard unit={continueUnit} /> : <StartCard />)}

      <GamificationPanel progress={progress} />

      <ClassCodeEntry hasAssignments={assignments.length > 0} />

      <Link to="/lessons" className="button button-primary home-browse-button">
        Browse the Library
      </Link>

      <div className="how-it-works">
        <div className="how-it-works-card">
          <h3>For students</h3>
          <p>
            Read the lesson, take the quiz, and review the flashcards. When you're ready to hand in
            proof of progress, share your progress code from <Link to="/sync">Sync</Link>.
          </p>
        </div>
        <div className="how-it-works-card">
          <h3>For teachers</h3>
          <p>
            Add student codes on the <Link to="/teacher">Teacher</Link> tab to see a class view of
            who's finished what.
          </p>
        </div>
      </div>
    </div>
  )
}
