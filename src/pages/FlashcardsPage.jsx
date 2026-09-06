import LearningSteps from '../components/LearningSteps.jsx'
import { nextLearningStep } from '../lib/learningPath.js'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getUnit } from '../content/index.js'
import { markFlashcardsReviewed, getUnitProgress, useProgress } from '../lib/progress.js'
import { useClassControls, isUnitVisible } from '../lib/studentSession.js'
import NotFoundPage from './NotFoundPage.jsx'

export default function FlashcardsPage() {
  const { unitId } = useParams()
  const unit = getUnit(unitId)
  const controls = useClassControls()
  useProgress()

  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [seenLast, setSeenLast] = useState(false)

  if (!unit) return <NotFoundPage />

  if (controls && !isUnitVisible(unit.id, controls)) {
    return (
      <div className="page page-narrow gated-unavailable">
        <h1>This lesson isn't open yet</h1>
        <p>Your teacher hasn't unlocked it for your class yet.</p>
        <Link className="button" to="/lessons">
          Back to Library
        </Link>
      </div>
    )
  }
  const cards = unit.flashcards
  const card = cards[index]
  const nextStep = nextLearningStep(unit.id, { ...getUnitProgress(unit.id), flashcardsReviewed: true }, controls)

  function go(delta) {
    const next = Math.min(cards.length - 1, Math.max(0, index + delta))
    setIndex(next)
    setFlipped(false)
    if (next === cards.length - 1) {
      // Reaching the final card counts as a full review.
      setSeenLast(true)
      markFlashcardsReviewed(unit.id)
    }
  }

  if (!card) {
    return (
      <div className="page page-narrow">
        <p>This unit has no flashcards yet.</p>
        <Link className="button" to={`/unit/${unit.id}`}>
          Back to lesson
        </Link>
      </div>
    )
  }

  return (
    <div className="page page-narrow">
      <nav className="breadcrumb">
        <Link to="/lessons">Library</Link> / <Link to={`/unit/${unit.id}`}>{unit.title}</Link> /
        Flashcards
      </nav>
      <h1>Flashcard review</h1>
      <p className="unit-summary">{unit.title}</p>
      <LearningSteps unitId={unit.id} current="cards" />
      <p className="quiz-progress" role="status">
        Card {index + 1} of {cards.length}
        {seenLast && ' · ✓ reviewed'}
      </p>
      <div
        className="quiz-progress-bar"
        role="progressbar"
        aria-label="Flashcard deck position"
        aria-valuemin={1}
        aria-valuemax={cards.length}
        aria-valuenow={index + 1}
      >
        <div
          className="quiz-progress-fill"
          style={{ width: `${((index + 1) / cards.length) * 100}%` }}
        />
      </div>
      <button
        className={`flashcard ${flipped ? 'flashcard-flipped' : ''}`}
        onClick={() => setFlipped(!flipped)}
        aria-label={flipped ? 'Show front of card' : 'Show back of card'}
      >
        <span className="flashcard-label">{flipped ? 'Answer' : 'Prompt — tap to flip'}</span>
        <span className="flashcard-text">{flipped ? card.back : card.front}</span>
      </button>
      <div className="unit-actions">
        <button className="button" onClick={() => go(-1)} disabled={index === 0}>
          ← Previous
        </button>
        <button className="button" onClick={() => go(1)} disabled={index === cards.length - 1}>
          Next →
        </button>
      </div>
      {index === cards.length - 1 && <section className="completion-panel" aria-live="polite">
        <span className="kicker">REVIEW COMPLETE</span><h2>You reached the end of this deck</h2>
        <p>{nextStep.stage === 'complete' ? 'All three steps are complete. Your progress is saved on this device.' : nextStep.stage === 'waiting' ? 'Your quiz will open when your teacher updates class access.' : 'Keep going with your next learning step.'}</p>
        <Link className="button button-primary" onClick={() => markFlashcardsReviewed(unit.id)} to={nextStep.to}>{nextStep.label} →</Link>
      </section>}
    </div>
  )
}
