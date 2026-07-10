import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllUnits, getUnit } from '../content/index.js'
import { useProgress, useAssignments, getUnitProgress, isUnitComplete, importAssignment } from '../lib/progress.js'
import { isComplete } from '../lib/status.js'
import { decodeAssignment, assignmentStats } from '../lib/assignments.js'
import StatusIcon from '../components/StatusIcon.jsx'
import ImagePlaceholder from '../components/ImagePlaceholder.jsx'

// due is "YYYY-MM-DD"; parse as local date, not UTC midnight, so it never
// displays a day early/late depending on timezone. Same approach as
// SyncPage's formatDueDate.
function formatDueDate(due) {
  const [y, m, d] = due.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// "started" = touched in some way but not (yet) complete. Same rule used by
// StatusIcon/status.js's statusInfo().
function isUnitStarted(p) {
  return !!p && (p.lessonRead || p.quizAttempts > 0 || p.flashcardsReviewed || p.readSeconds > 0)
}

// Short "read · quiz 60% · cards pending" style summary for the continue card.
function progressSummary(p) {
  const parts = [p.lessonRead ? 'read' : 'lesson pending']
  parts.push(p.quizAttempts > 0 ? `quiz ${Math.round((p.bestQuizScore ?? 0) * 100)}%` : 'quiz pending')
  parts.push(p.flashcardsReviewed ? 'cards done' : 'cards pending')
  return parts.join(' · ')
}

const GRADE_BANDS = {
  'all': 'All grades',
  '7-8': '7th–8th grade',
  '9-10': '9th–10th grade',
  '11-12': '11th–12th grade',
}

// Most recently touched unit that's been started but isn't complete yet.
// Ignores grade-band/search filters — personal progress trumps filters.
function findContinueUnit() {
  const candidates = getAllUnits().filter((unit) => {
    const p = getUnitProgress(unit.id)
    return isUnitStarted(p) && !isComplete(p)
  })
  if (candidates.length === 0) return null
  // getAllUnits() is already sorted in the app's canonical order, so when
  // every candidate has touchedAt === 0 (e.g. progress imported from an
  // older sync code) this naturally falls back to the first one.
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

function AssignmentCard({ assignment }) {
  const { total, complete, nextUnitId } = assignmentStats(assignment, isUnitComplete)
  const allDone = total > 0 && complete === total
  const pct = total > 0 ? Math.round((complete / total) * 100) : 0
  const nextUnit = nextUnitId ? getUnit(nextUnitId) : null

  return (
    <div className="assignment-card">
      <div className="assignment-card-header">
        <h3>{assignment.name}</h3>
        {assignment.due && <span className="field-hint">Due {formatDueDate(assignment.due)}</span>}
      </div>
      {allDone ? (
        <p className="pill pill-done assignment-card-done">
          <span aria-hidden="true">✓</span> All done
        </p>
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
  return (
    <section className="my-lessons">
      <h2>My Lessons</h2>
      <div className="assignment-card-list">
        {assignments.map((a) => (
          <AssignmentCard key={a.name} assignment={a} />
        ))}
      </div>
    </section>
  )
}

function ClassCodeEntry() {
  const [pasted, setPasted] = useState('')
  const [result, setResult] = useState(null) // { ok, message }

  async function submit() {
    try {
      const assignment = await decodeAssignment(pasted)
      importAssignment(assignment)
      setPasted('')
      setResult(null)
    } catch (err) {
      setResult({ ok: false, message: err.message })
    }
  }

  return (
    <section className="class-code-entry">
      <h3>Have a class code from your teacher?</h3>
      <div className="class-code-entry-row">
        <label htmlFor="home-class-code" className="sr-only">
          Class code
        </label>
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
      {result && !result.ok && (
        <p className="import-error" role="status">
          {result.message}
        </p>
      )}
    </section>
  )
}

export default function HomePage() {
  useProgress() // re-render when progress changes
  const assignments = useAssignments()
  const continueUnit = findContinueUnit()

  return (
    <div className="page">
      <section className="home-hero">
        <div className="home-hero-image">
          <ImagePlaceholder
            asset="home-hero.webp"
            purpose="home hero image"
            ratio="21:9"
            background="white"
            description="A student athletic trainer taping an ankle on the sideline, first-aid kit open nearby — welcoming, hands-on scene that sets the tone for the app."
            location="public/images/home/"
            alt="A student athletic trainer taping an athlete's ankle on the sideline"
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

      {continueUnit ? <ContinueCard unit={continueUnit} /> : <StartCard />}

      {assignments.length === 0 && <ClassCodeEntry />}

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
