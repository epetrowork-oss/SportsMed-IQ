import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getUnit } from '../content/index.js'
import {
  useProgress,
  getUnitProgress,
  markLessonRead,
  addReadingTime,
  recordScrollDepth,
  PASS_THRESHOLD,
} from '../lib/progress.js'
import NotFoundPage from './NotFoundPage.jsx'
import ImagePlaceholder from '../components/ImagePlaceholder.jsx'

// Accumulate reading time while the lesson is open AND the tab is visible.
// Each delta is capped so a laptop waking from sleep can't credit hours.
const FLUSH_MS = 5000
const MAX_DELTA_S = 30

function useReadingTimer(unitId) {
  useEffect(() => {
    if (!unitId) return
    let last = Date.now()
    const credit = () => {
      const now = Date.now()
      addReadingTime(unitId, Math.min((now - last) / 1000, MAX_DELTA_S))
      last = now
    }
    const tick = () => {
      if (document.visibilityState === 'visible') credit()
      else last = Date.now()
    }
    const onVisibility = () => {
      // Tab just hid: bank the visible time up to this moment.
      if (document.visibilityState === 'hidden') credit()
      else last = Date.now()
    }
    const interval = setInterval(tick, FLUSH_MS)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      if (document.visibilityState === 'visible') credit()
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [unitId])
}

function formatReadTime(seconds) {
  if (!seconds || seconds < 60) return seconds > 0 ? 'under 1 min' : null
  return `${Math.round(seconds / 60)} min`
}

// Track the deepest point of the lesson the student has scrolled to.
// Measured on scroll but only persisted every couple of seconds so
// scrolling never triggers store writes/re-renders per-event.
function useScrollDepth(unitId) {
  useEffect(() => {
    if (!unitId) return
    let maxPct = 0
    let savedPct = 0
    const measure = () => {
      const el = document.documentElement
      const scrollable = el.scrollHeight - el.clientHeight
      const pct =
        scrollable <= 0 ? 100 : Math.min(100, ((el.scrollTop + el.clientHeight) / el.scrollHeight) * 100)
      if (pct > maxPct) maxPct = pct
    }
    const flush = () => {
      if (maxPct > savedPct) {
        recordScrollDepth(unitId, maxPct)
        savedPct = maxPct
      }
    }
    measure() // a lesson shorter than the viewport counts as fully seen
    const interval = setInterval(flush, 2000)
    window.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure)
    return () => {
      measure()
      flush()
      clearInterval(interval)
      window.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
    }
  }, [unitId])
}

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
  useReadingTimer(unit ? unit.id : null)
  useScrollDepth(unit ? unit.id : null)
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
            {section.image && (
              <div className="lesson-image">
                <ImagePlaceholder
                  asset={section.image.asset}
                  purpose="lesson diagram"
                  ratio={section.image.ratio}
                  background={section.image.background}
                  description={section.image.description}
                  location={section.image.location}
                  alt={section.image.alt}
                />
              </div>
            )}
          </section>
        ))}
      </article>

      <div className="lesson-footer">
        {formatReadTime(p.readSeconds) && (
          <p className="read-time-note">
            Reading time: {formatReadTime(p.readSeconds)}
            {p.scrollPct > 0 && ` · ${p.scrollPct}% of lesson seen`}
          </p>
        )}
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
