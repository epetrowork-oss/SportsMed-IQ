import { Link, useParams } from 'react-router-dom'
import { getUnit } from '../content/index.js'
import {
  useProgress,
  getUnitProgress,
  markLessonRead,
  PASS_THRESHOLD,
} from '../lib/progress.js'
import NotFoundPage from './NotFoundPage.jsx'

function Callout({ callout }) {
  return (
    <div className={`callout callout-${callout.type ?? 'tip'}`}>
      {callout.title && <strong>{callout.title}</strong>}
      <p>{callout.text}</p>
    </div>
  )
}

export default function UnitPage() {
  const { unitId } = useParams()
  useProgress()
  const unit = getUnit(unitId)
  if (!unit) return <NotFoundPage />

  const p = getUnitProgress(unit.id)
  const passed = (p.bestQuizScore ?? 0) >= PASS_THRESHOLD

  return (
    <div className="page page-narrow">
      <nav className="breadcrumb">
        <Link to="/">Units</Link> / {unit.title}
      </nav>
      <h1>{unit.title}</h1>
      <p className="unit-summary">{unit.summary}</p>

      <div className="unit-actions">
        <Link className="button" to={`/unit/${unit.id}/quiz`}>
          Take quiz
          {p.bestQuizScore != null &&
            ` · best ${Math.round(p.bestQuizScore * 100)}%${passed ? ' ✓' : ''}`}
        </Link>
        <Link className="button" to={`/unit/${unit.id}/flashcards`}>
          Flashcards{p.flashcardsReviewed ? ' ✓' : ''}
        </Link>
      </div>

      <article className="lesson">
        {unit.sections.map((section, i) => (
          <section key={i}>
            {section.heading && <h2>{section.heading}</h2>}
            {(section.body ?? []).map((paragraph, j) => (
              <p key={j}>{paragraph}</p>
            ))}
            {section.list && (
              <ul>
                {section.list.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            )}
            {section.callout && <Callout callout={section.callout} />}
          </section>
        ))}
      </article>

      <div className="lesson-footer">
        {p.lessonRead ? (
          <p className="done-note">✓ Marked as read</p>
        ) : (
          <button className="button button-primary" onClick={() => markLessonRead(unit.id)}>
            I've read this lesson
          </button>
        )}
        <Link className="button" to={`/unit/${unit.id}/quiz`}>
          Continue to quiz →
        </Link>
      </div>
    </div>
  )
}
