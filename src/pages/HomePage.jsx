import { Link } from 'react-router-dom'
import { getUnitsByCategory } from '../content/index.js'
import { useProgress, getUnitProgress, isUnitComplete } from '../lib/progress.js'

function UnitCard({ unit }) {
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
    </Link>
  )
}

export default function HomePage() {
  useProgress() // re-render when progress changes
  const groups = getUnitsByCategory()

  return (
    <div className="page">
      <h1>Units</h1>
      {groups.length === 0 && (
        <p className="empty-note">
          No units yet. Add a JSON file to <code>src/content/units/</code> to create one.
        </p>
      )}
      {groups.map(({ category, units }) => (
        <section key={category} className="category-group">
          <h2>{category}</h2>
          <div className="unit-grid">
            {units.map((unit) => (
              <UnitCard key={unit.id} unit={unit} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
