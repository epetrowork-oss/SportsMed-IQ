import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getUnitsByCategory } from '../content/index.js'
import { useProgress, getUnitProgress, isUnitComplete } from '../lib/progress.js'

const GRADE_BAND_KEY = 'sportmediq:gradeBand'
const GRADE_BANDS = [
  { id: 'all', label: 'All grades' },
  { id: '7-8', label: '7th–8th' },
  { id: '9-10', label: '9th–10th' },
  { id: '11-12', label: '11th–12th' },
]

function GradeBandLabel({ gradeBand }) {
  const band = GRADE_BANDS.find((b) => b.id === gradeBand)
  if (!band) return null
  return <span className="pill pill-grade">{band.label} grade</span>
}

function UnitCard({ unit, showGradeBand }) {
  const p = getUnitProgress(unit.id)
  const complete = isUnitComplete(unit.id)

  return (
    <Link to={`/unit/${unit.id}`} className="unit-card">
      <div className="unit-card-top">
        <h3>{unit.title}</h3>
        {complete ? (
          <span className="pill pill-done">Complete</span>
        ) : p.lessonRead || p.quizAttempts > 0 || p.flashcardsReviewed ? (
          <span className="pill pill-progress">In progress</span>
        ) : null}
      </div>
      <p className="unit-summary">{unit.summary}</p>
      <div className="unit-meta">
        <span>{unit.minutes ? `~${unit.minutes} min` : ''}</span>
        <span>
          {unit.quiz.length} quiz questions · {unit.flashcards.length} flashcards
        </span>
      </div>
      {showGradeBand && <GradeBandLabel gradeBand={unit.gradeBand} />}
    </Link>
  )
}

export default function HomePage() {
  useProgress() // re-render when progress changes
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

  const groups = getUnitsByCategory()
    .map(({ category, units }) => ({
      category,
      units: gradeBand === 'all' ? units : units.filter((u) => u.gradeBand === gradeBand),
    }))
    .filter((g) => g.units.length > 0)

  return (
    <div className="page">
      <h1>Units</h1>
      <div className="grade-band-picker" role="group" aria-label="Filter by grade">
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
      {groups.length === 0 && (
        <p className="empty-note">
          {gradeBand === 'all'
            ? <>No units yet. Add a JSON file to <code>src/content/units/</code> to create one.</>
            : `No units yet for ${GRADE_BANDS.find((b) => b.id === gradeBand)?.label} grade.`}
        </p>
      )}
      {groups.map(({ category, units }) => (
        <section key={category} className="category-group">
          <h2>{category}</h2>
          <div className="unit-grid">
            {units.map((unit) => (
              <UnitCard key={unit.id} unit={unit} showGradeBand={gradeBand === 'all'} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
