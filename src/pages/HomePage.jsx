import { Link } from 'react-router-dom'
import { getAllUnits } from '../content/index.js'
import { useProgress, getUnitProgress } from '../lib/progress.js'
import { isComplete } from '../lib/status.js'
import StatusIcon from '../components/StatusIcon.jsx'
import ImagePlaceholder from '../components/ImagePlaceholder.jsx'

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

export default function HomePage() {
  useProgress() // re-render when progress changes
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

      {continueUnit ? <ContinueCard unit={continueUnit} /> : <StartCard />}

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
