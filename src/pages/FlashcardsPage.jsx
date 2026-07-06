import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getUnit } from '../content/index.js'
import { markFlashcardsReviewed } from '../lib/progress.js'
import NotFoundPage from './NotFoundPage.jsx'

export default function FlashcardsPage() {
  const { unitId } = useParams()
  const unit = getUnit(unitId)

  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [seenLast, setSeenLast] = useState(false)

  if (!unit) return <NotFoundPage />
  const cards = unit.flashcards
  const card = cards[index]

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
        <Link to="/">Units</Link> / <Link to={`/unit/${unit.id}`}>{unit.title}</Link> /
        Flashcards
      </nav>
      <p className="quiz-progress">
        Card {index + 1} of {cards.length}
        {seenLast && ' · ✓ reviewed'}
      </p>
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
    </div>
  )
}
